import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import {
  AuthResponse,
  ChannelsResponse,
  ScheduledMessagesResponse,
  SendMessageRequest,
  ScheduleMessageRequest,
  ApiResponse,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 10000,
});

// Auth API calls
export const authAPI = {
  initiateAuth: async (): Promise<{ authUrl: string }> => {
    const { data } = await api.get(API_ENDPOINTS.INITIATE_AUTH);
    return data;
  },

  handleCallback: async (code: string): Promise<AuthResponse> => {
    const { data } = await api.get(`${API_ENDPOINTS.AUTH_CALLBACK}?code=${code}`);
    return data;
  },

  exchangeTokens: async (userId: string): Promise<ApiResponse<any>> => {
    const { data } = await api.post(API_ENDPOINTS.EXCHANGE_TOKENS(userId));
    return data;
  },

  logout: async (userId: string): Promise<ApiResponse<any>> => {
    const { data } = await api.delete(API_ENDPOINTS.LOGOUT(userId));
    return data;
  },
};

// Message API calls
export const messageAPI = {
  getChannels: async (userId: string): Promise<ChannelsResponse> => {
    const { data } = await api.get(API_ENDPOINTS.GET_CHANNELS(userId));
    return data;
  },

  sendMessage: async (userId: string, request: SendMessageRequest): Promise<ApiResponse<any>> => {
    const { data } = await api.post(API_ENDPOINTS.SEND_MESSAGE(userId), request);
    return data;
  },

  scheduleMessage: async (userId: string, request: ScheduleMessageRequest): Promise<ApiResponse<any>> => {
    const { data } = await api.post(API_ENDPOINTS.SCHEDULE_MESSAGE(userId), request);
    return data;
  },

  getScheduledMessages: async (userId: string, filterStatus: 'all' | 'pending' | 'sent' | 'failed' = 'all'): Promise<ScheduledMessagesResponse> => {
    const params = new URLSearchParams();
    if (filterStatus !== 'all') {
      params.append('status', filterStatus);
    }
    const { data } = await api.get(`${API_ENDPOINTS.GET_SCHEDULED_MESSAGES(userId)}?${params.toString()}`);
    return data;
  },

  cancelScheduledMessage: async (messageId: string, userId: string): Promise<ApiResponse<any>> => {
    const { data } = await api.delete(API_ENDPOINTS.CANCEL_SCHEDULED_MESSAGE(messageId, userId));
    return data;
  },
};