import express from 'express';
// import {
//   registerUser,
//   loginUser,
//   registerProvider,
//   loginProvider,
//   getUserProfile,
//   updateUserProfile,
//   enable2FA,
//   verify2FA,
//   disable2FA
// } from '../controllers/authController.js';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} from '../controllers/authController.js';
import { protectUser } from '../middleware/authMiddleware.js';
// import { validate, userSchemas, providerSchemas } from '../middleware/validationMiddleware.js';
import { validate, userSchemas } from '../middleware/validationMiddleware.js';

const router = express.Router();


// // User routes
// router.post('/register', validate(userSchemas.register), registerUser);
// router.post('/login', validate(userSchemas.login), loginUser);


// // Provider routes
// router.post('/provider/register', validate(providerSchemas.register), registerProvider);
// router.post('/provider/login', validate(userSchemas.login), loginProvider);
  

// // Profile routes
// router.route('/profile')
//   .get(protect, getUserProfile)
//   .put(protect, updateUserProfile);

//   router.post('/2fa/enable', protect, enable2FA);
// router.post('/2fa/verify', protect, verify2FA);
// router.post('/2fa/disable', protect, disable2FA);


// User Authentication Routes
router.post('/login', validate(userSchemas),loginUser);
router.post('/register', validate(userSchemas),registerUser);

// User Profile Routes (Protected)
router.route('/profile')
  .get(protectUser, getUserProfile)
  .put(protectUser, validate(userSchemas.updateProfile), updateUserProfile);

export default router;

