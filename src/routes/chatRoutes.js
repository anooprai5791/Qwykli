import express from 'express';
import { upload } from '../controllers/chatController.js';
import {
  createChat,
  getChatByBookingId,
  sendMessage,
} from '../controllers/chatController.js';
import { protectUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protectUser, createChat);
router.get('/:bookingId', protectUser, getChatByBookingId);
router.post('/:bookingId/messages', protectUser,upload.single('file'), sendMessage);

export default router;