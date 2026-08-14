import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const QCForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item;
  const orderNumber = location.state?.orderNumber;

  const [passedQuantity, setPassedQuantity] = useState<number>(0);
  const [rejectedQuantity, setRejectedQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rejects, setRejects] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [fetchingHistory, setFetchingHistory] = useState(true);

  useEffect(() => {
    if (!item || item.currentStage !== 'QC') {
      navigate('/production/running');
      return;
    }
    fetchHistory();
  }, [id, item, navigate]);

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/production/progress/${id}`);
      setRejects(response.data.rejects);
      setSummary(response.data.summary);
      
      const availableQC = response.data.summary['QC'] || 0;
      setPassedQuantity(availableQC);
      setRejectedQuantity(0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch QC history');
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/production/progress/qc', {
        orderItemId: parseInt(id!),
        passedQuantity,
        rejectedQuantity
      });
      navigate('/production/running');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update QC');
      setLoading(false);
    }
  };

  if (!item) return null;

  const availableQuantity = summary['QC'] || 0;
  const totalInput = passedQuantity + rejectedQuantity;

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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Quality Control (QC)
        </h1>
        <p className="text-gray-600">Inspect items and report passed/rejected quantities</p>
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
            <div className="flex-1 text-center bg-purple-50 rounded-xl p-4 border border-purple-100">
              <p className="text-sm text-purple-600 font-semibold mb-1">To Inspect</p>
              <p className="text-3xl font-bold text-purple-700">{fetchingHistory ? '...' : availableQuantity}</p>
            </div>
          </div>
        </div>

        {/* QC Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">QC Report</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Passed Quantity <span className="text-green-600">(Moves to FINISHING)</span>
              </label>
              <input
                type="number"
                min="0"
                max={availableQuantity}
                value={passedQuantity}
                onChange={(e) => setPassedQuantity(parseInt(e.target.value) || 0)}
                disabled={fetchingHistory || availableQuantity === 0}
                className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-lg font-semibold text-green-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rejected Quantity <span className="text-red-600">(Returns to SEWING)</span>
              </label>
              <input
                type="number"
                min="0"
                max={availableQuantity}
                value={rejectedQuantity}
                onChange={(e) => setRejectedQuantity(parseInt(e.target.value) || 0)}
                disabled={fetchingHistory || availableQuantity === 0}
                className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all text-lg font-semibold text-red-700"
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-gray-500">Total Input:</span>
                <span className={`text-lg font-bold ${totalInput > availableQuantity ? 'text-red-600' : 'text-gray-900'}`}>
                  {totalInput} / {availableQuantity}
                </span>
              </div>
              
              {totalInput > availableQuantity && (
                <p className="text-sm text-red-600 mb-4">
                  Total cannot exceed available quantity to inspect.
                </p>
              )}

              <button
                type="submit"
                disabled={loading || totalInput <= 0 || totalInput > availableQuantity || fetchingHistory}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Submit QC Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Rejects Log */}
      {!fetchingHistory && rejects.length > 0 && (
        <div className="mt-8 bg-red-50 rounded-2xl shadow-sm border border-red-100 p-6">
          <h2 className="text-xl font-bold mb-6 border-b border-red-200 pb-2 text-red-800">Rejection History</h2>
          <div className="space-y-4">
            {rejects.map((record: any) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    REJECTED
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{record.quantity} items rejected</p>
                    <p className="text-xs text-gray-500">
                      Returned to SEWING • {new Date(record.createdAt).toLocaleString()}
                    </p>
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

export default QCForm;
