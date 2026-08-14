import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const stages = [
  'NOT_PROCESSED',
  'CUTTING',
  'SEWING',
  'QC',
  'FINISHING',
  'PACKING',
  'COMPLETE'
];

const ProgressUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item;
  const orderNumber = location.state?.orderNumber;

  const [quantity, setQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [fetchingHistory, setFetchingHistory] = useState(true);

  useEffect(() => {
    if (!item) {
      navigate('/production/running');
      return;
    }
    fetchHistory();
  }, [id, item, navigate]);

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/production/progress/${id}`);
      setHistory(response.data.progress);
      setSummary(response.data.summary);
      
      // Default quantity to available quantity in current stage
      const currentStage = item.currentStage;
      setQuantity(response.data.summary[currentStage] || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch progress history');
    } finally {
      setFetchingHistory(false);
    }
  };

  const getNextStage = (currentStage: string) => {
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === stages.length - 1) return null;
    return stages[currentIndex + 1];
  };

  const nextStage = item ? getNextStage(item.currentStage) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextStage) return;

    setLoading(true);
    setError('');

    try {
      await api.post('/production/progress', {
        orderItemId: parseInt(id!),
        stage: nextStage,
        quantity: quantity
      });
      navigate('/production/running');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update progress');
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

  if (!item) return null;

  const availableQuantity = summary[item.currentStage] || 0;

  return (
    <div className="max-w-4xl mx-auto">
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
        <p className="text-gray-600">Move items to the next production stage</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Item Info Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-fit">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Item Details</h2>
          {orderNumber && (
            <div className="mb-4">
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-bold text-gray-900">{orderNumber}</p>
            </div>
          )}
          <div className="mb-4">
            <p className="text-sm text-gray-500">Product</p>
            <p className="font-bold text-gray-900">{item.product.code} - {item.product.name}</p>
            <p className="text-sm text-gray-600 mt-1">{item.product.color} • {item.product.size}</p>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Current Stage</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStageColor(item.currentStage)}`}>
                {item.currentStage.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm text-gray-500 mb-1">Available Qty</p>
              <p className="text-2xl font-bold text-indigo-600">{fetchingHistory ? '...' : availableQuantity}</p>
              <p className="text-xs text-gray-500">of {item.quantity} total</p>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Move to Next Stage</h2>
          
          {nextStage ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Next Stage:</p>
                <div className={`p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50 flex items-center justify-between`}>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStageColor(nextStage)}`}>
                    {nextStage.replace(/_/g, ' ')}
                  </span>
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity to Move
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max={availableQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    disabled={fetchingHistory || availableQuantity === 0}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-lg font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(availableQuantity)}
                    disabled={fetchingHistory || availableQuantity === 0}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                  >
                    Max
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || quantity <= 0 || quantity > availableQuantity || fetchingHistory}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Confirm Move'}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Production Complete</h3>
              <p className="text-gray-500">This item has finished all production stages.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* History Log */}
      {!fetchingHistory && history.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold mb-6 border-b pb-2">Movement History</h2>
          <div className="space-y-4">
            {history.map((record: any) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStageColor(record.stage)}`}>
                    {record.stage.replace(/_/g, ' ')}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">Moved {record.quantity} items</p>
                    <p className="text-xs text-gray-500">{new Date(record.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressUpdate;
