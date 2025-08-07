import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Calendar, MessageSquare, Filter } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { MessageCard } from './MessageCard';
import { useScheduledMessages } from '../../hooks/useApi';
import { Select } from '../ui/Select';

type FilterStatus = 'all' | 'pending' | 'sent' | 'failed';

export const ScheduledMessagesList: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const { data, isLoading, error } = useScheduledMessages(filterStatus);

  const filterOptions = [
    { value: 'all', label: 'All Messages' },
    { value: 'pending', label: 'Pending' },
    { value: 'sent', label: 'Sent' },
    { value: 'failed', label: 'Failed' },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Scheduled Messages
          </h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Scheduled Messages
          </h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Failed to load scheduled messages. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  const messages = data?.scheduledMessages || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Scheduled Messages
          </h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select
                value={filterStatus}
                onChange={(value) => setFilterStatus(value as FilterStatus)}
                options={filterOptions}
                className="w-32"
              />
            </div>
            <span className="text-sm text-gray-500">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {filterStatus === 'all' 
                ? 'No scheduled messages yet'
                : `No ${filterStatus} messages`
              }
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {filterStatus === 'all' 
                ? 'Schedule your first message using the composer above'
                : 'Try changing the filter or schedule a new message'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <MessageCard key={message._id} message={message} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};