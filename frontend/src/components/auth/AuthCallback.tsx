import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '../ui/LoadingSpinner';
import { useAuthStore } from '../../hooks/useAuth';

export const AuthCallback: React.FC = () => {
  const { setUser, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const isProcessing = useRef(false);

  useEffect(() => {
    console.log('AuthCallback component mounted');
    console.log('Current URL:', window.location.href);
    console.log('Search params:', window.location.search);
    
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      console.log('User already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
      return;
    }

    const handleCallback = async () => {
      console.log('Starting callback handling');
      
      // Prevent multiple simultaneous callback processing
      if (isProcessing.current) {
        console.log('Callback already processing, skipping');
        return;
      }

      isProcessing.current = true;

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const userId = urlParams.get('userId');
        const hasTokenRotation = urlParams.get('hasTokenRotation');
        const error = urlParams.get('error');
        
        console.log('URL parameters:', { success, userId, hasTokenRotation, error });
        
        // Check if there's an error
        if (error) {
          console.error('Auth error:', error);
          throw new Error(`Authentication failed: ${error}`);
        }
        
        // Check if authentication was successful
        if (success === 'true' && userId) {
          console.log('Authentication successful, setting user data');
          setUser(userId, hasTokenRotation === 'true');
          
          // Clean up the URL to remove the parameters
          window.history.replaceState({}, document.title, '/auth/callback');
          
          // Navigate to dashboard after successful authentication
          console.log('Redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          console.error('Authentication failed - missing success or userId');
          throw new Error('Authentication failed - missing success or userId');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        // Clean up the URL to remove the parameters
        window.history.replaceState({}, document.title, '/auth/callback');
        // Navigate to login on error
        console.log('Redirecting to login due to error');
        navigate('/login', { replace: true });
      } finally {
        isProcessing.current = false;
      }
    };

    handleCallback();
  }, [setUser, navigate, isAuthenticated]);

  console.log('Rendering AuthCallback component');
  return <LoadingScreen message="Connecting to Slack..." />;
};