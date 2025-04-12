import express from 'express';
import {
  requestProviderOTP,
  registerProvider,
  requestProviderLoginOTP,
  loginProvider,
  refreshProviderToken
} from '../controllers/authController.js';
import { validate, providerSchemas } from '../middleware/validationMiddleware.js';
import upload from '../middleware/multerMiddleware.js';

const router = express.Router();

// Provider Registration Flow
router.post('/register/request-otp', validate(providerSchemas.requestOTP), requestProviderOTP);
router.post('/register/verify', validate(providerSchemas.register),  upload.fields([
  { name: 'aadhar_card', maxCount: 1 },
  { name: 'pan_card', maxCount: 1 },
  { name: 'photo', maxCount: 1 } 
]), registerProvider);

// Provider Login Flow
router.post('/login/request-otp', validate(providerSchemas.requestOTP), requestProviderLoginOTP);
router.post('/login/verify', validate(providerSchemas.verifyOTP), loginProvider);

// Token Refresh
router.post('/token/refresh', refreshProviderToken);

export default router;