import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Slack, MessageSquare, Clock, Shield, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../hooks/useAuth';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, userId } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated && userId) {
      navigate('/dashboard', { replace: true });
    }

    // Check for error parameters from redirect
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'no_code':
          setError('No authorization code received from Slack');
          break;
        case 'auth_failed':
          setError('Authentication failed. Please try again.');
          break;
        default:
          setError('An error occurred during authentication');
      }
    }
  }, [isAuthenticated, userId, navigate, searchParams]);

  const handleLogin = async () => {
    setError(null); // Clear any previous errors
    try {
      const { authUrl } = await authAPI.initiateAuth();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to initiate auth:', error);
      setError('Failed to start authentication. Please try again.');
    }
  };

  // Don't render login screen if user is authenticated
  if (isAuthenticated && userId) {
    return null;
  }

  const features = [
    {
      icon: MessageSquare,
      title: 'Send Messages',
      description: 'Send messages instantly to any Slack channel',
    },
    {
      icon: Clock,
      title: 'Schedule Messages',
      description: 'Schedule messages for future delivery',
    },
    {
      icon: Shield,
      title: 'Secure Connection',
      description: 'OAuth 2.0 secure authentication with Slack',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="text-center">
          <CardContent className="py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Slack className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Slack Message Scheduler
            </h1>
            <p className="text-gray-600 mb-8">
              Connect your Slack workspace to start scheduling messages
            </p>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleLogin}
              size="lg"
              className="w-full mb-8"
              icon={Slack}
            >
              Connect with Slack
            </Button>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 text-left"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};