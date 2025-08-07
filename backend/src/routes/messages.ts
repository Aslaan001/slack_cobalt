import { Router } from 'express';
import { messageController } from '../controllers/messageController';

const router = Router();

router.get('/channels/:userId', messageController.getChannels);
router.post('/send/:userId', messageController.sendMessage);
router.post('/schedule/:userId', messageController.scheduleMessage);
router.get('/scheduled/:userId', messageController.getScheduledMessages);
router.delete('/scheduled/:messageId', messageController.cancelScheduledMessage);

export default router; 