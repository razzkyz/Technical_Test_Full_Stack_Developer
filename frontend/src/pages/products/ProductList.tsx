import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import type { Product } from '../../types';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';
import { CardGridSkeleton } from '../../components/Skeleton';

const PAGE_SIZE = 12;

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modal state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setPage(1);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err: any) {
      const msg = err.code === 'ERR_NETWORK'
        ? 'Tidak bisa terhubung ke server. Pastikan backend berjalan.'
        : (err.response?.data?.error || 'Gagal memuat produk');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
      toast.success(`Produk "${deleteTarget.name}" berhasil dihapus`);
      setDeleteTarget(null);
    } catch (err: any) {
      const msg = err.response?.data?.error || '';
      if (msg.includes('Foreign key') || msg.includes('orders') || msg.includes('constraint')) {
        toast.error('Tidak bisa dihapus: Produk ini masih digunakan dalam order.', { duration: 6000 });
      } else {
        toast.error('Gagal menghapus produk');
      }
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = products.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.type.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      {/* Header with gradient */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            📦 Data Produk
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            {filtered.length} produk{search ? ' ditemukan' : ' terdaftar'} • Kelola semua produk Anda
          </p>
        </div>
        <Link
          to="/products/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Produk Baru
        </Link>
      </div>

      {/* Enhanced Search Bar */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-100 rounded-2xl p-4 shadow-lg">
          <div className="relative max-w-2xl">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="🔍 Cari produk berdasarkan nama, kode, atau jenis... (contoh: Kaos, TK001, Kemeja)"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-12 py-3.5 border-2 border-transparent rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-md placeholder:text-gray-400"
            />
            {search && (
              <button 
                onClick={() => setSearch('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {search && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-semibold">
                {filtered.length} hasil
              </span>
              <span className="text-gray-600">untuk pencarian "{search}"</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-red-700 flex-1">{error}</span>
          <button onClick={fetchProducts} className="text-xs font-semibold text-red-600 hover:text-red-800 underline">Coba lagi</button>
        </div>
      )}

      {loading ? <CardGridSkeleton count={8} /> : paginated.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="font-medium">Belum ada produk</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((product) => (
            <div key={product.id} className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border border-blue-500 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-blue-200">{product.code}</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white shadow-inner backdrop-blur-sm">
                  {product.type}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-xl mb-3 truncate">{product.name}</h3>
                <div className="space-y-2 text-sm text-blue-100">
                  <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg backdrop-blur-sm">
                    <span>Warna</span>
                    <span className="text-white font-semibold">{product.color}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg backdrop-blur-sm">
                    <span>Ukuran</span>
                    <span className="text-white font-semibold">{product.size}</span>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4 flex gap-2 mt-2">
                <Link
                  to={`/products/${product.id}/edit`}
                  className="flex-1 text-center py-2.5 text-sm font-bold text-blue-700 bg-white rounded-xl hover:bg-blue-50 transition-colors shadow-md hover:shadow-lg"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setDeleteTarget(product)}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500/80 rounded-xl hover:bg-red-500 transition-colors shadow-md border border-red-500/50 hover:shadow-lg"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length} produk
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${
                  p === page ? 'bg-indigo-600 text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Berikutnya →
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus produk "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel={deleting ? 'Menghapus...' : 'Ya, Hapus'}
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
};

export default ProductList;
