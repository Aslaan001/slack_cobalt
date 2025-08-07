import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

router.get('/initiate', authController.initiateAuth);
router.get('/callback', authController.handleCallback);
router.delete('/logout/:userId', authController.logout);
router.post('/exchange-tokens/:userId', authController.exchangeTokens);

export default router; 