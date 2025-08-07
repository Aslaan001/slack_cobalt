import React from 'react';
import { motion } from 'framer-motion';
import { MessageComposer } from '../messages/MessageComposer';
import { ScheduledMessagesList } from '../messages/ScheduledMessagesList';

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Compose and manage your Slack messages
            </p>
          </div>

          <MessageComposer />
          <ScheduledMessagesList />
        </motion.div>
      </div>
    </div>
  );
};