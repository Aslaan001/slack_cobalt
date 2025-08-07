"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageController = void 0;
const ScheduledMessage_1 = __importDefault(require("../models/ScheduledMessage"));
const User_1 = __importDefault(require("../models/User"));
const slackService_1 = require("../services/slackService");
exports.messageController = {
    async getChannels(req, res) {
        try {
            const { userId } = req.params;
            console.log('Getting channels for userId:', userId);
            if (!userId) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }
            const accessToken = await slackService_1.SlackService.getValidAccessToken(userId);
            console.log('Got valid access token for user:', userId);
            const channels = await slackService_1.SlackService.getChannels(accessToken);
            console.log('Retrieved channels count:', channels.length);
            res.json({ channels });
        }
        catch (error) {
            console.error('Get channels error:', error);
            // Check if it's a user not found error
            if (error instanceof Error && error.message.includes('User not found')) {
                res.status(404).json({
                    error: 'User not found',
                    details: 'Please re-authenticate with Slack'
                });
                return;
            }
            // Check if it's a token-related error
            if (error instanceof Error && (error.message.includes('Token') || error.message.includes('re-authenticate'))) {
                res.status(401).json({
                    error: 'Authentication required',
                    details: error.message,
                    solution: 'Please re-authenticate with Slack'
                });
                return;
            }
            // Provide specific error message for missing scopes
            if (error instanceof Error && error.message.includes('Missing required Slack scopes')) {
                res.status(403).json({
                    error: 'Slack app missing required permissions',
                    details: error.message,
                    solution: 'Please update your Slack app OAuth scopes and reinstall the app'
                });
                return;
            }
            // Generic error
            res.status(500).json({
                error: 'Failed to fetch channels',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async sendMessage(req, res) {
        try {
            const { userId } = req.params;
            const { channelId, message } = req.body;
            if (!channelId || !message) {
                res.status(400).json({ error: 'Channel ID and message are required' });
                return;
            }
            const accessToken = await slackService_1.SlackService.getValidAccessToken(userId);
            await slackService_1.SlackService.sendMessage(accessToken, channelId, message);
            res.json({ success: true, message: 'Message sent successfully' });
        }
        catch (error) {
            console.error('Send message error:', error);
            res.status(500).json({ error: 'Failed to send message' });
        }
    },
    async scheduleMessage(req, res) {
        try {
            const { userId } = req.params;
            const { channelId, channelName, message, scheduledFor } = req.body;
            if (!channelId || !channelName || !message || !scheduledFor) {
                res.status(400).json({ error: 'All fields are required' });
                return;
            }
            const user = await User_1.default.findOne({ slackUserId: userId });
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            const scheduledMessage = new ScheduledMessage_1.default({
                userId: user._id,
                channelId,
                channelName,
                message,
                scheduledFor: new Date(scheduledFor)
            });
            await scheduledMessage.save();
            res.json({
                success: true,
                message: 'Message scheduled successfully',
                scheduledMessage
            });
        }
        catch (error) {
            console.error('Schedule message error:', error);
            res.status(500).json({ error: 'Failed to schedule message' });
        }
    },
    async getScheduledMessages(req, res) {
        try {
            const { userId } = req.params;
            const { status, limit = '50' } = req.query;
            const user = await User_1.default.findOne({ slackUserId: userId });
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            // Build query filter
            const filter = { userId: user._id };
            // Add status filter if provided
            if (status && typeof status === 'string') {
                if (status === 'pending') {
                    filter.sent = false;
                    filter.status = 'pending';
                }
                else if (status === 'sent') {
                    filter.sent = true;
                    filter.status = 'sent';
                }
                else if (status === 'failed') {
                    filter.status = 'failed';
                }
            }
            const scheduledMessages = await ScheduledMessage_1.default.find(filter)
                .sort({ scheduledFor: -1 }) // Most recent first
                .limit(parseInt(limit));
            res.json({ scheduledMessages });
        }
        catch (error) {
            console.error('Get scheduled messages error:', error);
            res.status(500).json({ error: 'Failed to fetch scheduled messages' });
        }
    },
    async cancelScheduledMessage(req, res) {
        try {
            const { messageId } = req.params;
            const { userId } = req.query;
            const user = await User_1.default.findOne({ slackUserId: userId });
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            const scheduledMessage = await ScheduledMessage_1.default.findOneAndDelete({
                _id: messageId,
                userId: user._id,
                sent: false
            });
            if (!scheduledMessage) {
                res.status(404).json({ error: 'Scheduled message not found' });
                return;
            }
            res.json({ success: true, message: 'Scheduled message cancelled' });
        }
        catch (error) {
            console.error('Cancel scheduled message error:', error);
            res.status(500).json({ error: 'Failed to cancel scheduled message' });
        }
    }
};
//# sourceMappingURL=messageController.js.map