// frontend/src/components/Layout/ProtectedRoute.tsx

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // --- DEBUGGING CONSOLE LOG ---
  // This will tell us the exact state from the AuthContext.
  console.log("ProtectedRoute Check:", {
    loading,
    isAuthenticated,
    isAdmin,
    path: location.pathname
  });
  // -----------------------------

  if (loading) {
    console.log("ProtectedRoute Outcome: Showing loading spinner because `loading` is true.");
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-sdg-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute Outcome: Redirecting to /login because `isAuthenticated` is false.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    console.log("ProtectedRoute Outcome: Redirecting to / because `isAdmin` is false.");
    return <Navigate to="/" replace />;
  }

  console.log("ProtectedRoute Outcome: Access granted, rendering children.");
  return <>{children}</>;
};

export default ProtectedRoute;