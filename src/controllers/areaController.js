import Area from '../models/areaModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new area
// @route   POST /api/areas
// @access  Admin
const createArea = asyncHandler(async (req, res) => {
  const { name, city, pincode, coordinates } = req.body;

  const areaExists = await Area.findOne({ name, city });
  if (areaExists) {
    res.status(400);
    throw new Error('Area already exists');
  }

  const area = await Area.create({
    name,
    city: city || 'Delhi',
    pincode,
    location: {
      type: 'Point',
      coordinates // [longitude, latitude]
    }
  });

  if (area) {
    res.status(201).json(area);
  } else {
    res.status(400);
    throw new Error('Invalid area data');
  }
});

  // @desc    Get all areas
  // @route   GET /api/areas
  // @access  Public
  const getAreas = asyncHandler(async (req, res) => {
    const areas = await Area.find({ isActive: true });
    res.json(areas);
  });

// @desc    Get area by ID
// @route   GET /api/areas/:id
// @access  Public
const getAreaById = asyncHandler(async (req, res) => {
  const area = await Area.findById(req.params.id);
  
  if (area) {
    res.json(area);
  } else {
    res.status(404);
    throw new Error('Area not found');
  }
});

// @desc    Update area
// @route   PUT /api/areas/:id
// @access  Admin
const updateArea = asyncHandler(async (req, res) => {
  const area = await Area.findById(req.params.id);
  
  if (area) {
    area.name = req.body.name || area.name;
    area.city = req.body.city || area.city;
    area.pincode = req.body.pincode || area.pincode;
    
    if (req.body.coordinates) {
      area.location.coordinates = req.body.coordinates;
    }
    
    area.isActive = req.body.isActive !== undefined ? req.body.isActive : area.isActive;
    
    const updatedArea = await area.save();
    res.json(updatedArea);
  } else {
    res.status(404);
    throw new Error('Area not found');
  }
});

// @desc    Delete area (set isActive to false)
// @route   DELETE /api/areas/:id
// @access  Admin
const deleteArea = asyncHandler(async (req, res) => {
  const area = await Area.findById(req.params.id);
  
  if (area) {
    area.isActive = false;
    await area.save();
    res.json({ message: 'Area deactivated' });
  } else {
    res.status(404);
    throw new Error('Area not found');
  }
});

// @desc    Create multiple areas at once
// @route   POST /api/areas/bulk
// @access  Admin
const createBulkAreas = asyncHandler(async (req, res) => {
  const areasToCreate = req.body.areas;
  
  if (!areasToCreate || !Array.isArray(areasToCreate) || areasToCreate.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of areas');
  }

  // Format data for bulk insertion
  const formattedAreas = areasToCreate.map(area => ({
    name: area.name,
    city: area.city || 'Delhi',
    pincode: area.pincode,
    location: {
      type: 'Point',
      coordinates: area.coordinates
    },
    isActive: area.isActive !== undefined ? area.isActive : true
  }));

  try {
    const createdAreas = await Area.insertMany(formattedAreas);
    res.status(201).json(createdAreas);
  } catch (error) {
    res.status(400);
    throw new Error(`Failed to create areas: ${error.message}`);
  }
});

export { 
  createArea, 
  getAreas, 
  getAreaById, 
  updateArea, 
  deleteArea,
  createBulkAreas
};