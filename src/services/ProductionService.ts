import { ProductionStage, ProductionProgress, RejectRecord } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { ProductionProgressRepository } from '../repositories/ProductionProgressRepository';
import { RejectRecordRepository } from '../repositories/RejectRecordRepository';
import { OrderItemRepository } from '../repositories/OrderItemRepository';
import { ValidationResult } from '../types';

/**
 * Stage quantity summary
 */
export interface StageQuantitySummary {
  [stage: string]: number;
}

/**
 * Production Service
 * Business logic for production tracking
 */
export class ProductionService {
  private prisma: PrismaClient;
  private progressRepo: ProductionProgressRepository;
  private rejectRepo: RejectRecordRepository;
  private orderItemRepo: OrderItemRepository;

  constructor(
    prisma: PrismaClient,
    progressRepo: ProductionProgressRepository,
    rejectRepo: RejectRecordRepository,
    orderItemRepo: OrderItemRepository
  ) {
    this.prisma = prisma;
    this.progressRepo = progressRepo;
    this.rejectRepo = rejectRepo;
    this.orderItemRepo = orderItemRepo;
  }

  /**
   * Get the next stage in production flow
   */
  private getNextStage(currentStage: ProductionStage): ProductionStage | null {
    const stages = [
      ProductionStage.NOT_PROCESSED,
      ProductionStage.CUTTING,
      ProductionStage.SEWING,
      ProductionStage.QC,
      ProductionStage.FINISHING,
      ProductionStage.PACKING,
      ProductionStage.COMPLETE
    ];

    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === stages.length - 1) {
      return null;
    }

    return stages[currentIndex + 1];
  }

  /**
   * Check if stage progression is valid (must be sequential)
   */
  private isValidProgression(currentStage: ProductionStage, targetStage: ProductionStage): boolean {
    const nextStage = this.getNextStage(currentStage);
    return nextStage === targetStage;
  }

  /**
   * Calculate available quantity at a stage
   * Available = (total moved into stage) - (total moved out of stage)
   */
  async getAvailableQuantity(orderItemId: number, stage: ProductionStage): Promise<number> {
    const allProgress = await this.progressRepo.findByOrderItem(orderItemId);

    // For COMPLETE stage, all quantity is available
    if (stage === ProductionStage.COMPLETE) {
      const completeProgress = allProgress.filter(p => p.stage === ProductionStage.COMPLETE);
      return completeProgress.reduce((sum, p) => sum + p.quantity, 0);
    }

    // For NOT_PROCESSED stage, available is initial quantity minus what moved to CUTTING
    if (stage === ProductionStage.NOT_PROCESSED) {
      const orderItem = await this.orderItemRepo.findById(orderItemId);
      if (!orderItem) return 0;
      
      const movedOut = allProgress
        .filter(p => p.stage === ProductionStage.CUTTING)
        .reduce((sum, p) => sum + p.quantity, 0);
        
      return orderItem.quantity - movedOut;
    }

    // Get next stage
    const nextStage = this.getNextStage(stage);
    if (!nextStage) return 0;

    // Calculate: moved into stage
    const movedIn = allProgress
      .filter(p => p.stage === stage)
      .reduce((sum, p) => sum + p.quantity, 0);

    // Calculate: moved out of stage
    const movedOut = allProgress
      .filter(p => p.stage === nextStage)
      .reduce((sum, p) => sum + p.quantity, 0);

    return movedIn - movedOut;
  }

  /**
   * Record production progress (basic stage progression)
   */
  async recordProgress(orderItemId: number, toStage: ProductionStage, quantity: number): Promise<ProductionProgress> {
    // Validate order item exists
    const orderItem = await this.orderItemRepo.findById(orderItemId);
    if (!orderItem) {
      throw new Error(`Order item ${orderItemId} not found`);
    }

    // Validate stage progression
    if (!this.isValidProgression(orderItem.currentStage, toStage)) {
      throw new Error(
        `Invalid stage progression from ${orderItem.currentStage} to ${toStage}. ` +
        `Next stage should be ${this.getNextStage(orderItem.currentStage)}`
      );
    }

    // Validate quantity
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Get available quantity from current stage
    const available = await this.getAvailableQuantity(orderItemId, orderItem.currentStage);
    if (quantity > available) {
      throw new Error(
        `Cannot move ${quantity} items. Only ${available} available at stage ${orderItem.currentStage}`
      );
    }

    // Create progress record and update order item in transaction
    return this.prisma.$transaction(async (tx) => {
      // Create progress record
      const progress = await tx.productionProgress.create({
        data: {
          orderItemId,
          stage: toStage,
          quantity
        }
      });

      // Update order item current stage
      await tx.orderItem.update({
        where: { id: orderItemId },
        data: { currentStage: toStage }
      });

      return progress;
    });
  }

  /**
   * Record QC progress with pass/reject handling
   */
  async recordQCProgress(
    orderItemId: number,
    passedQuantity: number,
    rejectedQuantity: number
  ): Promise<{ progress: ProductionProgress; reject?: RejectRecord }> {
    // Validate order item exists and is at QC stage
    const orderItem = await this.orderItemRepo.findById(orderItemId);
    if (!orderItem) {
      throw new Error(`Order item ${orderItemId} not found`);
    }

    if (orderItem.currentStage !== ProductionStage.QC) {
      throw new Error(`Order item must be at QC stage. Current stage: ${orderItem.currentStage}`);
    }

    // Validate quantities
    if (passedQuantity < 0 || rejectedQuantity < 0) {
      throw new Error('Quantities cannot be negative');
    }

    if (passedQuantity === 0 && rejectedQuantity === 0) {
      throw new Error('At least one quantity must be greater than 0');
    }

    // Get available quantity at QC
    const available = await this.getAvailableQuantity(orderItemId, ProductionStage.QC);
    const total = passedQuantity + rejectedQuantity;

    if (total > available) {
      throw new Error(
        `Cannot process ${total} items. Only ${available} available at QC stage`
      );
    }

    // Create all records in transaction
    return this.prisma.$transaction(async (tx) => {
      let progress: ProductionProgress;
      let reject: RejectRecord | undefined;

      // 1. Move passed quantity to FINISHING
      if (passedQuantity > 0) {
        progress = await tx.productionProgress.create({
          data: {
            orderItemId,
            stage: ProductionStage.FINISHING,
            quantity: passedQuantity
          }
        });
      }

      // 2. Create reject record if any rejections
      if (rejectedQuantity > 0) {
        reject = await tx.rejectRecord.create({
          data: {
            orderItemId,
            quantity: rejectedQuantity,
            fromStage: ProductionStage.QC
          }
        });

        // 3. Move rejected quantity back to SEWING (rework)
        await tx.productionProgress.create({
          data: {
            orderItemId,
            stage: ProductionStage.SEWING,
            quantity: rejectedQuantity
          }
        });
      }

      // 4. Update order item current stage
      // If we have passed items, stage is FINISHING
      // If only rejects, stage stays at SEWING (for rework)
      const newStage = passedQuantity > 0 ? ProductionStage.FINISHING : ProductionStage.SEWING;
      await tx.orderItem.update({
        where: { id: orderItemId },
        data: { currentStage: newStage }
      });

      return { progress: progress!, reject };
    });
  }

  /**
   * Get progress summary for an order item (quantities by stage)
   */
  async getProgressSummary(orderItemId: number): Promise<StageQuantitySummary> {
    const stages = [
      ProductionStage.NOT_PROCESSED,
      ProductionStage.CUTTING,
      ProductionStage.SEWING,
      ProductionStage.QC,
      ProductionStage.FINISHING,
      ProductionStage.PACKING,
      ProductionStage.COMPLETE
    ];

    const summary: StageQuantitySummary = {};

    for (const stage of stages) {
      summary[stage] = await this.getAvailableQuantity(orderItemId, stage);
    }

    return summary;
  }

  /**
   * Get progress history for an order item
   */
  async getProgressByOrderItem(orderItemId: number): Promise<ProductionProgress[]> {
    return this.progressRepo.findByOrderItem(orderItemId);
  }

  /**
   * Get reject history for an order item
   */
  async getRejectHistory(orderItemId: number): Promise<RejectRecord[]> {
    return this.rejectRepo.findByOrderItem(orderItemId);
  }

  /**
   * Validate stage progression
   */
  async validateStageProgression(
    orderItemId: number,
    stage: ProductionStage,
    quantity: number
  ): Promise<ValidationResult> {
    const orderItem = await this.orderItemRepo.findById(orderItemId);
    if (!orderItem) {
      return { valid: false, error: `Order item ${orderItemId} not found` };
    }

    if (!this.isValidProgression(orderItem.currentStage, stage)) {
      return {
        valid: false,
        error: `Invalid stage progression from ${orderItem.currentStage} to ${stage}`
      };
    }

    const available = await this.getAvailableQuantity(orderItemId, orderItem.currentStage);
    if (quantity > available) {
      return {
        valid: false,
        error: `Cannot move ${quantity} items. Only ${available} available`
      };
    }

    return { valid: true };
  }
}
