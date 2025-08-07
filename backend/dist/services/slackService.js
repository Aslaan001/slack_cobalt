"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackService = void 0;
const axios_1 = __importDefault(require("axios"));
const User_1 = __importDefault(require("../models/User"));
class SlackService {
    /**
     * Exchange long-lived access token for rotatable tokens
     * This is required when token rotation is enabled
     */
    static async exchangeLongLivedToken(accessToken) {
        const response = await axios_1.default.post('https://slack.com/api/oauth.v2.exchange', null, {
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
    static async refreshAccessToken(refreshToken) {
        const response = await axios_1.default.post('https://slack.com/api/oauth.v2.access', null, {
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
    static async exchangeCodeForToken(code) {
        const response = await axios_1.default.post('https://slack.com/api/oauth.v2.access', null, {
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
    static async getValidAccessToken(userId) {
        console.log('Getting valid access token for userId:', userId);
        const user = await User_1.default.findOne({ slackUserId: userId });
        if (!user) {
            console.error('User not found for userId:', userId);
            throw new Error('User not found');
        }
        console.log('User found, checking token expiration. Expires at:', user.tokenExpiresAt);
        console.log('Current time:', new Date());
        console.log('Has refresh token:', !!user.refreshToken);
        // Check if token is expired or will expire soon (within 5 minutes)
        const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
        if (new Date() >= user.tokenExpiresAt || user.tokenExpiresAt <= fiveMinutesFromNow) {
            console.log('Token is expired or will expire soon, attempting to refresh...');
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
                }
                catch (error) {
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
            }
            catch (error) {
                console.error('Token refresh failed:', error);
                throw new Error('Token refresh failed. Please re-authenticate with Slack.');
            }
        }
        console.log('Token is still valid, returning current access token');
        return user.accessToken;
    }
    static async getChannels(accessToken) {
        try {
            console.log('Fetching channels from Slack API...');
            const response = await axios_1.default.get('https://slack.com/api/conversations.list', {
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
            const channels = response.data.channels.filter((channel) => channel.is_member);
            console.log('Filtered channels count:', channels.length);
            return channels;
        }
        catch (error) {
            console.error('Error in getChannels:', error);
            if (axios_1.default.isAxiosError(error)) {
                console.error('Slack API Error Response:', error.response?.data);
                console.error('Slack API Error Status:', error.response?.status);
                throw new Error(`Slack API error: ${error.response?.data?.error || error.message}`);
            }
            throw error;
        }
    }
    static async sendMessage(accessToken, channelId, message) {
        const response = await axios_1.default.post('https://slack.com/api/chat.postMessage', {
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
exports.SlackService = SlackService;
//# sourceMappingURL=slackService.js.map