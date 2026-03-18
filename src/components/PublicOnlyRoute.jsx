import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const getRedirectPath = (role) => {
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'komunitas' || role === 'petugas') return '/dashboard-komunitas';
  return '/dashboard/warga';
};

export const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user) {
    return <Navigate to={getRedirectPath(user.role)} replace />;
  }

  return children;
};
