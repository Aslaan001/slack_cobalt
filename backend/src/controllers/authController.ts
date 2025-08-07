import { Request, Response } from 'express';

import User from '../models/User';
import { SlackService } from '../services/slackService';

export const authController = {
  async initiateAuth(req: Request, res: Response): Promise<void> {
    const scopes = 'chat:write,channels:read,channels:history';
    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&user_scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(process.env.SLACK_REDIRECT_URI || '')}`;
    
    res.json({ authUrl });
  },

  async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.query;
      
      if (!code || typeof code !== 'string') {
        // Redirect to frontend with error
        const errorUrl = `${process.env.FRONTEND_URL}/login?error=no_code`;
        res.redirect(errorUrl);
        return;
      }

      const tokenData = await SlackService.exchangeCodeForToken(code);
      
      console.log('Token data received:', {
        ok: tokenData.ok,
        hasRefreshToken: !!tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        userId: tokenData.authed_user?.id,
        teamId: tokenData.team?.id,
        userTokenExpiresIn: tokenData.authed_user?.expires_in,
        userTokenHasRefresh: !!tokenData.authed_user?.refresh_token
      });
      
      // Handle token expiration - use user token expiration if available, otherwise default
      const expiresIn = tokenData.authed_user?.expires_in || tokenData.expires_in || 3600; // Default to 1 hour
      const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
      
      const userData = {
        slackUserId: tokenData.authed_user.id,
        slackTeamId: tokenData.team.id,
        accessToken: tokenData.authed_user.access_token,
        refreshToken: tokenData.authed_user.refresh_token || tokenData.refresh_token || null,
        tokenExpiresAt: tokenExpiresAt
      };

      const savedUser = await User.findOneAndUpdate(
        { slackUserId: userData.slackUserId },
        userData,
        { upsert: true, new: true }
      );

      console.log('User saved successfully:', {
        userId: savedUser.slackUserId,
        hasRefreshToken: !!savedUser.refreshToken,
        expiresAt: savedUser.tokenExpiresAt,
        tokenType: tokenData.authed_user?.token_type || 'unknown'
      });

      // Redirect to frontend with success and user data
      const successUrl = `${process.env.FRONTEND_URL}/auth/callback?success=true&userId=${userData.slackUserId}&hasTokenRotation=${!!userData.refreshToken}`;
      res.redirect(successUrl);
    } catch (error) {
      console.error('OAuth callback error:', error);
      // Redirect to frontend with error
      const errorUrl = `${process.env.FRONTEND_URL}/login?error=auth_failed`;
      res.redirect(errorUrl);
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      await User.findOneAndDelete({ slackUserId: userId });
      
      res.json({ 
        success: true, 
        message: 'User logged out successfully' 
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  },

  async exchangeTokens(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const user = await User.findOne({ slackUserId: userId });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Try to exchange the long-lived token for rotatable tokens
      const { accessToken, refreshToken, expiresIn } = await SlackService['exchangeLongLivedToken'](user.accessToken);
      
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      user.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
      await user.save();
      
      res.json({ 
        success: true, 
        message: 'Successfully exchanged tokens for token rotation',
        expiresIn,
        expiresAt: user.tokenExpiresAt
      });
    } catch (error) {
      console.error('Token exchange error:', error);
      res.status(500).json({ 
        error: 'Token exchange failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}; 