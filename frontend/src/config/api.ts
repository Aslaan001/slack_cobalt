export const API_ENDPOINTS = {
  // Auth endpoints
  INITIATE_AUTH: '/api/auth/initiate',
  AUTH_CALLBACK: '/api/auth/callback',
  EXCHANGE_TOKENS: (userId: string) => `/api/auth/exchange-tokens/${userId}`,
  LOGOUT: (userId: string) => `/api/auth/logout/${userId}`,
  
  // Message endpoints
  GET_CHANNELS: (userId: string) => `/api/messages/channels/${userId}`,
  SEND_MESSAGE: (userId: string) => `/api/messages/send/${userId}`,
  SCHEDULE_MESSAGE: (userId: string) => `/api/messages/schedule/${userId}`,
  GET_SCHEDULED_MESSAGES: (userId: string) => `/api/messages/scheduled/${userId}`,
  CANCEL_SCHEDULED_MESSAGE: (messageId: string, userId: string) => `/api/messages/scheduled/${messageId}?userId=${userId}`,
} as const;