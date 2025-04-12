import asyncHandler from 'express-async-handler';
import Service from '../models/serviceModel.js';
import Category from '../models/categoryModel.js';
import { clearCache } from '../config/redis.js';

// @desc    Create a new service
// @route   POST /api/services
// @access  Private/Admin
export const createService = asyncHandler(async (req, res) => {
  const { name, description, category, subcategory, basePrice } = req.body;

  // Verify category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(404);
    throw new Error('Category not found');
  }
     
  // Verify subcategory exists in the category
  const subcategoryExists = categoryExists.subcategories.id(subcategory);
  if (!subcategoryExists) {
    res.status(404);
    throw new Error('Subcategory not found in this category');
  }

  const service = await Service.create({
    name,
    description,
    category,
    subcategory,
    basePrice
  });

  if (service) {
    // Clear cache
    await clearCache('__express__/api/services*');
    await clearCache(`__express__/api/categories/${category}*`);
    
    res.status(201).json(service);
  } else {
    res.status(400);
    throw new Error('Invalid service data');
  }
});

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getServices = asyncHandler(async (req, res) => {
  const { category, subcategory, search } = req.query;
  
  let query = { isActive: true };
  
  if (category) {
    query.category = category;
  }
  
  if (subcategory) {
    query.subcategory = subcategory;
  }
  
  if (search) {
    query.$text = { $search: search };
  }
  
  const services = await Service.find(query)
    .populate('category', 'name')
    .sort({ name: 1 });
    
  res.json(services);
});

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
    .populate('category', 'name');
  
  if (service) {
    res.json(service);
  } else {
    res.status(404);
    throw new Error('Service not found');
  }
});

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin
export const updateService = asyncHandler(async (req, res) => {
  const { 
    name, 
    description, 
    category, 
    subcategory, 
    basePrice, 
    isActive 
  } = req.body;

  const service = await Service.findById(req.params.id);

  if (service) {
    // If category or subcategory is changing, verify they exist
    if (category && category !== service.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        res.status(404);
        throw new Error('Category not found');
      }
      
      // If subcategory is provided, verify it exists in the new category
      if (subcategory) {
        const subcategoryExists = categoryExists.subcategories.id(subcategory);
        if (!subcategoryExists) {
          res.status(404);
          throw new Error('Subcategory not found in this category');
        }
      }
    } else if (subcategory && subcategory !== service.subcategory.toString()) {
      // If only subcategory is changing, verify it exists in the current category
      const categoryExists = await Category.findById(service.category);
      const subcategoryExists = categoryExists.subcategories.id(subcategory);
      if (!subcategoryExists) {
        res.status(404);
        throw new Error('Subcategory not found in this category');
      }
    }

    service.name = name || service.name;
    service.description = description || service.description;
    
    if (category) {
      service.category = category;
    }
    
    if (subcategory) {
      service.subcategory = subcategory;
    }
    
    if (basePrice !== undefined) {
      service.basePrice = basePrice;
    }
    
    
    if (isActive !== undefined) {
      service.isActive = isActive;
    }

    const updatedService = await service.save();
    
    // Clear cache
    await clearCache('__express__/api/services*');
    await clearCache(`__express__/api/categories/${service.category}*`);
    
    res.json(updatedService);
  } else {
    res.status(404);
    throw new Error('Service not found');
  }
});

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (service) {
    // Instead of deleting, mark as inactive
    service.isActive = false;
    await service.save();
    
    // Clear cache
    await clearCache('__express__/api/services*');
    await clearCache(`__express__/api/categories/${service.category}*`);
    
    res.json({ message: 'Service removed' });
  } else {
    res.status(404);
    throw new Error('Service not found');
  }
});

// @desc    Get services by category
// @route   GET /api/services/category/:categoryId
// @access  Public
export const getServicesByCategory = asyncHandler(async (req, res) => {
  const services = await Service.find({ 
    category: req.params.categoryId,
    isActive: true 
  }).sort({ name: 1 });
  
  res.json(services);
});

// @desc    Get services by subcategory
// @route   GET /api/services/subcategory/:subcategoryId
// @access  Public
export const getServicesBySubcategory = asyncHandler(async (req, res) => {
  const services = await Service.find({ 
    subcategory: req.params.subcategoryId,
    isActive: true 
  }).sort({ name: 1 });
  
  res.json(services);
});