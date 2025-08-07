import React from 'react';
import { motion } from 'framer-motion';
import { Hash, Clock, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ScheduledMessage } from '../../types';
import { useCancelMessage } from '../../hooks/useApi';

interface MessageCardProps {
  message: ScheduledMessage;
}

export const MessageCard: React.FC<MessageCardProps> = ({ message }) => {
  const cancelMutation = useCancelMessage();

  const handleCancel = () => {
    cancelMutation.mutate(message._id);
  };

  const getStatusBadge = () => {
    switch (message.status) {
      case 'sent':
        return <Badge variant="success">Sent</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card hover>
        <CardContent>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900">{message.channelName}</span>
              {getStatusBadge()}
            </div>
            {message.status === 'pending' && (
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={handleCancel}
                loading={cancelMutation.isPending}
              >
                Cancel
              </Button>
            )}
          </div>

          <p className="text-gray-700 mb-4 line-clamp-3">{message.message}</p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span>
                {message.status === 'sent' && message.sentAt
                  ? `Sent ${format(new Date(message.sentAt), 'MMM d, yyyy h:mm a')}`
                  : `Scheduled for ${format(new Date(message.scheduledFor), 'MMM d, yyyy h:mm a')}`
                }
              </span>
            </div>
            <span>Created {format(new Date(message.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};