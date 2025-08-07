import React from 'react';
import { motion } from 'framer-motion';
import { Slack, LogOut, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { userId, clearUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUser();
    navigate('/login', { replace: true });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-b border-gray-200 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Slack className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Slack Scheduler</h1>
            <p className="text-sm text-gray-500">Message scheduling made easy</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{userId}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={LogOut}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </motion.header>
  );
};