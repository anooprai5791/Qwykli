import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import TempOTP from '../models/tempOTPmodel.js';
import Provider from '../models/providerModel.js';
import { logger } from '../utils/logger.js';
import { sendOTP, verifyOTP } from '../utils/otpService.js';
import { loginSchema, firsttimeSchema, updateProfileSchema, requestOTPSchema, verifyOTPSchema} from '../middleware/authtypes.js';

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  try{
    const parsephone = firsttimeSchema.safeParse(req.body);
    if(!parsephone.success){
      res.status(400).json({
        message: error?.message || 'Something went wrong'
      });
      return;
    }
  const {phone} = parsephone.data;
  // Check if user already exists
  const userExists = await User.findOne({ phone });
  
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const name = req.body.name || `User ${phone.slice(-4)}`;

  // Create user with just phone number
  const user = await User.create({
    phone,
    name,
  });

  res.status(201).json({
    _id: user._id,
    phone: user.phone,
    name: user.name,
    token: generateToken(user),
  });}
  catch(error){
    console.log(error);
    res.status(400).json({
      message: error?.message || 'Something went wrong'
    });
  }
});

// @desc    Auth user & get token (OTP-based)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  try{
    const parselogin = loginSchema.safeParse(req.body);
    if(!parselogin.success){
      res.status(400).json({
        message: error?.message || 'Something went wrong'
      });
      return;
    }
    const { phone, otp } = parselogin.data;
    const user = await User.findOne({ phone });
    
    if (!user) {
      res.status(401);
      throw new Error('Invalid phone number');
    }

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
    token: generateToken(user),
  });
  }
  catch(error){
    console.log(error);
    res.status(400).json({
      message: error?.message || 'Something went wrong'
    });
  }
});

// @desc    Check if user exists by phone number
// @route   POST /api/auth/check-user
// @access  Public
export const checkUserExists = asyncHandler(async (req, res) => {
  try {
    // Extract the phone number directly - simplify validation for this endpoint
    const { phone } = req.body;
    
    // Basic validation - ensure phone exists and has minimum length
    if (!phone || phone.length < 10) {
      return res.status(400).json({
        message: 'Valid phone number is required'
      });
    }
    
    // Format phone for database query - extract only digits
    const phoneDigits = phone.replace(/\D/g, '');
    const lastTenDigits = phoneDigits.substring(Math.max(0, phoneDigits.length - 10));
    
    // Check if user exists in the database
    const existingUser = await User.findOne({ 
      phone: { $regex: new RegExp(lastTenDigits + '$') }
    });
    
    return res.status(200).json({
      exists: !!existingUser,
      message: existingUser 
        ? 'User found with this phone number' 
        : 'No user found with this phone number'
    });
  } catch (error) {
    logger.error('Error checking user existence:', error);
    res.status(500).json({ 
      message: 'Server error while checking user existence'
    });
  }
});

// @desc    Update name for users without one
// @route   PUT /api/auth/update-name
// @access  Private
export const updateUserName = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        message: 'Name is required'
      });
    }
    
    // Get user from middleware
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    // Update name
    user.name = name;
    await user.save();
    
    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      success: true
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: error?.message || 'Something went wrong'
    });
  }
});


// @desc    Request OTP for user registration/login
// @route   POST /api/auth/request-otp
// @access  Public
export const requestUserOTP = asyncHandler(async (req, res) => {
  try {
    const parsedata = requestOTPSchema.safeParse(req.body);
    if (!parsedata.success) {
      return res.status(400).json({
        message: 'Something went wrong'
      });
    }
    
    const { phone, fullPhone } = parsedata.data;
    
    // Check if user exists (only for isNewUser flag)
    const existingUser = await User.findOne({ phone });
    const isNewUser = !existingUser || !existingUser.name || existingUser.name.trim() === '';
    
    // Generate and send OTP
    await sendOTP(phone, fullPhone);
    
    res.json({
      message: 'OTP sent successfully',
      isNewUser
    });
  }
  catch (error) {
    console.log(error);
    res.status(400).json({
      message: error?.message || 'Something went wrong'
    });
  }
});

// @desc    Verify OTP and create/login user
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyUserOTP = asyncHandler(async (req, res) => {
  try {
    const { phone, otp, fullPhone } = req.body;
    
    // Log verification attempt
    logger.info(`OTP verification attempt - Phone: ${phone}, OTP: ${otp}`);
    
    // Use the updated verifyOTP service function
    const verificationResult = await verifyOTP(phone, otp, fullPhone);
    
    if (!verificationResult.verified) {
      logger.warn(`OTP verification failed: ${verificationResult.error}`);
      return res.status(400).json({
        success: false,
        message: verificationResult.error || 'OTP verification failed'
      });
    }
    
    // OTP is verified successfully - now we can create or find the user
    let user = await User.findOne({ phone });
    let isNewUser = false;
    
    if (!user) {
      // Create user only after successful verification
      logger.info(`Creating new user with phone: ${phone}`);
      user = await User.create({
        phone,
        isVerified: true
      });
      isNewUser = true;
    } else {
      // Update existing user's verification status
      logger.info(`Updating existing user: ${user._id}`);
      user.isVerified = true;
      await user.save();
    }
    
    // Delete the temporary OTP record since verification is successful
    await TempOTP.deleteOne({ phone });
    
    // Generate authentication token
    const token = generateToken(user);
    
    res.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        _id: user._id,
        phone: user.phone,
        name: user.name || "",
        email: user.email || "",
        isVerified: user.isVerified
      },
      isNewUser,
      method: verificationResult.method // Include verification method in response
    });
  } catch (error) {
    logger.error(`OTP verification error: ${error.stack}`);
    res.status(400).json({
      success: false,
      message: error?.message || 'OTP verification failed'
    });
  }
});

// @desc    Request OTP for provider registration
// @route   POST /api/providers/request-otp
// @access  Public
export const requestProviderOTP = asyncHandler(async (req, res) => {
  const { phone, fullPhone } = req.body;

  // Check if provider already exists
  const providerExists = await Provider.findOne({ phone });
  if (providerExists) {
    res.status(400);
    throw new Error('Provider already registered');
  }

  // Generate and send OTP using Twilio Verify Service
  const { otp, otpExpires } = await sendOTP(phone, fullPhone);

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
    categories,
    services,
    photo,
    aadhar_card,
    pan_card,
    fullPhone
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

  // Verify OTP using Twilio Verify Service with fallback to database
  const verificationResult = await verifyOTP(provider.phone, otp, fullPhone);
  
  if (!verificationResult.success || !verificationResult.verified) {
    res.status(401);
    throw new Error(verificationResult.error || 'Invalid or expired OTP');
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
      categories,
      services,
      // photo: photoPath,
      // aadhar_card: aadharPath,
      // pan_card: panPath,
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
    isVerified: updatedProvider.isVerified,
    verificationMethod: verificationResult.method
  });
});

// @desc    Request OTP for provider login
// @route   POST /api/providers/login/request-otp
// @access  Public
export const requestProviderLoginOTP = asyncHandler(async (req, res) => {
  const { phone, fullPhone } = req.body;

  const provider = await Provider.findOne({ phone });
  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }

  // Generate and send OTP using Twilio Verify Service
  const { otp, otpExpires } = await sendOTP(phone, fullPhone);

  provider.otp = otp;
  provider.otpExpires = otpExpires;
  await provider.save();

  res.json({ message: 'OTP sent successfully' });
});

// @desc    Verify OTP and login provider
// @route   POST /api/providers/login/verify-otp
// @access  Public
export const loginProvider = asyncHandler(async (req, res) => {
  const { phone, otp, fullPhone } = req.body;

  const provider = await Provider.findOne({ phone });
  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }

  // Verify OTP using Twilio Verify Service with fallback to database
  const verificationResult = await verifyOTP(phone, otp, fullPhone);
  
  if (!verificationResult.success || !verificationResult.verified) {
    res.status(401);
    throw new Error(verificationResult.error || 'Invalid or expired OTP');
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
    isVerified: provider.isVerified,
    verificationMethod: verificationResult.method
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
  const user = req.user; 

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    location: user.location,
    isAdmin: user.isAdmin,
    isProvider: user.isProvider,
  });
});


// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: 'Invalid data format',
      errors: parsed.error.issues,
    });
  }

  const data = parsed.data;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = data.name || user.name;
  user.email = data.email || user.email; 
  user.address = data.address || user.address;

  // Allow password change only if the user is a provider
  if (req.body.password && user.isProvider) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    phone: updatedUser.phone, 
    name: updatedUser.name,
    email: updatedUser.email,
    address: updatedUser.address,
    location: updatedUser.location,
    isAdmin: updatedUser.isAdmin,
    isProvider: updatedUser.isProvider,
    token: generateToken(updatedUser),
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