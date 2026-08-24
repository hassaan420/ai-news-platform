import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NewsDetail from '../pages/NewsDetail';
import Category from '../pages/Category';
import Search from '../pages/Search';
import Profile from '../pages/Profile';
import AdminDashboard from '../pages/AdminDashboard';
import Trending from '../pages/Trending';
import SavedArticles from '../pages/SavedArticles';
import UserManagement from '../pages/admin/UserManagement';
import ArticleManagement from '../pages/admin/ArticleManagement';
import SystemHealth from '../pages/admin/SystemHealth';
import AuditLogs from '../pages/admin/AuditLogs';
import ErrorMonitoring from '../pages/admin/ErrorMonitoring';
import SystemSettings from '../pages/admin/SystemSettings';
import SourceManagement from '../pages/admin/SourceManagement';
import CategoryManagement from '../pages/admin/CategoryManagement';
import FetchLogs from '../pages/admin/FetchLogs';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/search" element={<Search />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/search" element={<Search />} />
        <Route path="/trending" element={<Trending />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/saved" element={<SavedArticles />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/sources" element={<SourceManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/logs" element={<FetchLogs />} />
          <Route path="/admin/articles" element={<ArticleManagement />} />
          <Route path="/admin/health" element={<SystemHealth />} />
          <Route path="/admin/audit" element={<AuditLogs />} />
          <Route path="/admin/errors" element={<ErrorMonitoring />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
        </Route>
      </Route>
    </Routes>
  );
}
