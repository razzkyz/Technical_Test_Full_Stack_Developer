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
      
      // Get progress data for this order item
      const progressResponse = await api.get(`/production/progress/${id}`);
      
      // Extract data from response
      const { progress } = progressResponse.data;
      const history = Array.isArray(progress) ? progress : [];
      setProgressHistory(history);

      // Get order item details from running orders
      const ordersResponse = await api.get('/production/running-orders');
      const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
      
      // Find the order item with matching ID
      let foundItem = null;
      for (const order of orders) {
        const item = order.items?.find((i: any) => i.id === parseInt(id!));
        if (item) {
          foundItem = {
            id: item.id,
            quantity: item.quantity,
            currentStage: item.currentStage,
            order: {
              orderNumber: order.orderNumber,
              customer: order.customer
            },
            product: item.product
          };
          break;
        }
      }

      if (foundItem) {
        setOrderItem(foundItem);
        calculateStageSummary(history);
      } else {
        setError('Order item not found');
      }
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
  const availableQty = currentStageInfo?.available || orderItem.quantity;
  const isNotStarted = orderItem.currentStage === 'NOT_PROCESSED';

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/production/running')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Running Orders
        </button>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {isNotStarted ? '🚀 Start Production' : '📊 Update Production Progress'}
        </h1>
        <p className="text-gray-600 text-lg">
          {isNotStarted 
            ? 'Mulai produksi dengan memindahkan ke tahap Cutting'
            : 'Record progress untuk order item ini'}
        </p>
      </div>

      {/* Order Info Card */}
      <div className={`rounded-2xl shadow-xl border-2 p-6 mb-6 ${
        isNotStarted 
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              {isNotStarted && <span className="text-3xl">🎯</span>}
              {orderItem.order.orderNumber}
            </h2>
            <p className="text-gray-700 font-medium">
              <span className="text-gray-500">Customer:</span> {orderItem.order.customer.name}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-xl font-semibold shadow-md ${getStageColor(orderItem.currentStage)}`}>
            {orderItem.currentStage === 'NOT_PROCESSED' ? '⏳ Belum Dimulai' : orderItem.currentStage.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold text-gray-800 mb-3 text-lg">📦 Detail Produk</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Kode Produk</p>
              <p className="font-bold text-gray-900">{orderItem.product.code}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Nama Produk</p>
              <p className="font-bold text-gray-900">{orderItem.product.name}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Warna</p>
              <p className="font-bold text-gray-900">{orderItem.product.color}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Ukuran</p>
              <p className="font-bold text-gray-900">{orderItem.product.size}</p>
            </div>
          </div>
          <div className={`text-center py-5 rounded-2xl shadow-md ${
            isNotStarted 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
          }`}>
            <p className="text-sm font-medium opacity-90 mb-1">
              {isNotStarted ? '🎯 Quantity yang Harus Diproduksi' : '📊 Total Order Quantity'}
            </p>
            <p className="text-5xl font-black mb-1">{orderItem.quantity} <span className="text-2xl font-normal">pcs</span></p>
            {isNotStarted && (
              <p className="text-xs opacity-90 mt-1">Siap untuk dimulai dari tahap Cutting</p>
            )}
          </div>
        </div>
      </div>

      {/* Stage Summary - Only show if production started */}
      {!isNotStarted && stageSummary.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Quantity di Setiap Stage
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stageSummary.map((item) => (
              <div key={item.stage} className="border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">{item.stage.replace(/_/g, ' ')}</p>
                <p className="text-3xl font-bold text-indigo-600">{item.available}</p>
                <p className="text-xs text-gray-500 mt-1">pcs tersedia</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start Production Guide - Show only for NOT_PROCESSED */}
      {isNotStarted && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">ℹ️ Panduan Memulai Produksi</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold text-lg">✓</span>
                  <p><strong>Langkah 1:</strong> Order ini belum dimulai produksinya (status: <strong>NOT_PROCESSED</strong>)</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold text-lg">✓</span>
                  <p><strong>Langkah 2:</strong> Untuk memulai, pindahkan semua atau sebagian quantity ke tahap <strong>CUTTING</strong></p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold text-lg">✓</span>
                  <p><strong>Langkah 3:</strong> Masukkan quantity yang akan diproduksi di form di bawah ini</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold text-lg">💡</span>
                  <p className="text-blue-700"><strong>Tips:</strong> Anda bisa memulai dengan semua quantity ({orderItem.quantity} pcs) atau sebagian saja sesuai kapasitas produksi</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Penting:</strong> Setelah quantity dipindahkan ke CUTTING, Anda tidak bisa membatalkannya. Pastikan quantity yang dimasukkan sudah benar.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <div className={`rounded-2xl shadow-xl border-2 p-6 ${
            isNotStarted 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-400' 
              : 'bg-white border-gray-100'
          }`}>
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isNotStarted ? 'text-white' : 'text-gray-900'}`}>
              {isNotStarted ? (
                <>
                  <span className="text-2xl">🚀</span>
                  Mulai Produksi - CUTTING
                </>
              ) : (
                <>
                  <span className="text-2xl">➡️</span>
                  Pindah ke Stage Berikutnya
                </>
              )}
            </h3>
            <form onSubmit={handleMoveToNext}>
              <div className="mb-4">
                <label className={`block text-sm font-bold mb-2 ${isNotStarted ? 'text-white' : 'text-gray-700'}`}>
                  {isNotStarted ? 'Quantity untuk Memulai Produksi' : 'Quantity yang Akan Dipindahkan'}
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  min={1}
                  max={availableQty}
                  required
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none text-lg font-semibold ${
                    isNotStarted 
                      ? 'bg-white border-white text-gray-900 focus:ring-4 focus:ring-white/50' 
                      : 'border-gray-200 focus:border-indigo-500'
                  }`}
                  placeholder={`Masukkan quantity (Max: ${availableQty})`}
                />
                <p className={`text-xs mt-2 font-medium ${isNotStarted ? 'text-white/90' : 'text-gray-500'}`}>
                  {isNotStarted 
                    ? `💡 Total yang tersedia: ${availableQty} pcs (bisa dimulai sebagian atau semua)` 
                    : `Tersedia di stage ini: ${availableQty} pcs`}
                </p>
              </div>

              <div className={`mb-4 p-4 rounded-xl ${
                isNotStarted 
                  ? 'bg-white/20 backdrop-blur-sm' 
                  : 'bg-indigo-50'
              }`}>
                <p className={`text-sm ${isNotStarted ? 'text-white font-medium' : 'text-gray-700'}`}>
                  {isNotStarted ? (
                    <>
                      🎯 Akan <span className="font-black text-lg">{quantity || 0} pcs</span> dipindahkan ke tahap{' '}
                      <span className="font-black text-lg">CUTTING</span> untuk memulai produksi
                    </>
                  ) : (
                    <>
                      ➡️ Akan memindahkan <span className="font-bold">{quantity || 0} pcs</span> dari{' '}
                      <span className="font-bold">{orderItem.currentStage.replace(/_/g, ' ')}</span> ke{' '}
                      <span className="font-bold">{getNextStage(orderItem.currentStage).replace(/_/g, ' ')}</span>
                    </>
                  )}
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || quantity === 0 || quantity > availableQty}
                className={`w-full px-6 py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  isNotStarted 
                    ? 'bg-white text-green-600 hover:bg-green-50' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : isNotStarted ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    🚀 MULAI PRODUKSI SEKARANG
                  </span>
                ) : (
                  '✅ Update Progress'
                )}
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
