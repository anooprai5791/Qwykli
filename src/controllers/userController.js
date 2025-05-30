import User from "../models/userModel.js";
import asyncHandler from 'express-async-handler';

export const updateLanguagePreference = asyncHandler(async (req, res) => {
      const { language } = req.body;
    
      // Validate the language
      if (!['en', 'hi', 'es'].includes(language)) {
        res.status(400);
        throw new Error('Invalid language');
      }
    
      // Update the user's language preference
      const user = await User.findById(req.user._id);
      user.language = language;
      await user.save();
    
      res.json({ message: 'Language preference updated', user });
    
});

export const updateUserLocation = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check if we're receiving separate latitude/longitude or GeoJSON format
    let longitude, latitude, address;
    
    if (req.body.location && req.body.location.coordinates) {
      // Client is sending GeoJSON format
      [longitude, latitude] = req.body.location.coordinates;
      address = req.body.address;
    } else {
      // Client is sending separate lat/lng format
      ({ latitude, longitude, address } = req.body);
    }
    
    if (!latitude || !longitude) {
      console.log("Invalid location data:", req.body);
      res.status(400);
      throw new Error('Latitude and longitude are required');
    }

    // Update user location - MongoDB uses [longitude, latitude] order for GeoJSON
    user.location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
    
    // Update address if provided
    if (address) {
      user.address = address;
    }
    
    const updatedUser = await user.save();
    
    console.log(`Location updated for user ${req.user._id}: [${longitude}, ${latitude}]`);
    
    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        _id: updatedUser._id,
        location: updatedUser.location,
        address: updatedUser.address,
      }
    });
  } catch (error) {
    console.error('Error updating user location:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error updating location'
    });
  }
});

// New function to get user profile with location
// export const getUserProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);
  
//   if (!user) {
//     res.status(404);
//     throw new Error('User not found');
//   }
  
//   res.json({
//     _id: user._id,
//     phone: user.phone,
//     name: user.name,
//     email: user.email,
//     address: user.address,
//     location: user.location,
//     isAdmin: user.isAdmin
//   });
// });