import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // Jika user belum login, redirect ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika user sudah login, render halaman dashboard
  return children;
};
