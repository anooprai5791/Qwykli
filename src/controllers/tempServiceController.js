import asyncHandler from 'express-async-handler';
import Service from '../models/serviceModel.js';
import Category from '../models/categoryModel.js';
import mongoose from 'mongoose';

// Temporary unauthenticated controller functions for services

export const tempCreateService = asyncHandler(async (req, res) => {
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
    res.status(201).json(service);
  } else {
    res.status(400);
    throw new Error('Invalid service data');
  }
});

export const tempGetServices = asyncHandler(async (req, res) => {
  const services = await Service.find({  })
    .populate('category', 'name')
    .sort({ name: 1 });
    
  res.json(services);
});

export const tempGetServicesByCategory = asyncHandler(async (req, res) => {
  const services = await Service.find({ 
    category: req.params.categoryId,
    isActive: true 
  }).sort({ name: 1 });
  
  res.json(services);
});

// Temporary update service
export const tempUpdateService = asyncHandler(async (req, res) => {
      const { name, description, category, subcategory, basePrice } = req.body;
    
      const service = await Service.findById(req.params.id);
    
      if (service) {
        // Verify category if changing
        if (category && category !== service.category.toString()) {
          const categoryExists = await Category.findById(category);
          if (!categoryExists) {
            res.status(404);
            throw new Error('Category not found');
          }
          
          // Verify subcategory exists in new category
          if (subcategory) {
            const subcategoryExists = categoryExists.subcategories.id(subcategory);
            if (!subcategoryExists) {
              res.status(404);
              throw new Error('Subcategory not found in this category');
            }
          }
        }
    
        service.name = name || service.name;
        service.description = description || service.description;
        if (category) service.category = category;
        if (subcategory) service.subcategory = subcategory;
        if (basePrice !== undefined) service.basePrice = basePrice;
    
        const updatedService = await service.save();
        res.json(updatedService);
      } else {
        res.status(404);
        throw new Error('Service not found');
      }
    });
    
    // // Temporary delete service (soft delete)
    // export const tempDeleteService = asyncHandler(async (req, res) => {
    //   const service = await Service.findById(req.params.id);
    
    //   if (service) {
    //     service.isActive = false;
    //     await service.save();
    //     res.json({ message: 'Service removed' });
    //   } else {
    //     res.status(404);
    //     throw new Error('Service not found');
    //   }
    // });


    // @desc    Delete a service permanently
// @route   DELETE /api/services/temp/:id
// @access  Public (temporary)
export const tempDeleteService = asyncHandler(async (req, res) => {
  // Validate the ID format first
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid service ID format');
  }

  // Perform the hard delete
  const deletedService = await Service.findByIdAndDelete(req.params.id);

  if (!deletedService) {
    res.status(404);
    throw new Error('Service not found');
  }

  res.json({ 
    success: true,
    message: 'Service deleted permanently',
    data: {
      id: deletedService._id,
      name: deletedService.name
    }
  });
});

    export const tempGetServiceById = asyncHandler(async (req, res) => {
      console.log("Searching for id:",req.params.id);
      console.log("**");
      const service = await Service.findById(req.params.id)
        .populate('category', 'name');
    
      if (service) {
        res.json(service);
      } else {
        res.status(404);
        throw new Error('Service not found');
      }
    });