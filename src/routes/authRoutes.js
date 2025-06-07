import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  requestUserOTP,
  verifyUserOTP,
  checkUserExists,
  updateUserName,
} from '../controllers/authController.js';
import { protectAny, protectUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// User Authentication Routes
router.post('/login', loginUser);
router.post('/register', registerUser);

// Add new OTP-based authentication routes
// And using it correctly in your routes
router.post('/request-otp', requestUserOTP);
router.post('/verify-otp', verifyUserOTP);

router.post('/check-user', checkUserExists);

router.put('/update-name', protectUser, updateUserName);

// User Profile Routes (Protected)
router.route('/profile')
  .get(protectUser, getUserProfile)
  .put(protectUser, updateUserProfile);

export default router;

