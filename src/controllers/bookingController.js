// import asyncHandler from 'express-async-handler';
// import Booking from '../models/bookingModel.js';
// import Provider from '../models/providerModel.js';
// import Service from '../models/serviceModel.js';
// import User from '../models/userModel.js';
// import { clearCache } from '../config/redis.js';
// import { sendEmail } from '../config/sendgrid.js';
// import { io } from '../../server.js';
// import { sendSMS } from '../utils/sms.js';
// import { sendPushNotification } from '../config/firebase.js';

// // @desc    Create a new booking
// // @route   POST /api/bookings
// // @access  Private
// export const createBooking = asyncHandler(async (req, res) => {
//   const { 
//     name, email, address,
//     provider: providerId, 
//     service: serviceId, 
//     scheduledDate, 
//     location, 
//     notes 
//   } = req.body;

//   // Validate provider exists
//   const provider = await Provider.findById(providerId);
//   if (!provider) {
//     res.status(404);
//     throw new Error('Provider not found');
//   }

//   // Validate service exists
//   const service = await Service.findById(serviceId);
//   if (!service) {
//     res.status(404);
//     throw new Error('Service not found');
//   }

//   // Check if provider offers this service
//   const providerService = provider.services.find(
//     s => s.service.toString() === serviceId && s.isActive
//   );
  
//   if (!providerService) {
//     res.status(400);
//     throw new Error('Provider does not offer this service');
//   }

//   // const { name, email, address, location, notes } = req.body;
//   const userId = req.user._id;

//   // Find the user
//   const user = await User.findById(userId);

//   if (!user) {
//     res.status(404);
//     throw new Error('User not found');
//   }

//   // Update user details (if provided)
//   if (name) user.name = name;
//   if (email) user.email = email;
//   if (address) user.address = address;
//   if (location) user.location = location;
//   await user.save();

//   // Create booking
//   const booking = await Booking.create({
//     user: req.user._id,
//     provider: providerId,
//     service: serviceId,
//     initialPrice: providerService.price,
//     scheduledDate: new Date(scheduledDate),
//     location,
//     address,
//     notes
//   });


//     // Notify the provider
//     io.to(providerId).emit('newBooking', {
//       message: req.t('newBooking'),
//       booking,
//     });

//     // Notify the user
//     io.to(req.user._id).emit('bookingCreated', {
//       message:req.t('bookingConfirmed'),
//       booking,
//     });

//     if (provider.fcmToken) {
//       await sendPushNotification(
//         provider.fcmToken,
//         req.t('newBooking'),
//         req.t('newBookingMessage', { bookingId: booking._id })
//       );
//     }

//     res.status(201).json({ message: req.t('bookingCreated'), booking });
  

//   if (booking) {

    
  

//     const user = await User.findById(req.user._id);
//     const templatePath = path.join(__dirname, '../templates/bookingConfirmation.html');
//     const template = fs.readFileSync(templatePath, 'utf8');

//     const emailContent = template
//       .replace('{{name}}', user.name)
//       .replace('{{service}}', service.name)
//       .replace('{{provider}}', provider.name)
//       .replace('{{date}}', new Date(scheduledDate).toLocaleDateString())
//       .replace('{{time}}', new Date(scheduledDate).toLocaleTimeString());

//     await sendEmail(
//       user.email,
//       'Booking Confirmation',
//       `Your booking for ${service.name} has been confirmed.`,
//       emailContent
//     );

//     await sendSMS(user.phone, req.t('bookingConfirmedSMS', { bookingId: booking._id }));

//     res.status(201).json(booking);
//   } else {
//     res.status(500).json({ message: req.t('internalServerError') });
//     throw new Error('Invalid booking data');
//   }
// });

// // @desc    Get all bookings for logged in user
// // @route   GET /api/bookings
// // @access  Private
// export const getUserBookings = asyncHandler(async (req, res) => {
//   const bookings = await Booking.find({ user: req.user._id })
//     .populate('provider', 'name phone')
//     .populate('service', 'name')
//     .sort({ scheduledDate: -1 });
    
//   res.json(bookings);
// });

// // @desc    Get all bookings for provider
// // @route   GET /api/bookings/provider
// // @access  Private/Provider
// export const getProviderBookings = asyncHandler(async (req, res) => {
//   // Find the provider associated with the logged-in user
//   const provider = await Provider.findOne({ user: req.user._id });

//   if (!provider) {
//     res.status(404);
//     throw new Error('Provider profile not found');
//   }
  
//   const bookings = await Booking.find({ provider: provider._id })
//     .populate('user', 'name phone')
//     .populate('service', 'name')
//     .sort({ scheduledDate: -1 });
    
//   res.json(bookings);
// });

// // @desc    Get booking by ID
// // @route   GET /api/bookings/:id
// // @access  Private
// export const getBookingById = asyncHandler(async (req, res) => {
//   const booking = await Booking.findById(req.params.id)
//     .populate('user', 'name phone')
//     .populate('provider', 'name phone')
//     .populate('service', 'name description');
  
//   if (booking) {
//     // Check if the booking belongs to the logged-in user or provider
//     const provider = await Provider.findOne({ user: req.user._id });
    
//     if (
//       booking.user._id.toString() === req.user._id.toString() || 
//       (provider && booking.provider._id.toString() === provider._id.toString())
//     ) {
//       res.json(booking);
//     } else {
//       res.status(403);
//       throw new Error('Not authorized to access this booking');
//     }
//   } else {
//     res.status(404);
//     throw new Error('Booking not found');
//   }
// });

// // @desc    Update booking status
// // @route   PUT /api/bookings/:id/status
// // @access  Private/Provider
// export const updateBookingStatus = asyncHandler(async (req, res) => {
//   const { status } = req.body;
  
//   const booking = await Booking.findById(req.params.id);
  
//   if (!booking) {
//     res.status(404);
//     throw new Error('Booking not found');
//   }
  
//   // Find the provider associated with the logged-in user
//   const provider = await Provider.findOne({ user: req.user._id });

//   if (!provider) {
//     res.status(404);
//     throw new Error('Provider profile not found');
//   }
  
//   // Check if the booking belongs to this provider
//   if (booking.provider.toString() !== provider._id.toString()) {
//     res.status(403);
//     throw new Error('Not authorized to update this booking');
//   }
  
//   booking.status = status;
  
//   // If status is completed, set completedDate
//   if (status === 'completed') {
//     booking.completedDate = new Date();
//   }
  
//   const updatedBooking = await booking.save();
  
//   res.json(updatedBooking);
// });

// // @desc    Update booking final price
// // @route   PUT /api/bookings/:id/price
// // @access  Private/Provider
// export const updateBookingPrice = asyncHandler(async (req, res) => {
//   const { finalPrice, notes } = req.body;
  
//   const booking = await Booking.findById(req.params.id);
  
//   if (!booking) {
//     res.status(404);
//     throw new Error('Booking not found');
//   }
  
//   // Find the provider associated with the logged-in user
//   const provider = await Provider.findOne({ user: req.user._id });

//   if (!provider) {
//     res.status(404);
//     throw new Error('Provider profile not found');
//   }
  
//   // Check if the booking belongs to this provider
//   if (booking.provider.toString() !== provider._id.toString()) {
//     res.status(403);
//     throw new Error('Not authorized to update this booking');
//   }
  
//   // Only allow price update if status is in-progress
//   if (booking.status !== 'in-progress') {
//     res.status(400);
//     throw new Error('Booking must be in-progress to update price');
//   }
  
//   booking.finalPrice = finalPrice;
  
//   if (notes) {
//     booking.providerNotes = notes;
//   }
  
//   const updatedBooking = await booking.save();
  
//   res.json(updatedBooking);
// });

// // @desc    Cancel booking
// // @route   PUT /api/bookings/:id/cancel
// // @access  Private
// export const cancelBooking = asyncHandler(async (req, res) => {
//   const booking = await Booking.findById(req.params.id);
  
//   if (!booking) {
//     res.status(404);
//     throw new Error('Booking not found');
//   }
  
//   // Check if the booking belongs to the logged-in user
//   if (booking.user.toString() !== req.user._id.toString()) {
//     res.status(403);
//     throw new Error('Not authorized to cancel this booking');
//   }
  
//   // Only allow cancellation if status is pending or confirmed
//   if (booking.status !== 'pending' && booking.status !== 'confirmed') {
//     res.status(400);
//     throw new Error('Cannot cancel booking that is already in progress or completed');
//   }
  
//   booking.status = 'cancelled';
  
//   const updatedBooking = await booking.save();
  
//   res.json(updatedBooking);
// });

// // @desc    Update payment status
// // @route   PUT /api/bookings/:id/payment
// // @access  Private
// export const updatePaymentStatus = asyncHandler(async (req, res) => {
//   const { paymentStatus, paymentMethod, paymentId } = req.body;
  
//   const booking = await Booking.findById(req.params.id);
  
//   if (!booking) {
//     res.status(404);
//     throw new Error('Booking not found');
//   }
  
//   // Check if the booking belongs to the logged-in user
//   if (booking.user.toString() !== req.user._id.toString()) {
//     res.status(403);
//     throw new Error('Not authorized to update payment for this booking');
//   }
  
//   booking.paymentStatus = paymentStatus;
  
//   if (paymentMethod) {
//     booking.paymentMethod = paymentMethod;
//   }
  
//   if (paymentId) {
//     booking.paymentId = paymentId;
//   }
  
//   const updatedBooking = await booking.save();
  
//   res.json(updatedBooking);
// });



import asyncHandler from 'express-async-handler';
import Booking from '../models/bookingModel.js';
import Provider from '../models/providerModel.js';
import Service from '../models/serviceModel.js';
import User from '../models/userModel.js';
import { sendSMS } from '../utils/sms.js';
import { sendPushNotification } from '../config/firebase.js';
// import { io } from '../../server.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncHandler(async (req, res) => {
  const { 
    provider: providerId, 
    service: serviceId, 
    scheduledDate, 
    location, 
    address, 
    notes 
  } = req.body;

  // Validate provider exists and is active
  const provider = await Provider.findById(providerId);
  if (!provider || !provider.isActive) {
    res.status(404);
    throw new Error('Provider not found or inactive');
  }

  // Validate service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  // Check if provider offers this service
  const providerService = provider.services.find(
    s => s.service.toString() === serviceId && s.isActive
  );
  
  if (!providerService) {
    res.status(400);
    throw new Error('Provider does not offer this service');
  }

  // Create booking
  const booking = await Booking.create({
    user: req.user._id,
    provider: providerId,
    service: serviceId,
    initialPrice: providerService.price,
    scheduledDate: new Date(scheduledDate),
    location,
    address,
    notes,
    status: 'pending'
  });

  if (!booking) {
    res.status(500);
    throw new Error('Failed to create booking');
  }

  // Notify the provider via socket.io
  // io.to(providerId).emit('newBooking', {
  //   message: 'New booking received',
  //   booking,
  // });

  // // Notify the user via socket.io
  // io.to(req.user._id).emit('bookingCreated', {
  //   message: 'Booking confirmed',
  //   booking,
  // });

  // Send push notification to provider if available
  if (provider.fcmToken) {
    await sendPushNotification(
      provider.fcmToken,
      'New Booking',
      `You have a new booking for ${service.name}`
    );
  }

  // Send SMS confirmation to user
  await sendSMS(req.user.phone, `Your booking for ${service.name} has been confirmed. Booking ID: ${booking._id}`);

  res.status(201).json({
    message: 'Booking created successfully',
    booking
  });
});

// @desc    Get all bookings for logged in user
// @route   GET /api/bookings
// @access  Private
export const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('provider', 'name phone rating')
    .populate('service', 'name')
    .sort({ scheduledDate: -1 });
    
  res.json(bookings);
});

// @desc    Get all bookings for provider
// @route   GET /api/bookings/provider
// @access  Private/Provider
export const getProviderBookings = asyncHandler(async (req, res) => {
  // Since we're using protectProvider middleware, req.provider is already set
  const bookings = await Booking.find({ provider: req.provider._id })
    .populate('user', 'name phone')
    .populate('service', 'name')
    .sort({ scheduledDate: -1 });
    
  res.json(bookings);
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name phone')
    .populate('provider', 'name phone rating')
    .populate('service', 'name description');
  
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check authorization
  if (req.user) {
    // User access check
    if (booking.user._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this booking');
    }
  } else if (req.provider) {
    // Provider access check
    if (booking.provider._id.toString() !== req.provider._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this booking');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.json(booking);
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Provider
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  
  // Check if the booking belongs to this provider
  if (booking.provider.toString() !== req.provider._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this booking');
  }
  
  // Validate status transition
  const validTransitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['in-progress', 'cancelled'],
    'in-progress': ['completed', 'cancelled'],
    'completed': [],
    'cancelled': []
  };

  if (!validTransitions[booking.status].includes(status)) {
    res.status(400);
    throw new Error(`Invalid status transition from ${booking.status} to ${status}`);
  }
  
  booking.status = status;
  
  // If status is completed, set completedDate
  if (status === 'completed') {
    booking.completedDate = new Date();
  }
  
  const updatedBooking = await booking.save();

  // Notify user about status change
  const user = await User.findById(booking.user);
  if (user) {
    await sendSMS(user.phone, `Your booking status has been updated to: ${status}`);
  }

  res.json(updatedBooking);
});

// @desc    Update booking final price
// @route   PUT /api/bookings/:id/price
// @access  Private/Provider
export const updateBookingPrice = asyncHandler(async (req, res) => {
  const { finalPrice, notes } = req.body;
  
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  
  // Check if the booking belongs to this provider
  if (booking.provider.toString() !== req.provider._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this booking');
  }
  
  // Only allow price update if status is in-progress
  if (booking.status !== 'in-progress') {
    res.status(400);
    throw new Error('Booking must be in-progress to update price');
  }
  
  booking.finalPrice = finalPrice;
  
  if (notes) {
    booking.providerNotes = notes;
  }
  
  const updatedBooking = await booking.save();
  
  res.json(updatedBooking);
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  
  // Check if the booking belongs to the logged-in user
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }
  
  // Only allow cancellation if status is pending or confirmed
  if (booking.status !== 'pending' && booking.status !== 'confirmed') {
    res.status(400);
    throw new Error('Cannot cancel booking that is already in progress or completed');
  }
  
  booking.status = 'cancelled';
  
  const updatedBooking = await booking.save();

  // Notify provider about cancellation
  const provider = await Provider.findById(booking.provider);
  if (provider) {
    await sendSMS(provider.phone, `Booking ${booking._id} has been cancelled by the user`);
  }

  res.json(updatedBooking);
});

// @desc    Update payment status
// @route   PUT /api/bookings/:id/payment
// @access  Private
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, paymentMethod, paymentId } = req.body;
  
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  
  // Check if the booking belongs to the logged-in user
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update payment for this booking');
  }
  
  // Validate payment status transition
  if (booking.paymentStatus === 'paid' && paymentStatus !== 'paid') {
    res.status(400);
    throw new Error('Cannot change payment status from paid');
  }
  
  booking.paymentStatus = paymentStatus;
  
  if (paymentMethod) {
    booking.paymentMethod = paymentMethod;
  }
  
  if (paymentId) {
    booking.paymentId = paymentId;
  }
  
  const updatedBooking = await booking.save();
  
  res.json(updatedBooking);
});