import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI, messageAPI } from '../services/api';
import { useAuthStore } from './useAuth';

export const useChannels = () => {
  const { userId } = useAuthStore();
  
  return useQuery({
    queryKey: ['channels', userId],
    queryFn: () => messageAPI.getChannels(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useScheduledMessages = (filterStatus: 'all' | 'pending' | 'sent' | 'failed' = 'all') => {
  const { userId } = useAuthStore();
  
  return useQuery({
    queryKey: ['scheduledMessages', userId, filterStatus],
    queryFn: () => messageAPI.getScheduledMessages(userId!, filterStatus),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useSendMessage = () => {
  const { userId } = useAuthStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { channelId: string; message: string }) =>
      messageAPI.sendMessage(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledMessages'] });
    },
  });
};

export const useScheduleMessage = () => {
  const { userId } = useAuthStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { channelId: string; channelName: string; message: string; scheduledFor: string }) =>
      messageAPI.scheduleMessage(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledMessages'] });
    },
  });
};

export const useCancelMessage = () => {
  const { userId } = useAuthStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageId: string) =>
      messageAPI.cancelScheduledMessage(messageId, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledMessages'] });
    },
  });
};

export const useLogout = () => {
  const { userId, clearUser } = useAuthStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authAPI.logout(userId!),
    onSuccess: () => {
      clearUser();
      queryClient.clear();
    },
  });
};