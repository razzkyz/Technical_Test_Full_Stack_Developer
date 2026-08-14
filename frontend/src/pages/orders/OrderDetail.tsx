import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Order } from '../../types';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';
import { OrderDetailSkeleton } from '../../components/Skeleton';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

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

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      NOT_PROCESSED: 'bg-gray-100 text-gray-600',
      CUTTING: 'bg-yellow-100 text-yellow-700',
      SEWING: 'bg-blue-100 text-blue-700',
      QC: 'bg-purple-100 text-purple-700',
      FINISHING: 'bg-indigo-100 text-indigo-700',
      PACKING: 'bg-pink-100 text-pink-700',
      COMPLETE: 'bg-green-100 text-green-700'
    };
    return colors[stage] || 'bg-gray-100 text-gray-600';
  };

  if (loading) return <OrderDetailSkeleton />;

  if (error || !order) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
        {error || 'Order not found'}
      </div>
    );
  }

  const isLate = order.status !== 'COMPLETE' && new Date(order.deadline) < new Date();

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await api.delete(`/orders/${id}`);
      toast.success('Order berhasil dihapus');
      navigate('/orders');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Gagal menghapus order';
      if (msg.includes('production progress')) {
        toast.error('Tidak bisa dihapus: Order ini sudah memiliki progress produksi.', { duration: 6000 });
      } else {
        toast.error(msg);
      }
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Orders
        </button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{order.orderNumber}</h1>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ')}
              </span>
              {isLate && (
                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-700 animate-pulse">
                  ⚠️ LATE
                </span>
              )}
            </div>
            <p className="text-gray-600">Order Details & Production Status</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Hapus Order
          </button>
        </div>
      </div>

      {/* Order Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div>
              <p className="text-sm opacity-90">Customer</p>
              <p className="text-xl font-bold">{order.customer?.name || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm opacity-90">Order Date</p>
              <p className="text-xl font-bold">{new Date(order.orderDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${isLate ? 'from-red-500 to-red-600' : 'from-purple-500 to-purple-600'} rounded-2xl shadow-lg p-6 text-white`}>
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm opacity-90">Deadline</p>
              <p className="text-xl font-bold">{new Date(order.deadline).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Order Items</h2>
        <div className="space-y-4">
          {order.items?.map((item: any) => (
            <div key={item.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {item.product?.name || 'Unknown Product'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Code</p>
                      <p className="font-semibold">{item.product?.code}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-semibold">{item.product?.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Color</p>
                      <p className="font-semibold">{item.product?.color}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Size</p>
                      <p className="font-semibold">{item.product?.size}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">Quantity</p>
                    <p className="text-3xl font-bold text-indigo-600">{item.quantity}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStageColor(item.currentStage)}`}>
                    {item.currentStage.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Details */}
      {order.customer && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-2xl font-bold mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 text-sm mb-1">Name</p>
              <p className="font-semibold text-gray-900">{order.customer.name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Phone</p>
              <p className="font-semibold text-gray-900">{order.customer.phone}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-500 text-sm mb-1">Address</p>
              <p className="font-semibold text-gray-900">{order.customer.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Hapus Order"
        message={`Apakah Anda yakin ingin menghapus order "${order.orderNumber}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel={deleting ? 'Menghapus...' : 'Ya, Hapus'}
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setShowDeleteModal(false)}
      />
    </>
  );
};

export default OrderDetail;
