import express from 'express';
import { protectUser, admin } from '../middleware/authMiddleware.js';
import { updateLanguagePreference } from '../controllers/userController.js';

const router = express.Router();

router.put('/language', protectUser, updateLanguagePreference);

export default router;