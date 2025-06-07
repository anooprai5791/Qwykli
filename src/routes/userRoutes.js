import express from 'express';
import { protectUser, admin } from '../middleware/authMiddleware.js';
import { updateLanguagePreference , updateUserLocation } from '../controllers/userController.js';

const router = express.Router();

// location endpoint
router.route('/location').put(protectUser, updateUserLocation);
// profile endpoint to get user data including location
// router.route('/profile').get(protectUser, getUserProfile);
// language endpoint
router.put('/language', protectUser, updateLanguagePreference);

export default router;