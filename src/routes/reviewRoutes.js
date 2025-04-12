import express from 'express';
import {
  createReview,
  getProviderReviews,
  getUserReviews,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protectUser,admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protectUser, createReview);
router.get('/provider/:providerId', getProviderReviews);
router.get('/user', protectUser, getUserReviews);
router.put('/:id', protectUser, updateReview);
router.delete('/:id', protectUser, deleteReview);

// router.get('/', protect, admin, getAllReviews);
// router.put('/:id/toggle-visibility', protect, admin, toggleReviewVisibility);

export default router;