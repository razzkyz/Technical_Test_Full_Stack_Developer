import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import type { Order } from '../../types';
import { OrderListSkeleton } from '../../components/Skeleton';

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await api.get(`/orders?${params.toString()}`);
      setOrders(response.data);
    } catch (err: any) {
      console.error('Order fetch error:', err);
      const errorMsg = err.code === 'ERR_NETWORK' 
        ? 'Cannot connect to server. Please check if backend is running.'
        : (err.response?.data?.error || 'Failed to fetch orders');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_PROCESSED':
        return 'bg-gray-100 text-gray-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'COMPLETE':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const isLate = (deadline: string, status: string) => {
    return status !== 'COMPLETE' && new Date(deadline) < new Date();
  };


  return (
    <div>
      {/* Header with gradient */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            📋 Daftar Order
          </h1>
          <p className="text-gray-600 font-medium">Kelola semua pesanan customer • {orders.length} order total</p>
        </div>
        <Link
          to="/orders/create"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buat Order Baru
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3 shadow-md">
          <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-red-700 flex-1 font-medium">{error}</span>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-bold shadow-md"
          >
            🔄 Coba Lagi
          </button>
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
                placeholder="🔍 Cari nomor order... (contoh: ORD-001)"
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
              Filter Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white shadow-md font-medium"
            >
              <option value="">✅ Semua Status</option>
              <option value="NOT_PROCESSED">⏳ Belum Diproses</option>
              <option value="IN_PROGRESS">🔄 Sedang Dikerjakan</option>
              <option value="COMPLETE">✔️ Selesai</option>
            </select>
          </div>
        </div>
        {(searchQuery || statusFilter) && (
          <div className="mt-4 pt-4 border-t border-indigo-200 flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-bold">
              {filteredOrders.length} hasil
            </span>
            <span className="text-gray-600 font-medium">
              {searchQuery && `mencari "${searchQuery}"`}
              {searchQuery && statusFilter && ' • '}
              {statusFilter && `status: ${statusFilter.replace('_', ' ')}`}
            </span>
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
              className="ml-auto text-xs text-indigo-600 hover:text-indigo-800 font-bold underline"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Orders List */}
      {loading ? (
        <OrderListSkeleton count={6} />
      ) : (
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{order.orderNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                        {isLate(order.deadline, order.status) && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 animate-pulse">
                            ⚠️ LATE
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-1">
                        Customer: <span className="font-semibold text-gray-900">{order.customer?.name || 'N/A'}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.items?.length || 0} item(s)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <div className="text-center sm:text-left">
                    <p className="text-gray-500 mb-1">Order Date</p>
                    <p className="font-semibold text-gray-900">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-gray-500 mb-1">Deadline</p>
                    <p className={`font-semibold ${isLate(order.deadline, order.status) ? 'text-red-600' : 'text-gray-900'}`}>
                      {new Date(order.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      )}

      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first order</p>
          <Link
            to="/orders/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
          >
            Create Order
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderList;
