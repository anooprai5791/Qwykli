import asyncHandler from 'express-async-handler';
import Review from '../models/reviewModel.js';
import Booking from '../models/bookingModel.js';
import Provider from '../models/providerModel.js';
import { clearCache } from '../config/redis.js';
import { logger } from '../utils/logger.js';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { booking: bookingId, rating, comment } = req.body;

  // Validate booking exists
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if the booking belongs to the logged-in user
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to review this booking');
  }

  // Check if booking is completed
  if (booking.status !== 'completed') {
    res.status(400);
    throw new Error('Cannot review a booking that is not completed');
  }

  // Check if booking is already reviewed
  if (booking.isRated) {
    res.status(400);
    throw new Error('Booking is already reviewed');
  }

  // Create review
  const review = await Review.create({
    user: req.user._id,
    provider: booking.provider,
    booking: bookingId,
    rating,
    comment
  });

  if (review) {
    // Mark booking as rated
    booking.isRated = true;
    await booking.save();

    // Update provider rating
    const provider = await Provider.findById(booking.provider);
    
    // Calculate new rating
    const allReviews = await Review.find({ provider: provider._id });
    const totalRating = allReviews.reduce((sum, item) => sum + item.rating, 0);
    const newRating = totalRating / allReviews.length;
    
    provider.rating = newRating;
    provider.numReviews = allReviews.length;
    await provider.save();
    
    // Clear cache
    await clearCache(`__express__/api/providers/${provider._id}*`);
    
    logger.info(`Review created for booking ${bookingId} by user ${req.user._id}`);
    
    res.status(201).json(review);
  } else {
    res.status(400);
    throw new Error('Invalid review data');
  }
});

// @desc    Get reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
export const getProviderReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ 
    provider: req.params.providerId,
    isVisible: true 
  })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
    
  res.json(reviews);
});

// @desc    Get reviews by a user
// @route   GET /api/reviews/user
// @access  Private
export const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate('provider', 'name')
    .populate('booking', 'service scheduledDate')
    .sort({ createdAt: -1 });
    
  res.json(reviews);
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  
  // Check if the review belongs to the logged-in user
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this review');
  }
  
  review.rating = rating || review.rating;
  review.comment = comment || review.comment;
  
  const updatedReview = await review.save();
  
  // Update provider rating
  const provider = await Provider.findById(review.provider);
  
  // Calculate new rating
  const allReviews = await Review.find({ provider: provider._id });
  const totalRating = allReviews.reduce((sum, item) => sum + item.rating, 0);
  const newRating = totalRating / allReviews.length;
  
  provider.rating = newRating;
  await provider.save();
  
  // Clear cache
  await clearCache(`__express__/api/providers/${provider._id}*`);
  
  res.json(updatedReview);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  
  // Check if the review belongs to the logged-in user
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }
  
  // Instead of deleting, mark as invisible
  review.isVisible = false;
  await review.save();
  
  // Update provider rating
  const provider = await Provider.findById(review.provider);
  
  // Calculate new rating excluding this review
  const allReviews = await Review.find({ 
    provider: provider._id,
    isVisible: true 
  });
  
  if (allReviews.length > 0) {
    const totalRating = allReviews.reduce((sum, item) => sum + item.rating, 0);
    const newRating = totalRating / allReviews.length;
    provider.rating = newRating;
  } else {
    provider.rating = 0;
  }
  
  provider.numReviews = allReviews.length;
  await provider.save();
  
  // Clear cache
  await clearCache(`__express__/api/providers/${provider._id}*`);
  
  res.json({ message: 'Review removed' });
});