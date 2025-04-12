// import asyncHandler from 'express-async-handler';
// import User from '../models/userModel.js';
// import Provider from '../models/providerModel.js';
// import Booking from '../models/bookingModel.js';
// import Review from '../models/reviewModel.js';
// import { logger } from '../utils/logger.js';
// import jwt from 'jsonwebtoken';

// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: '30d',
//   });
// };

// // @desc    Get all users
// // @route   GET /api/admin/users
// // @access  Private/Admin
// export const getAllUsers = asyncHandler(async (req, res) => {
//   const users = await User.find({}).select('-password');
//   res.json(users);
// });

// // @desc    Get user by ID
// // @route   GET /api/admin/users/:id
// // @access  Private/Admin
// export const getUserById = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.params.id).select('-password');
//   if (user) {
//     res.json(user);
//   } else {
//     res.status(404);
//     throw new Error('User not found');
//   }
// });

// // @desc    Update user
// // @route   PUT /api/admin/users/:id
// // @access  Private/Admin
// export const updateUser = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.params.id);

//   if (user) {
//     user.name = req.body.name || user.name;
//     user.email = req.body.email || user.email;
//     user.isAdmin = req.body.isAdmin || user.isAdmin;

//     const updatedUser = await user.save();
//     res.json({
//       _id: updatedUser._id,
//       name: updatedUser.name,
//       email: updatedUser.email,
//       isAdmin: updatedUser.isAdmin,
//     });
//   } else {
//     res.status(404);
//     throw new Error('User not found');
//   }
// });

// // @desc    Delete user
// // @route   DELETE /api/admin/users/:id
// // @access  Private/Admin
// export const deleteUser = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.params.id);

//   if (user) {
//     await user.remove();
//     res.json({ message: 'User removed' });
//   } else {
//     res.status(404);
//     throw new Error('User not found');
//   }
// });

// // @desc    Get all providers
// // @route   GET /api/admin/providers
// // @access  Private/Admin
// export const getAllProviders = asyncHandler(async (req, res) => {
//   const providers = await Provider.find({});
//   res.json(providers);
// });

// // @desc    Get provider by ID
// // @route   GET /api/admin/providers/:id
// // @access  Private/Admin
// export const getProviderById = asyncHandler(async (req, res) => {
//   const provider = await Provider.findById(req.params.id);
//   if (provider) {
//     res.json(provider);
//   } else {
//     res.status(404);
//     throw new Error('Provider not found');
//   }
// });

// // @desc    Update provider
// // @route   PUT /api/admin/providers/:id
// // @access  Private/Admin
// export const updateProvider = asyncHandler(async (req, res) => {
//   const provider = await Provider.findById(req.params.id);

//   if (provider) {
//     provider.name = req.body.name || provider.name;
//     provider.email = req.body.email || provider.email;
//     provider.isVerified = req.body.isVerified || provider.isVerified;

//     const updatedProvider = await provider.save();
//     res.json(updatedProvider);
//   } else {
//     res.status(404);
//     throw new Error('Provider not found');
//   }
// });

// // @desc    Delete provider
// // @route   DELETE /api/admin/providers/:id
// // @access  Private/Admin
// export const deleteProvider = asyncHandler(async (req, res) => {
//   const provider = await Provider.findById(req.params.id);

//   if (provider) {
//     await provider.remove();
//     res.json({ message: 'Provider removed' });
//   } else {
//     res.status(404);
//     throw new Error('Provider not found');
//   }
// });

// // @desc    Get all bookings
// // @route   GET /api/admin/bookings
// // @access  Private/Admin
// export const getAllBookings = asyncHandler(async (req, res) => {
//   const bookings = await Booking.find({}).populate('user provider service');
//   res.json(bookings);
// });

// // @desc    Get booking by ID
// // @route   GET /api/admin/bookings/:id
// // @access  Private/Admin
// export const getBookingById = asyncHandler(async (req, res) => {
//   const booking = await Booking.findById(req.params.id).populate('user provider service');
//   if (booking) {
//     res.json(booking);
//   } else {
//     res.status(404);
//     throw new Error('Booking not found');
//   }
// });

// // @desc    Update booking
// // @route   PUT /api/admin/bookings/:id
// // @access  Private/Admin
// export const updateBooking = asyncHandler(async (req, res) => {
//   const booking = await Booking.findById(req.params.id);

//   if (booking) {
//     booking.status = req.body.status || booking.status;
//     booking.paymentStatus = req.body.paymentStatus || booking.paymentStatus;

//     const updatedBooking = await booking.save();
//     res.json(updatedBooking);
//   } else {
//     res.status(404);
//     throw new Error('Booking not found');
//   }
// });

// // @desc    Delete booking
// // @route   DELETE /api/admin/bookings/:id
// // @access  Private/Admin
// export const deleteBooking = asyncHandler(async (req, res) => {
//   const booking = await Booking.findById(req.params.id);

//   if (booking) {
//     await booking.remove();
//     res.json({ message: 'Booking removed' });
//   } else {
//     res.status(404);
//     throw new Error('Booking not found');
//   }
// });

// // @desc    Get all reviews
// // @route   GET /api/admin/reviews
// // @access  Private/Admin
// export const getAllReviews = asyncHandler(async (req, res) => {
//   const reviews = await Review.find({}).populate('user provider booking');
//   res.json(reviews);
// });

// // @desc    Get review by ID
// // @route   GET /api/admin/reviews/:id
// // @access  Private/Admin
// export const getReviewById = asyncHandler(async (req, res) => {
//   const review = await Review.findById(req.params.id).populate('user provider booking');
//   if (review) {
//     res.json(review);
//   } else {
//     res.status(404);
//     throw new Error('Review not found');
//   }
// });

// // @desc    Update review
// // @route   PUT /api/admin/reviews/:id
// // @access  Private/Admin
// export const updateReview = asyncHandler(async (req, res) => {
//   const review = await Review.findById(req.params.id);

//   if (review) {
//     review.rating = req.body.rating || review.rating;
//     review.comment = req.body.comment || review.comment;
//     review.isVisible = req.body.isVisible || review.isVisible;

//     const updatedReview = await review.save();
//     res.json(updatedReview);
//   } else {
//     res.status(404);
//     throw new Error('Review not found');
//   }
// });

// // @desc    Delete review
// // @route   DELETE /api/admin/reviews/:id
// // @access  Private/Admin
// export const deleteReview = asyncHandler(async (req, res) => {
//   const review = await Review.findById(req.params.id);

//   if (review) {
//     await review.remove();
//     res.json({ message: 'Review removed' });
//   } else {
//     res.status(404);
//     throw new Error('Review not found');
//   }
// });

// // @desc    Get system analytics
// // @route   GET /api/admin/analytics
// // @access  Private/Admin
// export const getSystemAnalytics = asyncHandler(async (req, res) => {
//   const totalUsers = await User.countDocuments();
//   const totalProviders = await Provider.countDocuments();
//   const totalBookings = await Booking.countDocuments();
//   const totalRevenue = await Booking.aggregate([
//     { $group: { _id: null, total: { $sum: '$finalPrice' } } },
//   ]);

//   res.json({
//     totalUsers,
//     totalProviders,
//     totalBookings,
//     totalRevenue: totalRevenue[0]?.total || 0,
//   });
// });


// //  /api/admin/add

// export const AddUser=asyncHandler(async(req,res)=>{
//          const { name, email, password, phone, location, address } = req.body;
        
//           // Check if user already exists
//           const userExists = await User.findOne({ phone });
          
//           if (userExists) {
//             res.status(400);
//             throw new Error('User already exists bhai');
//           }
        
//           // Create user
//           const user = await User.create({
//             name,
//             email,
//             password,
//             phone,
//             location,
//             address,
//           });
        
//           if (user) {
//             res.status(201).json({
//               _id: user._id,
//               name: user.name,
//               email: user.email,
//               isAdmin: user.isAdmin,
//               isProvider: user.isProvider,
//               token: generateToken(user._id),
//             });   
//           } else {
//             res.status(400);
//             throw new Error('Invalid user data');
//           }
// });



import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Provider from '../models/providerModel.js';
import Booking from '../models/bookingModel.js';
import Review from '../models/reviewModel.js';
// import { generateToken } from '../utils/generateToken.js';
import { logger } from '../utils/logger.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Create an admin user
// @route   POST /api/admin/users/create-admin
// @access  Private/Admin
export const createAdminUser = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ phone });
  
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create admin user
  const user = await User.create({
    phone,
    isAdmin: true,
    isVerified: true
  });

  res.status(201).json({
    _id: user._id,
    phone: user.phone,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
  });
});

// @desc    Update admin status of a user
// @route   PUT /api/admin/users/:id/admin-status
// @access  Private/Admin
export const updateAdminStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isAdmin = req.body.isAdmin;
  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    phone: updatedUser.phone,
    isAdmin: updatedUser.isAdmin,
    isVerified: updatedUser.isVerified
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-otp -otpExpires');
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-otp -otpExpires');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;
  user.address = req.body.address || user.address;
  user.location = req.body.location || user.location;
  user.isVerified = req.body.isVerified !== undefined ? req.body.isVerified : user.isVerified;

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    isVerified: updatedUser.isVerified,
    isAdmin: updatedUser.isAdmin
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if the user is an admin
  if (user.isAdmin) {
    res.status(400);
    throw new Error('Cannot delete admin user');
  }

  await user.remove();
  res.json({ message: 'User removed successfully' });
});

// @desc    Get all providers
// @route   GET /api/admin/providers
// @access  Private/Admin
export const getAllProviders = asyncHandler(async (req, res) => {
  const providers = await Provider.find({})
    .populate('categories', 'name')
    .populate('services.service', 'name');
  res.json(providers);
});

// @desc    Get provider by ID
// @route   GET /api/admin/providers/:id
// @access  Private/Admin
export const getProviderById = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id)
    .populate('categories', 'name')
    .populate('services.service', 'name');

  if (provider) {
    res.json(provider);
  } else {
    res.status(404);
    throw new Error('Provider not found');
  }
});

// @desc    Update provider
// @route   PUT /api/admin/providers/:id
// @access  Private/Admin
export const updateProvider = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);

  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }

  provider.name = req.body.name || provider.name;
  provider.phone = req.body.phone || provider.phone;
  provider.current_location = req.body.current_location || provider.current_location;
  provider.area_coverage = req.body.area_coverage || provider.area_coverage;
  provider.isVerified = req.body.isVerified !== undefined ? req.body.isVerified : provider.isVerified;
  provider.isActive = req.body.isActive !== undefined ? req.body.isActive : provider.isActive;

  if (req.body.categories) {
    provider.categories = req.body.categories;
  }

  const updatedProvider = await provider.save();

  res.json({
    _id: updatedProvider._id,
    name: updatedProvider.name,
    phone: updatedProvider.phone,
    isVerified: updatedProvider.isVerified,
    isActive: updatedProvider.isActive,
    rating: updatedProvider.rating
  });
});



// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .populate('user', 'name phone')
    .populate('provider', 'name phone')
    .populate('service', 'name');
  res.json(bookings);
});

// @desc    Get booking by ID
// @route   GET /api/admin/bookings/:id
// @access  Private/Admin
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name phone')
    .populate('provider', 'name phone')
    .populate('service', 'name');

  if (booking) {
    res.json(booking);
  } else {
    res.status(404);
    throw new Error('Booking not found');
  }
});

// @desc    Update booking
// @route   PUT /api/admin/bookings/:id
// @access  Private/Admin
export const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  booking.status = req.body.status || booking.status;
  booking.paymentStatus = req.body.paymentStatus || booking.paymentStatus;
  booking.finalPrice = req.body.finalPrice || booking.finalPrice;

  if (req.body.scheduledDate) {
    booking.scheduledDate = req.body.scheduledDate;
  }

  const updatedBooking = await booking.save();

  res.json(updatedBooking);
});

// @desc    Delete booking
// @route   DELETE /api/admin/bookings/:id
// @access  Private/Admin
export const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  await booking.remove();
  res.json({ message: 'Booking removed successfully' });
});

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({})
    .populate('user', 'name phone')
    .populate('provider', 'name phone')
    .populate('booking', 'scheduledDate');
  res.json(reviews);
});

// @desc    Get review by ID
// @route   GET /api/admin/reviews/:id
// @access  Private/Admin
export const getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate('user', 'name phone')
    .populate('provider', 'name phone')
    .populate('booking', 'scheduledDate');

  if (review) {
    res.json(review);
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

// @desc    Update review
// @route   PUT /api/admin/reviews/:id
// @access  Private/Admin
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.rating = req.body.rating || review.rating;
  review.comment = req.body.comment || review.comment;
  review.isVisible = req.body.isVisible !== undefined ? req.body.isVisible : review.isVisible;

  const updatedReview = await review.save();

  res.json(updatedReview);
});

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  await review.remove();
  res.json({ message: 'Review removed successfully' });
});

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getSystemAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalProviders, totalBookings, revenueResult] = await Promise.all([
    User.countDocuments(),
    Provider.countDocuments(),
    Booking.countDocuments(),
    Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$finalPrice' } } }
    ])
  ]);

  const activeProviders = await Provider.countDocuments({ isActive: true });
  const verifiedProviders = await Provider.countDocuments({ isVerified: true });
  const completedBookings = await Booking.countDocuments({ status: 'completed' });

  res.json({
    totalUsers,
    totalProviders,
    activeProviders,
    verifiedProviders,
    totalBookings,
    completedBookings,
    totalRevenue: revenueResult[0]?.total || 0,
  });
});

// @desc    Add a new user (admin can add users manually)
// @route   POST /api/admin/users/add
// @access  Private/Admin
export const AddUser = asyncHandler(async (req, res) => {
  const { name, email, phone, address, location } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ phone });
  
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    address,
    location,
    isVerified: true
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isVerified: user.isVerified
  });
});

// Add to adminController.js

// @desc    Add a new provider (admin only)
// @route   POST /api/admin/providers
// @access  Private/Admin
export const addProvider = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    current_location,
    area_coverage,
    categories,
    services,
    photo,
    aadhar_card,
    pan_card
  } = req.body;

  // Check if provider with same phone already exists
  const providerExists = await Provider.findOne({ phone });
  if (providerExists) {
    res.status(400);
    throw new Error('Provider with this phone number already exists');
  }

  // Validate categories exist
  const categoriesExist = await Category.countDocuments({ 
    _id: { $in: categories } 
  });
  if (categoriesExist !== categories.length) {
    res.status(400);
    throw new Error('One or more categories are invalid');
  }

  // Validate services exist
  const serviceIds = services.map(s => s.service);
  const servicesExist = await Service.countDocuments({ 
    _id: { $in: serviceIds } 
  });
  if (servicesExist !== serviceIds.length) {
    res.status(400);
    throw new Error('One or more services are invalid');
  }

  // Create provider
  const provider = await Provider.create({
    name,
    phone,
    current_location,
    area_coverage,
    categories,
    services: services.map(s => ({
      service: s.service,
      price: s.price,
      isActive: true
    })),
    photo,
    aadhar_card,
    pan_card,
    isVerified: true, // Admin-added providers are automatically verified
    isActive: true
  });

  res.status(201).json({
    _id: provider._id,
    name: provider.name,
    phone: provider.phone,
    isVerified: provider.isVerified,
    isActive: provider.isActive
  });
});

// @desc    Delete a provider (admin only)
// @route   DELETE /api/admin/providers/:id
// @access  Private/Admin
export const deleteProvider = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);

  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }

  // Check if provider has any active bookings
  const activeBookings = await Booking.countDocuments({
    provider: provider._id,
    status: { $in: ['pending', 'confirmed', 'in-progress'] }
  });

  if (activeBookings > 0) {
    res.status(400);
    throw new Error('Cannot delete provider with active bookings');
  }

  await provider.remove();

  res.json({ message: 'Provider removed successfully' });
});