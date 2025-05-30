import Area from '../models/areaModel.js';
import asyncHandler from 'express-async-handler';

export const getNearbyAreas = asyncHandler(async (req, res) => {
  const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance in meters
  
  if (!longitude || !latitude) {
    res.status(400);
    throw new Error('Longitude and latitude are required');
  }
  
  try {
    const areas = await Area.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(maxDistance)
        }
      },
      isActive: true
    });
    
    res.json(areas);
  } catch (error) {
    res.status(500);
    throw new Error(`Error finding nearby areas: ${error.message}`);
  }
});
