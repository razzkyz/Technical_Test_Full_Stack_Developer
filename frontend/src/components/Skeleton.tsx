// Skeleton building blocks
const SkeletonBox = ({ className = '' }: { className?: string }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

// ────────────────────────────────────────────────
// Table Row Skeleton  (for CustomerList / OrderList)
// ────────────────────────────────────────────────
export const TableRowSkeleton = ({ cols = 5 }: { cols?: number }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <SkeletonBox className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export const TableSkeleton = ({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
    {/* fake header */}
    <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-3.5 flex gap-6">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBox key={i} className="h-3 flex-1" />
      ))}
    </div>
    <table className="min-w-full">
      <tbody className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} cols={cols} />
        ))}
      </tbody>
    </table>
  </div>
);

// ────────────────────────────────────────────────
// Card Skeleton  (for ProductList)
// ────────────────────────────────────────────────
export const CardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
    <div className="p-4 border-b border-gray-100 flex justify-between">
      <SkeletonBox className="h-3 w-16" />
      <SkeletonBox className="h-5 w-16 rounded-full" />
    </div>
    <div className="p-4 space-y-3">
      <SkeletonBox className="h-5 w-3/4" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <SkeletonBox className="h-3 w-10" />
          <SkeletonBox className="h-3 w-16" />
        </div>
        <div className="flex justify-between">
          <SkeletonBox className="h-3 w-10" />
          <SkeletonBox className="h-3 w-8" />
        </div>
      </div>
    </div>
    <div className="px-4 pb-4 flex gap-2">
      <SkeletonBox className="flex-1 h-8 rounded-lg" />
      <SkeletonBox className="flex-1 h-8 rounded-lg" />
    </div>
  </div>
);

export const CardGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

// ────────────────────────────────────────────────
// Order Card Skeleton  (for OrderList)
// ────────────────────────────────────────────────
export const OrderCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
    <div className="flex items-center gap-4">
      <SkeletonBox className="w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <SkeletonBox className="h-5 w-32" />
          <SkeletonBox className="h-5 w-20 rounded-full" />
        </div>
        <SkeletonBox className="h-3 w-48" />
        <SkeletonBox className="h-3 w-24" />
      </div>
      <div className="hidden sm:flex flex-col gap-2 items-end">
        <SkeletonBox className="h-3 w-20" />
        <SkeletonBox className="h-4 w-24" />
      </div>
    </div>
  </div>
);

export const OrderListSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <OrderCardSkeleton key={i} />
    ))}
  </div>
);

// ────────────────────────────────────────────────
// Dashboard Stats Skeleton
// ────────────────────────────────────────────────
export const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6">
    <div className="flex items-center gap-4">
      <SkeletonBox className="w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-3 w-24" />
        <SkeletonBox className="h-7 w-16" />
      </div>
    </div>
  </div>
);

// ────────────────────────────────────────────────
// Order Detail Skeleton
// ────────────────────────────────────────────────
export const OrderDetailSkeleton = () => (
  <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
    <div className="space-y-2">
      <SkeletonBox className="h-4 w-28" />
      <SkeletonBox className="h-8 w-56" />
      <SkeletonBox className="h-4 w-40" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <SkeletonBox key={i} className="h-24 rounded-2xl" />
      ))}
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <SkeletonBox className="h-6 w-32" />
      {[1, 2].map(i => (
        <div key={i} className="border-2 border-gray-100 rounded-xl p-5 space-y-3">
          <SkeletonBox className="h-5 w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(j => <SkeletonBox key={j} className="h-8 rounded" />)}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ────────────────────────────────────────────────
// Running Orders Skeleton (Production Page)
// ────────────────────────────────────────────────
export const RunningOrderCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
    {/* Header */}
    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <SkeletonBox className="h-6 w-40" />
          <SkeletonBox className="h-4 w-48" />
        </div>
        <SkeletonBox className="h-8 w-32 rounded-xl" />
      </div>
    </div>
    
    {/* Items */}
    <div className="p-6 space-y-3">
      <SkeletonBox className="h-4 w-32 mb-4" />
      {[1, 2].map(i => (
        <div key={i} className="bg-gray-50 rounded-xl p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 space-y-2">
              <SkeletonBox className="h-5 w-56" />
              <SkeletonBox className="h-3 w-40" />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <SkeletonBox className="h-8 w-24 rounded-xl" />
              <SkeletonBox className="h-8 w-32 rounded-xl" />
              <SkeletonBox className="h-8 w-28 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const RunningOrdersSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-6">
    {Array.from({ length: count }).map((_, i) => (
      <RunningOrderCardSkeleton key={i} />
    ))}
  </div>
);

// ────────────────────────────────────────────────
// Generic Page Fallback  (used by Suspense)
// ────────────────────────────────────────────────
export const PageFallback = () => (
  <div className="space-y-5 animate-pulse">
    {/* header bar */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <SkeletonBox className="h-7 w-48" />
        <SkeletonBox className="h-4 w-32" />
      </div>
      <SkeletonBox className="h-10 w-36 rounded-xl" />
    </div>
    {/* search bar */}
    <SkeletonBox className="h-10 w-72 rounded-xl" />
    {/* content */}
    <TableSkeleton rows={6} cols={5} />
  </div>
);
