import React from 'react';
import { Select } from '../ui/Select';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useChannels } from '../../hooks/useApi';
import { SlackChannel } from '../../types';

interface ChannelSelectorProps {
  selectedChannel: string;
  onChannelChange: (channelId: string, channelName: string) => void;
}

export const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  selectedChannel,
  onChannelChange,
}) => {
  const { data: channelsData, isLoading, error } = useChannels();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <LoadingSpinner size="sm" />
        <span className="text-sm text-gray-600">Loading channels...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        Failed to load channels. Please try again.
      </div>
    );
  }

  const channels = channelsData?.channels || [];
  
  const channelOptions = channels.map((channel: SlackChannel) => ({
    value: channel.id,
    label: `${channel.is_private ? '🔒' : '#'} ${channel.name}`,
  }));

  const handleChange = (channelId: string) => {
    const channel = channels.find((c: SlackChannel) => c.id === channelId);
    if (channel) {
      onChannelChange(channelId, channel.name);
    }
  };

  return (
    <Select
      label="Select Channel"
      value={selectedChannel}
      onChange={handleChange}
      options={channelOptions}
      placeholder="Choose a Slack channel"
      required
    />
  );
};