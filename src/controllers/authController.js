import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Provider from '../models/providerModel.js';
import { logger } from '../utils/logger.js';
import { sendOTP } from '../utils/otpService.js';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '365d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ phone });
  
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user with just phone number
  const user = await User.create({
    phone,
  });

  res.status(201).json({
    _id: user._id,
    phone: user.phone,
    token: generateToken(user._id),
  });
});

// @desc    Auth user & get token (OTP-based)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;

  const user = await User.findOne({ phone });

  if (!user) {
    res.status(401);
    throw new Error('Invalid phone number');
  }

  // Verify OTP (implementation depends on your OTP service)
  if (user.otp !== otp || new Date() > user.otpExpires) {
    res.status(401);
    throw new Error('Invalid or expired OTP');
  }

  // Clear OTP after successful verification
  user.otp = undefined;
  user.otpExpires = undefined;
  user.isVerified = true;
  user.lastLogin = Date.now();
  await user.save();

  res.json({
    _id: user._id,
    phone: user.phone,
    token: generateToken(user._id),
  });
});


// @desc    Request OTP for provider registration
// @route   POST /api/providers/request-otp
// @access  Public
export const requestProviderOTP = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  // Check if provider already exists
  const providerExists = await Provider.findOne({ phone });
  if (providerExists) {
    res.status(400);
    throw new Error('Provider already registered');
  }

  // Generate and send OTP
  const { otp, otpExpires } = await sendOTP(phone);

  // Create temporary provider record
  const provider = await Provider.create({
    phone,
    otp,
    otpExpires
  });

  res.json({
    tempProviderId: provider._id,
    message: 'OTP sent successfully'
  });
});

// @desc    Verify OTP and complete provider registration
// @route   POST /api/providers/register
// @access  Public
export const registerProvider = asyncHandler(async (req, res) => {
  const {
    tempProviderId,
    otp,
    name,
    current_location,
    area_coverage,
    categories,
    services,
    photo,
    aadhar_card,
    pan_card
  } = req.body;

   // Handle file uploads (using multer)
   const aadharPath = req.files?.aadhar_card?.[0]?.path;
   const panPath = req.files?.pan_card?.[0]?.path;
   const photoPath = req.files['photo'][0].path;

  const provider = await Provider.findById(tempProviderId);
  if (!provider) {
    res.status(404);
    throw new Error('Registration session expired');
  }

  // Verify OTP
  if (provider.otp !== otp || new Date() > provider.otpExpires) {
    res.status(401);
    throw new Error('Invalid or expired OTP');
  }

  // Generate verification token
  const verification_token = generateProviderToken(provider.phone);

  // Complete registration
  const updatedProvider = await Provider.findByIdAndUpdate(
    tempProviderId,
    {
      name,
      current_location: {
        type: 'Point',
        coordinates: current_location
      },
      area_coverage,
      categories,
      services,
      photo:photoPath,
      aadhar_card:aadharPath,
      pan_card:panPath,
      isVerified: true,
      verification_token,
      otp: undefined,
      otpExpires: undefined
    },
    { new: true }
  );

  res.status(201).json({
    _id: updatedProvider._id,
    phone: updatedProvider.phone,
    name: updatedProvider.name,
    verification_token,
    isVerified: updatedProvider.isVerified
  });
});

// @desc    Request OTP for provider login
// @route   POST /api/providers/login/request-otp
// @access  Public
export const requestProviderLoginOTP = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  const provider = await Provider.findOne({ phone });
  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }

  // Generate and send OTP
  const { otp, otpExpires } = await sendOTP(phone);

  provider.otp = otp;
  provider.otpExpires = otpExpires;
  await provider.save();

  res.json({ message: 'OTP sent successfully' });
});

// @desc    Verify OTP and login provider
// @route   POST /api/providers/login/verify-otp
// @access  Public
export const loginProvider = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;

  const provider = await Provider.findOne({ phone });
  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }

  // Verify OTP
  if (provider.otp !== otp || new Date() > provider.otpExpires) {
    res.status(401);
    throw new Error('Invalid or expired OTP');
  }

  // Generate new token
  const verification_token = generateProviderToken(provider.phone);

  // Update provider with new token
  provider.verification_token = verification_token;
  provider.otp = undefined;
  provider.otpExpires = undefined;
  await provider.save();

  res.json({
    _id: provider._id,
    phone: provider.phone,
    name: provider.name,
    verification_token,
    isVerified: provider.isVerified
  });
});

// @desc    Get provider profile
// @route   GET /api/providers/profile
// @access  Private (Provider)
export const getProviderProfile = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.provider._id)
    .select('-otp -otpExpires -verification_token');

  res.json(provider);
});

// @desc    Update provider profile
// @route   PUT /api/providers/profile
// @access  Private (Provider)
export const updateProviderProfile = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.provider._id);

  if (provider) {
    provider.name = req.body.name || provider.name;
    provider.photo = req.body.photo || provider.photo;
    
    if (req.body.current_location) {
      provider.current_location = {
        type: 'Point',
        coordinates: req.body.current_location
      };
    }
    
    if (req.body.area_coverage) {
      provider.area_coverage = req.body.area_coverage;
    }

    const updatedProvider = await provider.save();
    
    res.json({
      _id: updatedProvider._id,
      name: updatedProvider.name,
      phone: updatedProvider.phone,
      current_location: updatedProvider.current_location,
      area_coverage: updatedProvider.area_coverage,
      photo: updatedProvider.photo
    });
  } else {
    res.status(404);
    throw new Error('Provider not found');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      location: user.location,
      isAdmin:user.isAdmin,
      isProvider:user.isProvider
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Only allow updating phone number for regular users
  if (req.body.phone) {
    const phoneExists = await User.findOne({ phone: req.body.phone });
    if (phoneExists && phoneExists._id.toString() !== user._id.toString()) {
      res.status(400);
      throw new Error('Phone number already in use');
    }
    user.phone = req.body.phone;
  }

  // Providers can update their password
  if (req.body.password && user.isProvider) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    phone: updatedUser.phone,
    isAdmin: updatedUser.isAdmin,
    isProvider: updatedUser.isProvider,
    token: generateToken(updatedUser._id),
  });
});


// @desc    Refresh provider token
// @route   POST /api/providers/refresh-token
// @access  Private (requires current valid token)
export const refreshProviderToken = asyncHandler(async (req, res) => {
  const { phone } = req.provider; // Assuming you attach provider to req during auth
  
  const provider = await Provider.findOne({ phone });
  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }

  // Generate new token
  const verification_token = generateProviderToken(provider.phone);

  // Update provider with new token
  provider.verification_token = verification_token;
  await provider.save();

  res.json({
    _id: provider._id,
    phone: provider.phone,
    name: provider.name,
    verification_token,
    isVerified: provider.isVerified
  });
});
















