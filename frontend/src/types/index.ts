export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_private: boolean;
  is_member: boolean;
  num_members: number;
  topic: {
    value: string;
    creator: string;
    last_set: number;
  };
  purpose: {
    value: string;
    creator: string;
    last_set: number;
  };
}

export interface ScheduledMessage {
  _id: string;
  userId: string;
  channelId: string;
  channelName: string;
  message: string;
  scheduledFor: string;
  sent: boolean;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface UserState {
  userId: string | null;
  isAuthenticated: boolean;
  hasTokenRotation: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  userId: string;
  hasTokenRotation: boolean;
}

export interface ChannelsResponse {
  channels: SlackChannel[];
}

export interface ScheduledMessagesResponse {
  scheduledMessages: ScheduledMessage[];
}

export interface SendMessageRequest {
  channelId: string;
  message: string;
}

export interface ScheduleMessageRequest {
  channelId: string;
  channelName: string;
  message: string;
  scheduledFor: string;
}