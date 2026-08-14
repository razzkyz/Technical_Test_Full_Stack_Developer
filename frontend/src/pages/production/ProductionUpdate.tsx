import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface OrderItem {
  id: number;
  quantity: number;
  currentStage: string;
  order: {
    orderNumber: string;
    customer: {
      name: string;
    };
  };
  product: {
    code: string;
    name: string;
    color: string;
    size: string;
  };
}

interface ProgressRecord {
  id: number;
  stage: string;
  quantity: number;
  recordedAt: string;
}

interface StageQuantity {
  stage: string;
  total: number;
  available: number;
}

const ProductionUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderItem, setOrderItem] = useState<OrderItem | null>(null);
  const [progressHistory, setProgressHistory] = useState<ProgressRecord[]>([]);
  const [stageSummary, setStageSummary] = useState<StageQuantity[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [quantity, setQuantity] = useState(0);
  const [passedQuantity, setPassedQuantity] = useState(0);
  const [rejectedQuantity, setRejectedQuantity] = useState(0);

  const stages = ['NOT_PROCESSED', 'CUTTING', 'SEWING', 'QC', 'FINISHING', 'PACKING', 'COMPLETE'];

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get order item details (assuming you have this endpoint)
      const itemResponse = await api.get(`/orders/${id}`);
      
      // For now, we'll assume the response structure
      // You might need to adjust based on actual API
      if (itemResponse.data && itemResponse.data.items && itemResponse.data.items.length > 0) {
        const item = itemResponse.data.items[0];
        setOrderItem({
          id: item.id,
          quantity: item.quantity,
          currentStage: item.currentStage,
          order: {
            orderNumber: itemResponse.data.orderNumber,
            customer: itemResponse.data.customer
          },
          product: item.product
        });
      }

      // Get progress history
      const historyResponse = await api.get(`/production/progress/${id}`);
      setProgressHistory(historyResponse.data);

      // Calculate stage summary
      calculateStageSummary(historyResponse.data);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStageSummary = (history: ProgressRecord[]) => {
    const summary: Record<string, { total: number; movedOut: number }> = {};

    // Initialize all stages
    stages.forEach(stage => {
      summary[stage] = { total: 0, movedOut: 0 };
    });

    // Calculate totals
    history.forEach(record => {
      summary[record.stage].total += record.quantity;
    });

    // Calculate what moved to next stage
    stages.forEach((stage, index) => {
      if (index < stages.length - 1) {
        const nextStage = stages[index + 1];
        summary[stage].movedOut = summary[nextStage].total;
      }
    });

    // Convert to array with available quantities
    const result: StageQuantity[] = stages.map(stage => ({
      stage,
      total: summary[stage].total,
      available: stage === 'COMPLETE' ? summary[stage].total : summary[stage].total - summary[stage].movedOut
    }));

    setStageSummary(result.filter(s => s.total > 0));
  };

  const getNextStage = (current: string): string => {
    const index = stages.indexOf(current);
    return index < stages.length - 1 ? stages[index + 1] : current;
  };

  const handleMoveToNext = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderItem) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const nextStage = getNextStage(orderItem.currentStage);
      
      await api.post('/production/progress', {
        orderItemId: orderItem.id,
        stage: nextStage,
        quantity: quantity
      });

      setSuccess(`Successfully moved ${quantity} pcs to ${nextStage.replace('_', ' ')}`);
      setQuantity(0);
      
      // Refresh data
      setTimeout(() => {
        fetchData();
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update progress');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQC = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderItem) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/production/progress/qc', {
        orderItemId: orderItem.id,
        passedQuantity: passedQuantity,
        rejectedQuantity: rejectedQuantity
      });

      setSuccess(`QC Complete: ${passedQuantity} passed, ${rejectedQuantity} rejected`);
      setPassedQuantity(0);
      setRejectedQuantity(0);
      
      setTimeout(() => {
        fetchData();
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record QC');
    } finally {
      setSubmitting(false);
    }
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      NOT_PROCESSED: 'bg-gray-100 text-gray-700',
      CUTTING: 'bg-yellow-100 text-yellow-700',
      SEWING: 'bg-blue-100 text-blue-700',
      QC: 'bg-purple-100 text-purple-700',
      FINISHING: 'bg-indigo-100 text-indigo-700',
      PACKING: 'bg-pink-100 text-pink-700',
      COMPLETE: 'bg-green-100 text-green-700'
    };
    return colors[stage] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!orderItem) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
        Order item not found
      </div>
    );
  }

  const currentStageInfo = stageSummary.find(s => s.stage === orderItem.currentStage);
  const availableQty = currentStageInfo?.available || 0;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/production/running')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Running Orders
        </button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Update Production Progress
        </h1>
        <p className="text-gray-600">Record progress for order item</p>
      </div>

      {/* Order Info Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {orderItem.order.orderNumber}
            </h2>
            <p className="text-gray-600">Customer: {orderItem.order.customer.name}</p>
          </div>
          <span className={`px-4 py-2 rounded-xl font-semibold ${getStageColor(orderItem.currentStage)}`}>
            {orderItem.currentStage.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-700 mb-2">Product Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Code</p>
              <p className="font-semibold">{orderItem.product.code}</p>
            </div>
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-semibold">{orderItem.product.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Color</p>
              <p className="font-semibold">{orderItem.product.color}</p>
            </div>
            <div>
              <p className="text-gray-500">Size</p>
              <p className="font-semibold">{orderItem.product.size}</p>
            </div>
          </div>
          <div className="mt-4 text-center py-4 bg-indigo-50 rounded-xl">
            <p className="text-sm text-gray-600">Total Order Quantity</p>
            <p className="text-4xl font-bold text-indigo-600">{orderItem.quantity} pcs</p>
          </div>
        </div>
      </div>

      {/* Stage Summary */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Quantity by Stage</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stageSummary.map((item) => (
            <div key={item.stage} className="border-2 border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{item.stage.replace(/_/g, ' ')}</p>
              <p className="text-2xl font-bold text-gray-900">{item.available}</p>
              <p className="text-xs text-gray-500">available</p>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* Update Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Regular Progress */}
        {orderItem.currentStage !== 'QC' && orderItem.currentStage !== 'COMPLETE' && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-4">Move to Next Stage</h3>
            <form onSubmit={handleMoveToNext}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity to Move
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  min={1}
                  max={availableQty}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  placeholder="Enter quantity"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: {availableQty} pcs
                </p>
              </div>

              <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  Will move <span className="font-bold">{quantity || 0} pcs</span> from{' '}
                  <span className="font-bold">{orderItem.currentStage.replace(/_/g, ' ')}</span> to{' '}
                  <span className="font-bold">{getNextStage(orderItem.currentStage).replace(/_/g, ' ')}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || quantity === 0 || quantity > availableQty}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing...' : 'Update Progress'}
              </button>
            </form>
          </div>
        )}

        {/* QC Form */}
        {orderItem.currentStage === 'QC' && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:col-span-2">
            <h3 className="text-lg font-bold mb-4">Quality Control (QC)</h3>
            <form onSubmit={handleQC}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Passed Quantity
                  </label>
                  <input
                    type="number"
                    value={passedQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setPassedQuantity(val);
                      setRejectedQuantity(Math.max(0, availableQty - val));
                    }}
                    min={0}
                    max={availableQty}
                    required
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rejected Quantity
                  </label>
                  <input
                    type="number"
                    value={rejectedQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setRejectedQuantity(val);
                      setPassedQuantity(Math.max(0, availableQty - val));
                    }}
                    min={0}
                    max={availableQty}
                    required
                    className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span>Available in QC:</span>
                  <span className="font-bold">{availableQty} pcs</span>
                </div>
                <div className="flex justify-between text-sm mb-2 text-green-700">
                  <span>✓ Passed (to Finishing):</span>
                  <span className="font-bold">{passedQuantity} pcs</span>
                </div>
                <div className="flex justify-between text-sm text-red-700">
                  <span>✗ Rejected (back to Sewing):</span>
                  <span className="font-bold">{rejectedQuantity} pcs</span>
                </div>
                <div className="flex justify-between text-sm mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span className="font-bold">{passedQuantity + rejectedQuantity} pcs</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || (passedQuantity + rejectedQuantity) !== availableQty}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing...' : 'Submit QC Results'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Progress History */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-4">Progress History</h2>
        <div className="space-y-3">
          {progressHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No progress recorded yet</p>
          ) : (
            progressHistory.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStageColor(record.stage)}`}>
                    {record.stage.replace(/_/g, ' ')}
                  </span>
                  <span className="font-bold text-gray-900">{record.quantity} pcs</span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(record.recordedAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionUpdate;
