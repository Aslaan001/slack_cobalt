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
      // Force IST (+05:30) timezone regardless of browser setting
      const [datePart, timePart] = scheduledFor.split('T');
      const istDate = new Date(`${datePart}T${timePart}:00+05:30`);

      await scheduleMessageMutation.mutateAsync({
        channelId: selectedChannelId,
        channelName: selectedChannelName,
        message: message.trim(),
        scheduledFor: istDate.toISOString(), // send as UTC ISO string
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

  const handleScheduledForChange = (value: string) => {
    setScheduledFor(value);
  };

  const isFormValid = selectedChannelId && message.trim();

  const isScheduledTimeValid = () => {
    if (!scheduledFor || scheduledFor.trim() === '') return false;

    // Force compare in IST
    const [datePart, timePart] = scheduledFor.split('T');
    const selectedIST = new Date(`${datePart}T${timePart}:00+05:30`);
    const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

    return selectedIST.getTime() > nowIST.getTime();
  };

  const isScheduleValid = isFormValid && isScheduledTimeValid();

  const getMinDateTime = () => {
    // Force min date in IST
    const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    nowIST.setMinutes(nowIST.getMinutes() + 1);
    const year = nowIST.getFullYear();
    const month = String(nowIST.getMonth() + 1).padStart(2, '0');
    const day = String(nowIST.getDate()).padStart(2, '0');
    const hours = String(nowIST.getHours()).padStart(2, '0');
    const minutes = String(nowIST.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
          onChange={setMessage}
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
              onChange={handleScheduledForChange}
              required
              min={getMinDateTime()}
            />
            {scheduledFor && !isScheduledTimeValid() && (
              <p className="text-sm text-red-600">
                Please select a future date and time (IST)
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
