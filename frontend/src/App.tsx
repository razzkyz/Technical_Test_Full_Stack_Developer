import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';
import { PageFallback } from './components/Skeleton';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// ─── Lazy-loaded pages (code splitting per route) ───────────────────────────
const Login          = lazy(() => import('./pages/Login'));
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const CustomerList   = lazy(() => import('./pages/customers/CustomerList'));
const CustomerCreate = lazy(() => import('./pages/customers/CustomerCreate'));
const CustomerEdit   = lazy(() => import('./pages/customers/CustomerEdit'));
const ProductList    = lazy(() => import('./pages/products/ProductList'));
const ProductCreate  = lazy(() => import('./pages/products/ProductCreate'));
const ProductEdit    = lazy(() => import('./pages/products/ProductEdit'));
const OrderList      = lazy(() => import('./pages/orders/OrderList'));
const OrderCreate    = lazy(() => import('./pages/orders/OrderCreate'));
const OrderDetail    = lazy(() => import('./pages/orders/OrderDetail'));
const RunningOrders  = lazy(() => import('./pages/production/RunningOrders'));
const ProductionUpdate = lazy(() => import('./pages/production/ProductionUpdate'));

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <Router>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><PageFallback /></div>}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
            />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={
                  <Suspense fallback={<PageFallback />}><Dashboard /></Suspense>
                } />
                <Route path="/dashboard" element={
                  <Suspense fallback={<PageFallback />}><Dashboard /></Suspense>
                } />

                {/* Customer Routes */}
                <Route path="/customers" element={
                  <Suspense fallback={<PageFallback />}><CustomerList /></Suspense>
                } />
                <Route path="/customers/create" element={
                  <Suspense fallback={<PageFallback />}><CustomerCreate /></Suspense>
                } />
                <Route path="/customers/:id/edit" element={
                  <Suspense fallback={<PageFallback />}><CustomerEdit /></Suspense>
                } />

                {/* Product Routes */}
                <Route path="/products" element={
                  <Suspense fallback={<PageFallback />}><ProductList /></Suspense>
                } />
                <Route path="/products/create" element={
                  <Suspense fallback={<PageFallback />}><ProductCreate /></Suspense>
                } />
                <Route path="/products/:id/edit" element={
                  <Suspense fallback={<PageFallback />}><ProductEdit /></Suspense>
                } />

                {/* Order Routes */}
                <Route path="/orders" element={
                  <Suspense fallback={<PageFallback />}><OrderList /></Suspense>
                } />
                <Route path="/orders/create" element={
                  <Suspense fallback={<PageFallback />}><OrderCreate /></Suspense>
                } />
                <Route path="/orders/:id" element={
                  <Suspense fallback={<PageFallback />}><OrderDetail /></Suspense>
                } />

                {/* Production Routes */}
                <Route path="/production/running" element={
                  <Suspense fallback={<PageFallback />}><RunningOrders /></Suspense>
                } />
                <Route path="/production/update/:id" element={
                  <Suspense fallback={<PageFallback />}><ProductionUpdate /></Suspense>
                } />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route
              path="*"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
            />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}

export default App;
