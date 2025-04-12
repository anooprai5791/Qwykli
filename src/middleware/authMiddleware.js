import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Provider from '../models/providerModel.js';

// ========================
// USER AUTHENTICATION
// ========================

// Protect user routes - verify token and set req.user
export const protectUser = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findOne({
        _id: decoded.id,
        phone: decoded.phone, // Additional verification
        isVerified: true
      });

      if (!req.user) {
        res.status(401);
        throw new Error('User not found or not verified');
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// ========================
// PROVIDER AUTHENTICATION 
// ========================

// Protect provider routes - verify token and set req.provider
export const protectProvider = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get provider with matching phone and token
      req.provider = await Provider.findOne({
        _id: decoded.id,
        phone: decoded.phone,
        verification_token: token,
        isVerified: true
      });

      if (!req.provider) {
        res.status(401);
        throw new Error('Provider not found or not verified');
      }

      next();
    } catch (error) {
      res.status(401);
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired, please login again');
      } else {
        throw new Error('Not authorized, invalid token');
      }
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// ========================
// ROLE-BASED MIDDLEWARE
// ========================

// Admin middleware (for users)
export const admin = asyncHandler(async (req, res, next) => {
  if (req.user?.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as admin');
  }
});

// Active provider middleware
export const activeProvider = asyncHandler(async (req, res, next) => {
  if (req.provider?.isActive) {
    next();
  } else {
    res.status(403);
    throw new Error('Provider account is not active');
  }
});

// ========================
// COMBINED MIDDLEWARE
// ========================

// For routes that can accept either user or provider
export const protectAny = asyncHandler(async (req, res, next) => {
  try {
    await protectUser(req, res, () => {});
    return next();
  } catch (userErr) {
    try {
      await protectProvider(req, res, next);
    } catch (providerErr) {
      res.status(401);
      throw new Error('Not authorized as user or provider');
    }
  }
});