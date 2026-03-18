import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Jika user belum login, redirect ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Cek apakah user mencoba mengakses route admin tapi bukan admin
  if (location.pathname.startsWith('/dashboard/admin') && user.role !== 'admin') {
    if (user.role === 'komunitas' || user.role === 'petugas') {
      return <Navigate to="/dashboard-komunitas" replace />;
    }
    return <Navigate to="/dashboard/warga" replace />;
  }

  // Jika user sudah login dan role sesuai, render halaman
  return children;
};
