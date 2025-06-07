import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Provider from '../models/providerModel.js';

// ========================
// USER AUTHENTICATION
// ========================

export const protectUser = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded.id,
      phone: decoded.phone,
      isVerified: true,
    });

    if (!user) {
      res.status(401);
      throw new Error('User not found or not verified');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired, please login again');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token, please login again');
    }
    throw new Error('Not authorized, token failed');
  }
});

// ========================
// PROVIDER AUTHENTICATION 
// ========================

export const protectProvider = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer')) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const provider = await Provider.findOne({
      _id: decoded.id,
      phone: decoded.phone,
      verification_token: token,
      isVerified: true,
    });

    if (!provider) {
      res.status(401);
      throw new Error('Provider not found or not verified');
    }

    req.provider = provider;
    next();
  } catch (error) {
    res.status(401);
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired, please login again');
    }
    throw new Error('Not authorized, invalid token');
  }
});

// ========================
// ROLE-BASED MIDDLEWARE
// ========================

export const admin = asyncHandler(async (req, res, next) => {
  if (req.user?.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as admin');
  }
});

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

export const protectAny = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer')) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [user, provider] = await Promise.all([
      User.findOne({
        _id: decoded.id,
        phone: decoded.phone,
        isVerified: true,
      }),
      Provider.findOne({
        _id: decoded.id,
        phone: decoded.phone,
        verification_token: token,
        isVerified: true,
      }),
    ]);

    if (user) {
      req.user = user;
      return next();
    }

    if (provider) {
      req.provider = provider;
      return next();
    }

    res.status(401);
    throw new Error('Not authorized as user or provider');
  } catch (error) {
    res.status(401);
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired, please login again');
    }
    throw new Error('Not authorized, invalid token');
  }
});
