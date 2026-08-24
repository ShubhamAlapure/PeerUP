import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-container py-20 text-center text-[#2e1065] font-bold text-sm">
        <p className="animate-pulse">Checking session authentication status...</p>
      </div>
    );
  }

  // If no Supabase session exists, redirect to /login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
