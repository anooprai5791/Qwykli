// import express from 'express';
// import {
//   getAllUsers,
//   getUserById,
//   updateUser,
//   deleteUser,
//   getAllProviders,
//   getProviderById,
//   updateProvider,
//   deleteProvider,
//   getAllBookings,
//   getBookingById,
//   updateBooking,
//   deleteBooking,
//   getAllReviews,
//   getReviewById,
//   updateReview,
//   deleteReview,
//   getSystemAnalytics,
//   AddUser
// } from '../controllers/adminController.js';
// import { protect, admin } from '../middleware/authMiddleware.js';

// const router = express.Router();

// // User management
// router.get('/users',protect,admin,getAllUsers);
// router.get('/users/:id', protect, admin, getUserById);
// router.put('/users/:id', protect, admin, updateUser);
// router.delete('/users/:id', protect, admin, deleteUser);
// router.post('/add',AddUser);

// // Provider management
// router.get('/providers', protect, admin, getAllProviders);
// router.get('/providers/:id', protect, admin, getProviderById);
// router.put('/providers/:id', protect, admin, updateProvider);
// router.delete('/providers/:id', protect, admin, deleteProvider);

// // Booking management
// router.get('/bookings', protect, admin, getAllBookings);
// router.get('/bookings/:id', protect, admin, getBookingById);
// router.put('/bookings/:id', protect, admin, updateBooking);
// router.delete('/bookings/:id', protect, admin, deleteBooking);

// // Review management
// router.get('/reviews', protect, admin, getAllReviews);
// router.get('/reviews/:id', protect, admin, getReviewById);
// router.put('/reviews/:id', protect, admin, updateReview);
// router.delete('/reviews/:id', protect, admin, deleteReview);

// // Analytics
// router.get('/analytics', protect, admin, getSystemAnalytics);

// export default router;


import express from 'express';
import {
  createAdminUser,
  updateAdminStatus,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllProviders,
  getProviderById,
  updateProvider,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getSystemAnalytics,
  AddUser,
  addProvider,
  deleteProvider
} from '../controllers/adminController.js';
import { protectUser, admin } from '../middleware/authMiddleware.js';
import {validate,providerSchemas} from "../middleware/validationMiddleware.js";

const router = express.Router();

// Admin user management
router.post('/users/create-admin', protectUser, admin, createAdminUser);
router.put('/users/:id/admin-status', protectUser, admin, updateAdminStatus);

// User management
router.get('/users', protectUser, admin, getAllUsers);
router.get('/users/:id', protectUser, admin, getUserById);
router.put('/users/:id', protectUser, admin, updateUser);
router.delete('/users/:id', protectUser, admin, deleteUser);
router.post('/users/add', protectUser, admin, AddUser);

// Provider management
router.get('/providers', protectUser, admin, getAllProviders);
router.get('/providers/:id', protectUser, admin, getProviderById);
router.put('/providers/:id', protectUser, admin, updateProvider);
router.delete('/providers/:id', protectUser, admin, deleteProvider);
router.route('/providers')
  .post(
    protectUser,
    admin,
    validate(providerSchemas.create),
    addProvider
  );

// Booking management
router.get('/bookings', protectUser, admin, getAllBookings);
router.get('/bookings/:id', protectUser, admin, getBookingById);
router.put('/bookings/:id', protectUser, admin, updateBooking);
router.delete('/bookings/:id', protectUser, admin, deleteBooking);

// Review management
router.get('/reviews', protectUser, admin, getAllReviews);
router.get('/reviews/:id', protectUser, admin, getReviewById);
router.put('/reviews/:id', protectUser, admin, updateReview);
router.delete('/reviews/:id', protectUser, admin, deleteReview);

// Analytics
router.get('/analytics', protectUser, admin, getSystemAnalytics);

export default router;