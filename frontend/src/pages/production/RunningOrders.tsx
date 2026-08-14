import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface OrderItem {
  id: number;
  quantity: number;
  currentStage: string;
  product: {
    code: string;
    name: string;
    color: string;
    size: string;
  };
}

interface RunningOrder {
  id: number;
  orderNumber: string;
  orderDate: string;
  deadline: string;
  status: string;
  customer: {
    name: string;
  };
  items: OrderItem[];
}

const RunningOrders = () => {
  const [orders, setOrders] = useState<RunningOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRunningOrders();
  }, []);

  const fetchRunningOrders = async () => {
    try {
      const response = await api.get('/production/running-orders');
      setOrders(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch running orders');
    } finally {
      setLoading(false);
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

  const isLate = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const filteredOrders = orders.filter(order => {
    // Filter by stage
    const matchesStage = stageFilter 
      ? order.items.some(item => item.currentStage === stageFilter)
      : true;
    
    // Filter by search query (order number or customer name)
    const matchesSearch = searchQuery
      ? order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    return matchesStage && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          🏭 Running Orders
        </h1>
        <p className="text-gray-600 text-lg font-medium">Monitor dan update progres produksi • {filteredOrders.length} order aktif</p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3 shadow-md">
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-red-700 font-medium">{error}</span>
        </div>
      )}

      {/* Enhanced Filters */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-100 rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Cari Order
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Cari nomor order atau customer... (contoh: ORD-001, PT Jaya)"
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white shadow-md font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter Stage Produksi
            </label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white shadow-md font-medium"
            >
              <option value="">✅ Semua Stage</option>
              <option value="NOT_PROCESSED">⏳ Belum Diproses</option>
              <option value="CUTTING">✂️ Cutting</option>
              <option value="SEWING">🧵 Sewing</option>
              <option value="QC">🔍 Quality Control</option>
              <option value="FINISHING">✨ Finishing</option>
              <option value="PACKING">📦 Packing</option>
              <option value="COMPLETE">✔️ Complete</option>
            </select>
          </div>
        </div>
        
        {(searchQuery || stageFilter) && (
          <div className="mt-4 pt-4 border-t border-indigo-200 flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-bold">
              {filteredOrders.length} hasil
            </span>
            <span className="text-gray-600 font-medium">
              {searchQuery && `mencari "${searchQuery}"`}
              {searchQuery && stageFilter && ' • '}
              {stageFilter && `stage: ${stageFilter.replace(/_/g, ' ')}`}
            </span>
            <button
              onClick={() => { setSearchQuery(''); setStageFilter(''); }}
              className="ml-auto text-xs text-indigo-600 hover:text-indigo-800 font-bold underline"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Running Orders */}
      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
          >
            {/* Order Header */}
            <div className={`p-6 ${isLate(order.deadline) ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{order.orderNumber}</h3>
                  <p className="text-white/90">Customer: {order.customer.name}</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 text-sm">
                  <div>
                    <p className="text-white/80">Deadline</p>
                    <p className="font-bold text-lg">{new Date(order.deadline).toLocaleDateString()}</p>
                  </div>
                  {isLate(order.deadline) && (
                    <div className="bg-white/20 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      LATE
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6">
              <h4 className="font-semibold text-gray-700 mb-4">Production Items</h4>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h5 className="font-bold text-gray-900 mb-1">
                        {item.product.code} - {item.product.name}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {item.product.color} • {item.product.size} • Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${getStageColor(item.currentStage)}`}>
                        {item.currentStage.replace(/_/g, ' ')}
                      </span>
                      
                      {item.currentStage !== 'COMPLETE' && item.currentStage !== 'NOT_PROCESSED' && (
                        <Link
                          to={item.currentStage === 'QC' ? `/production/qc/${item.id}` : `/production/update/${item.id}`}
                          state={{ item, orderNumber: order.orderNumber }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-semibold shadow-md"
                        >
                          {item.currentStage === 'QC' ? 'Perform QC' : 'Update Progress'}
                        </Link>
                      )}
                      
                      {item.currentStage === 'NOT_PROCESSED' && (
                        <Link
                          to={`/production/update/${item.id}`}
                          state={{ item, orderNumber: order.orderNumber }}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-semibold shadow-md"
                        >
                          Start Production
                        </Link>
                      )}

                      <Link
                        to={`/orders/${order.id}`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-md"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No running orders</h3>
          <p className="text-gray-600">All orders are complete or no orders exist</p>
        </div>
      )}
    </div>
  );
};

export default RunningOrders;
