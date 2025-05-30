import express from 'express';
import {
  createTempBooking,
  getUserTempBookings,
  // getAllTempBookings,
  getTempBookingById
} from '../controllers/tempBookingController.js';
import { protectUser, 
  // protectAdmin 
} from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { tempbookingSchemas } from '../middleware/validationMiddleware.js';

const router = express.Router();

// User routes
router.route('/')
  .post(
    protectUser,
    validate(tempbookingSchemas.tempBooking.create),
    createTempBooking
  )
  .get(
    protectUser,
    getUserTempBookings
  );

// // Admin routes
// router.get('/admin',
//   protectAdmin,
//   getAllTempBookings
// );

// Get single temp booking by ID
router.get('/:id',
  protectUser,
  getTempBookingById
);

export default router;