import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuth';
import { LoadingScreen } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, userId } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give a small delay to allow auth state to be restored from storage
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking authentication state
  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !userId) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}; 