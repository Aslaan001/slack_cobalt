import cron from 'node-cron';
import { SlackService } from './slackService';
import ScheduledMessage from '../models/ScheduledMessage';
import User from '../models/User';

export class SchedulerService {
  static initScheduler(): void {
    // Check for scheduled messages every minute
    cron.schedule('* * * * *', async () => {
      try {
        await this.processScheduledMessages();
      } catch (error) {
        console.error('Scheduler error:', error);
      }
    });

    console.log('Ultra-optimized scheduler initialized - checking every minute');
  }

  private static async processScheduledMessages(): Promise<void> {
    const now = new Date();
    
    // 1. Single query to get all scheduled messages with user data
    const scheduledMessages = await ScheduledMessage
      .find({ scheduledFor: { $lte: now }, sent: false })
      .populate('userId', 'slackUserId accessToken refreshToken tokenExpiresAt')
      .lean();

    if (scheduledMessages.length === 0) return;

    console.log(`Processing ${scheduledMessages.length} scheduled messages`);

    // 2. Process everything in parallel with error handling
    const results = await Promise.allSettled(
      scheduledMessages.map(message => this.processSingleMessage(message))
    );

    // 3. Separate successful and failed results
    const successful = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<any>).value);
      
    const failed = results
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason);

    // 4. Two bulk operations total - one for success, one for failure
    await this.bulkUpdateResults(successful, failed);

    console.log(`Processing complete: ${successful.length} sent, ${failed.length} failed`);
  }

  private static async processSingleMessage(message: any): Promise<any> {
    try {
      // Get valid access token for the user
      const accessToken = await SlackService.getValidAccessToken(message.userId.slackUserId);
      
      // Send message to Slack
      await SlackService.sendMessage(accessToken, message.channelId, message.message);
      
      console.log(`Message sent successfully: ${message._id}`);
      
      return { 
        messageId: message._id, 
        success: true,
        sentAt: new Date()
      };
    } catch (error) {
      console.error(`Failed to send message ${message._id}:`, error);
      
      return {
        messageId: message._id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        failedAt: new Date()
      };
    }
  }

  private static async bulkUpdateResults(successful: any[], failed: any[]): Promise<void> {
    const operations = [];
    
    // Bulk update for successful messages
    if (successful.length > 0) {
      operations.push({
        updateMany: {
          filter: { _id: { $in: successful.map(s => s.messageId) } },
          update: { 
            $set: { 
              sent: true, 
              sentAt: { $each: successful.map(s => s.sentAt) },
              status: 'sent'
            } 
          }
        }
      });
      console.log(`Bulk updating ${successful.length} successful messages`);
    }
    
    // Bulk update for failed messages
    if (failed.length > 0) {
      operations.push({
        updateMany: {
          filter: { _id: { $in: failed.map(f => f.messageId) } },
          update: { 
            $set: { 
              sent: false, 
              failed: true, 
              failedAt: { $each: failed.map(f => f.failedAt) },
              failureReason: { $each: failed.map(f => f.error) },
              status: 'failed'
            } 
          }
        }
      });
      console.log(`Bulk updating ${failed.length} failed messages`);
    }
    
    // Execute all operations in one bulk write
    if (operations.length > 0) {
      try {
        await ScheduledMessage.bulkWrite(operations);
        console.log(`Bulk operations completed successfully`);
      } catch (error) {
        console.error('Bulk update failed:', error);
        // Fallback to individual updates if bulk fails
        await this.fallbackIndividualUpdates(successful, failed);
      }
    }
  }

  private static async fallbackIndividualUpdates(successful: any[], failed: any[]): Promise<void> {
    console.log('Falling back to individual updates...');
    
    // Update successful messages individually
    for (const message of successful) {
      try {
        await ScheduledMessage.updateOne(
          { _id: message.messageId },
          { 
            $set: { 
              sent: true, 
              sentAt: message.sentAt,
              status: 'sent'
            } 
          }
        );
      } catch (error) {
        console.error(`Failed to update successful message ${message.messageId}:`, error);
      }
    }

    // Update failed messages individually
    for (const message of failed) {
      try {
        await ScheduledMessage.updateOne(
          { _id: message.messageId },
          { 
            $set: { 
              sent: false, 
              failed: true, 
              failedAt: message.failedAt,
              failureReason: message.error,
              status: 'failed'
            } 
          }
        );
      } catch (error) {
        console.error(`Failed to update failed message ${message.messageId}:`, error);
      }
    }
  }
} 