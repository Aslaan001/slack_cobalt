import React, { useState } from 'react';
import { Send, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Textarea } from '../ui/Textarea';
import { Input } from '../ui/Input';
import { ChannelSelector } from './ChannelSelector';
import { useSendMessage, useScheduleMessage } from '../../hooks/useApi';

export const MessageComposer: React.FC = () => {
  const [message, setMessage] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [selectedChannelName, setSelectedChannelName] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  const sendMessageMutation = useSendMessage();
  const scheduleMessageMutation = useScheduleMessage();

  const handleChannelChange = (channelId: string, channelName: string) => {
    setSelectedChannelId(channelId);
    setSelectedChannelName(channelName);
  };

  const handleSendNow = async () => {
    if (!selectedChannelId || !message.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        channelId: selectedChannelId,
        message: message.trim(),
      });

      setMessage('');
      setSelectedChannelId('');
      setSelectedChannelName('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSchedule = async () => {
    if (!selectedChannelId || !message.trim() || !scheduledFor) return;

    try {
      // Convert local datetime to UTC for backend
      const localDate = new Date(scheduledFor);
      const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);

      await scheduleMessageMutation.mutateAsync({
        channelId: selectedChannelId,
        channelName: selectedChannelName,
        message: message.trim(),
        scheduledFor: utcDate.toISOString(), // send UTC ISO
      });

      setMessage('');
      setSelectedChannelId('');
      setSelectedChannelName('');
      setScheduledFor('');
      setIsScheduling(false);
    } catch (error) {
      console.error('Failed to schedule message:', error);
    }
  };

  // ✅ matches your Textarea/Input prop type `(value: string) => void`
  const handleScheduledForChange = (value: string) => {
    setScheduledFor(value);
  };

  const isFormValid = selectedChannelId && message.trim();

  const isScheduledTimeValid = () => {
    if (!scheduledFor || scheduledFor.trim() === '') return false;

    const selectedLocalDate = new Date(scheduledFor);
    const nowLocal = new Date();

    return selectedLocalDate.getTime() > nowLocal.getTime();
  };

  const isScheduleValid = isFormValid && isScheduledTimeValid();

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">Compose Message</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChannelSelector
          selectedChannel={selectedChannelId}
          onChannelChange={handleChannelChange}
        />

        <Textarea
          label="Message"
          placeholder="Type your message here..."
          value={message}
          onChange={setMessage} // ✅ now matches (value: string) => void
          rows={4}
          maxLength={4000}
          required
        />

        {isScheduling && (
          <div className="space-y-2">
            <Input
              label="Schedule For"
              type="datetime-local"
              value={scheduledFor}
              onChange={handleScheduledForChange} // ✅ now matches (value: string) => void
              required
              min={getMinDateTime()}
            />
            {scheduledFor && !isScheduledTimeValid() && (
              <p className="text-sm text-red-600">
                Please select a future date and time
              </p>
            )}
          </div>
        )}

        <div className="flex space-x-3">
          {!isScheduling ? (
            <>
              <Button
                onClick={handleSendNow}
                disabled={!isFormValid}
                loading={sendMessageMutation.isPending}
                icon={Send}
              >
                Send Now
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsScheduling(true)}
                icon={Clock}
              >
                Schedule
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleSchedule}
                disabled={!isScheduleValid}
                loading={scheduleMessageMutation.isPending}
                icon={Clock}
              >
                Schedule Message
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsScheduling(false)}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
