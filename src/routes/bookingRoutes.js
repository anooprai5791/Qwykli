// import express from 'express';
// import {
//   createBooking,
//   getUserBookings,
//   getProviderBookings,
//   getBookingById,
//   updateBookingStatus,
//   updateBookingPrice,
//   cancelBooking,
//   updatePaymentStatus
// } from '../controllers/bookingController.js';
// import { protect, provider } from '../middleware/authMiddleware.js';
// import { validate, bookingSchemas } from '../middleware/validationMiddleware.js';

// const router = express.Router();

// router.route('/')
//   .post(protect, validate(bookingSchemas.create), createBooking)
//   .get(protect, getUserBookings);

// router.get('/provider', protect, provider, getProviderBookings);

// router.route('/:id')
//   .get(protect, getBookingById);

// router.route('/:id/status')
//   .put(protect, provider, validate(bookingSchemas.updateStatus), updateBookingStatus);

// router.route('/:id/price')
//   .put(protect, provider, validate(bookingSchemas.updatePrice), updateBookingPrice);

// router.route('/:id/cancel')
//   .put(protect, cancelBooking);

// router.route('/:id/payment')
//   .put(protect, updatePaymentStatus);

// export default router;

import express from 'express';
import {
  createBooking,
  getUserBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  updateBookingPrice,
  cancelBooking,
  updatePaymentStatus
} from '../controllers/bookingController.js';
import { protectUser, protectProvider } from '../middleware/authMiddleware.js';
import { validate, bookingSchemas } from '../middleware/validationMiddleware.js';

const router = express.Router();

// User routes
router.route('/')
  .post(
    protectUser,
    validate(bookingSchemas.create),
    createBooking
  )
  .get(
    protectUser,
    getUserBookings
  );

// Provider routes
router.get('/provider',
  protectProvider,
  getProviderBookings
);

// Shared routes (protected by either user or provider auth)
router.route('/:id')
  .get(
    protectUser,
    getBookingById
  )
  .get(
    protectProvider,
    getBookingById
  );

// Provider-only routes
router.route('/:id/status')
  .put(
    protectProvider,
    validate(bookingSchemas.updateStatus),
    updateBookingStatus
  );

router.route('/:id/price')
  .put(
    protectProvider,
    validate(bookingSchemas.updatePrice),
    updateBookingPrice
  );

// User-only routes
router.route('/:id/cancel')
  .put(
    protectUser,
    cancelBooking
  );

router.route('/:id/payment')
  .put(
    protectUser,
    validate(bookingSchemas.payment),
    updatePaymentStatus
  );

export default router;