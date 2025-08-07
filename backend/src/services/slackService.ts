import axios from 'axios';
import User from '../models/User';

export interface SlackTokenResponse {
  ok: boolean;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  authed_user: {
    id: string;
    scope: string;
    access_token: string;
    token_type: string;
    expires_in?: number;
    refresh_token?: string;
  };
  team: {
    id: string;
    name: string;
  };
}

export interface SlackChannel {
  id: string;
  name: string;
  is_member: boolean;
}

export class SlackService {
  /**
   * Exchange long-lived access token for rotatable tokens
   * This is required when token rotation is enabled
   */
  private static async exchangeLongLivedToken(accessToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const response = await axios.post('https://slack.com/api/oauth.v2.exchange', null, {
      params: {
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        token: accessToken
      }
    });

    if (!response.data.ok) {
      throw new Error(`Token exchange failed: ${response.data.error}`);
    }

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in
    };
  }

  private static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
      params: {
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }
    });

    if (!response.data.ok) {
      throw new Error(`Token refresh failed: ${response.data.error}`);
    }

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in
    };
  }

  static async exchangeCodeForToken(code: string): Promise<SlackTokenResponse> {
    const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
      params: {
        code,
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        redirect_uri: process.env.SLACK_REDIRECT_URI
      }
    });

    if (!response.data.ok) {
      throw new Error(`OAuth failed: ${response.data.error}`);
    }

    return response.data;
  }

  static async getValidAccessToken(userId: string): Promise<string> {
    console.log('Getting valid access token for userId:', userId);
    
    const user = await User.findOne({ slackUserId: userId });
    if (!user) {
      console.error('User not found for userId:', userId);
      throw new Error('User not found');
    }

    console.log('User found, checking token expiration. Expires at:', user.tokenExpiresAt);
    console.log('Current time:', new Date());
    console.log('Has refresh token:', !!user.refreshToken);

    // Check if token is expired or will expire soon (within 5 minutes)
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    const isExpired = new Date() >= user.tokenExpiresAt || user.tokenExpiresAt <= fiveMinutesFromNow;
    
    if (isExpired) {
      console.log('Token is expired or will expire soon, attempting to refresh...');
      return await this.refreshUserToken(user);
    }

    // Even if token is not expired, validate it with Slack API
    try {
      console.log('Validating token with Slack API...');
      await this.validateTokenWithSlack(user.accessToken);
      console.log('Token is still valid, returning current access token');
      return user.accessToken;
    } catch (error) {
      console.log('Token validation failed, attempting to refresh...');
      return await this.refreshUserToken(user);
    }
  }

  private static async validateTokenWithSlack(accessToken: string): Promise<void> {
    try {
      const response = await axios.get('https://slack.com/api/auth.test', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!response.data.ok) {
        throw new Error(`Token validation failed: ${response.data.error}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error === 'invalid_auth') {
        throw new Error('Token is invalid');
      }
      throw error;
    }
  }

  private static async refreshUserToken(user: any): Promise<string> {
    // If no refresh token, try to exchange the long-lived token
    if (!user.refreshToken) {
      try {
        console.log('No refresh token found, attempting to exchange long-lived token...');
        const { accessToken, refreshToken, expiresIn } = await this.exchangeLongLivedToken(user.accessToken);
        
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        user.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
        await user.save();
        
        console.log('Successfully exchanged long-lived token for rotatable tokens');
        return accessToken;
      } catch (error) {
        console.error('Token exchange failed:', error);
        throw new Error('Token exchange failed. Please re-authenticate with Slack.');
      }
    }
    
    // Use refresh token to get new tokens
    try {
      console.log('Refreshing access token...');
      const { accessToken, refreshToken, expiresIn } = await this.refreshAccessToken(user.refreshToken);
      
      user.accessToken = accessToken;
      user.refreshToken = refreshToken; // New refresh token
      user.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
      await user.save();
      
      console.log('Successfully refreshed access token');
      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('Token refresh failed. Please re-authenticate with Slack.');
    }
  }

  static async getChannels(accessToken: string): Promise<SlackChannel[]> {
    try {
      console.log('Fetching channels from Slack API...');
      
      const response = await axios.get('https://slack.com/api/conversations.list', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { types: 'public_channel,private_channel' }
      });

      console.log('Slack API response status:', response.status);
      console.log('Slack API response data:', response.data);

      if (!response.data.ok) {
        if (response.data.error === 'missing_scope') {
          throw new Error(`Missing required Slack scopes. Please ensure your Slack app has the following scopes: channels:read, groups:read, chat:write, chat:write.public, users:read. Error: ${response.data.error}`);
        }
        throw new Error(`Failed to fetch channels: ${response.data.error}`);
      }

      const channels = response.data.channels.filter((channel: any) => channel.is_member);
      console.log('Filtered channels count:', channels.length);
      
      return channels;
    } catch (error) {
      console.error('Error in getChannels:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Slack API Error Response:', error.response?.data);
        console.error('Slack API Error Status:', error.response?.status);
        throw new Error(`Slack API error: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  static async sendMessage(accessToken: string, channelId: string, message: string): Promise<void> {
    const response = await axios.post('https://slack.com/api/chat.postMessage', {
      channel: channelId,
      text: message
    }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.data.ok) {
      throw new Error(`Failed to send message: ${response.data.error}`);
    }
  }
} 