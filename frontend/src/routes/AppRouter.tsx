import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import { Skeleton } from '@/components/ui/skeleton';

// Eagerly loaded pages (core user flows — always needed)
import AuthenticatedHome from '../pages/AuthenticatedHome';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NewsDetail from '../pages/NewsDetail';
import Category from '../pages/Category';
import Search from '../pages/Search';
import Trending from '../pages/Trending';
import Profile from '../pages/Profile';
import SavedArticles from '../pages/SavedArticles';

// Lazily loaded admin pages (reduces initial bundle by ~30–40%)
const AdminDashboard    = lazy(() => import('../pages/AdminDashboard'));
const UserManagement    = lazy(() => import('../pages/admin/UserManagement'));
const ArticleManagement = lazy(() => import('../pages/admin/ArticleManagement'));
const SystemHealth      = lazy(() => import('../pages/admin/SystemHealth'));
const AuditLogs         = lazy(() => import('../pages/admin/AuditLogs'));
const ErrorMonitoring   = lazy(() => import('../pages/admin/ErrorMonitoring'));
const SystemSettings    = lazy(() => import('../pages/admin/SystemSettings'));
const SourceManagement  = lazy(() => import('../pages/admin/SourceManagement'));
const CategoryManagement = lazy(() => import('../pages/admin/CategoryManagement'));
const FetchLogs         = lazy(() => import('../pages/admin/FetchLogs'));

/** Minimal skeleton shown while an admin chunk is loading */
function AdminFallback() {
  return (
    <div className="max-w-max_content_width mx-auto w-full pt-8 space-y-4 animate-pulse">
      <Skeleton className="h-8 w-48 bg-white/[0.1]" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl bg-white/[0.1]" />)}
      </div>
      <Skeleton className="h-64 w-full rounded-xl bg-white/[0.1]" />
    </div>
  );
}

export default function AppRouter() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Landing />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/home"           element={<AuthenticatedHome />} />
        <Route path="/news/:id"       element={<NewsDetail />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/search"         element={<Search />} />
        <Route path="/trending"       element={<Trending />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/saved"   element={<SavedArticles />} />
        </Route>

        {/* Admin Routes — lazy loaded for bundle performance */}
        <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
          <Route path="/admin"            element={<Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>} />
          <Route path="/admin/users"      element={<Suspense fallback={<AdminFallback />}><UserManagement /></Suspense>} />
          <Route path="/admin/sources"    element={<Suspense fallback={<AdminFallback />}><SourceManagement /></Suspense>} />
          <Route path="/admin/categories" element={<Suspense fallback={<AdminFallback />}><CategoryManagement /></Suspense>} />
          <Route path="/admin/logs"       element={<Suspense fallback={<AdminFallback />}><FetchLogs /></Suspense>} />
          <Route path="/admin/articles"   element={<Suspense fallback={<AdminFallback />}><ArticleManagement /></Suspense>} />
          <Route path="/admin/health"     element={<Suspense fallback={<AdminFallback />}><SystemHealth /></Suspense>} />
          <Route path="/admin/audit"      element={<Suspense fallback={<AdminFallback />}><AuditLogs /></Suspense>} />
          <Route path="/admin/errors"     element={<Suspense fallback={<AdminFallback />}><ErrorMonitoring /></Suspense>} />
          <Route path="/admin/settings"   element={<Suspense fallback={<AdminFallback />}><SystemSettings /></Suspense>} />
        </Route>
      </Route>
    </Routes>
  );
}
