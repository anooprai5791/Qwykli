import asyncHandler from 'express-async-handler';
import Service from '../models/serviceModel.js';
import Category from '../models/categoryModel.js';
import { clearCache } from '../config/redis.js';
import mongoose from 'mongoose';

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


//  * Search services by text query with improved precision
//  * @route GET /api/services/search
//  * @access Public
//  */

export const searchServices = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    console.log(`Search query: "${q}"`);
    
    // Normalize the query
    const normalizedQuery = q.trim().toLowerCase();
    const isShortQuery = normalizedQuery.length <= 3;
    
    // Create appropriate regex based on query length
    let mainRegex;
    if (isShortQuery) {
      // For short queries, stricter matching to avoid false positives
      mainRegex = new RegExp(`\\b${normalizedQuery}\\b|\\b${normalizedQuery}|${normalizedQuery}\\b`, 'i');
    } else {
      mainRegex = new RegExp(normalizedQuery, 'i');
    }
    
    // 1. First, find matching services
    const matchedServices = await Service.find({
      $or: [
        { name: mainRegex },
        { description: mainRegex }
      ],
      isActive: true
    }).limit(30);
    
    // 2. Lookup all needed categories
    const categoryIds = [...new Set(matchedServices.map(service => service.category))];
    const categories = await mongoose.model('Category').find({
      _id: { $in: categoryIds }
    });
    
    // Create a map for quick category lookups
    const categoryMap = {};
    categories.forEach(category => {
      categoryMap[category._id.toString()] = {
        _id: category._id,
        name: category.name,
        subcategories: category.subcategories || []
      };
    });
    
    // 3. Enhance services with category and subcategory info
    const enhancedServices = matchedServices.map(service => {
      const serviceObj = service.toObject();
      const categoryId = service.category.toString();
      const subcategoryId = service.subcategory.toString();
      
      // Get category info
      const categoryInfo = categoryMap[categoryId] || { name: 'General', subcategories: [] };
      
      // Find subcategory in the category's subcategories array
      const subcategoryInfo = categoryInfo.subcategories.find(
        sub => sub.id.toString() === subcategoryId || sub._id.toString() === subcategoryId
      );
      
      return {
        ...serviceObj,
        category: {
          _id: service.category,
          name: categoryInfo.name
        },
        subcategory: subcategoryInfo 
          ? { _id: subcategoryInfo._id || subcategoryInfo.id, name: subcategoryInfo.name }
          : { _id: service.subcategory, name: 'Service' }
      };
    });
    
    // 4. Also search by category/subcategory names
    let categoryBasedServices = [];
    
    // If we don't have many results, also search by category/subcategory
    if (enhancedServices.length < 10) {
      // Find categories with matching names
      const matchingCategories = await mongoose.model('Category').find({
        name: mainRegex
      });
      
      // Also find categories with matching subcategory names
      const categoriesWithMatchingSubcategories = await mongoose.model('Category').find({
        'subcategories.name': mainRegex
      });
      
      // Combine unique categories
      const allCategories = [...matchingCategories];
      categoriesWithMatchingSubcategories.forEach(cat => {
        if (!allCategories.some(c => c._id.toString() === cat._id.toString())) {
          allCategories.push(cat);
        }
      });
      
      // Build queries for services
      const queries = [];
      
      // Add services by category
      allCategories.forEach(category => {
        // Get matching subcategories
        const matchingSubcatIds = (category.subcategories || [])
          .filter(subcat => mainRegex.test(subcat.name))
          .map(subcat => subcat._id || subcat.id);
        
        // Query for this category
        if (mainRegex.test(category.name)) {
          queries.push({
            category: category._id,
            isActive: true
          });
        }
        
        // Query for matching subcategories
        if (matchingSubcatIds.length > 0) {
          queries.push({
            category: category._id,
            subcategory: { $in: matchingSubcatIds },
            isActive: true
          });
        }
      });
      
      // Execute queries if we have any
      if (queries.length > 0) {
        const additionalServices = await Service.find({ $or: queries }).limit(20);
        
        // Enhance these services too
        categoryBasedServices = additionalServices.map(service => {
          const serviceObj = service.toObject();
          const categoryId = service.category.toString();
          const subcategoryId = service.subcategory.toString();
          
          // Get category info
          const categoryInfo = categoryMap[categoryId] || { name: 'General', subcategories: [] };
          if (!categoryMap[categoryId]) {
            // Add to our map for future reference
            categoryMap[categoryId] = categoryInfo;
          }
          
          // Find subcategory in the category's subcategories array
          const subcategoryInfo = categoryInfo.subcategories.find(
            sub => sub.id.toString() === subcategoryId || sub._id.toString() === subcategoryId
          );
          
          return {
            ...serviceObj,
            category: {
              _id: service.category,
              name: categoryInfo.name
            },
            subcategory: subcategoryInfo 
              ? { _id: subcategoryInfo._id || subcategoryInfo.id, name: subcategoryInfo.name }
              : { _id: service.subcategory, name: 'Service' }
          };
        });
      }
    }
    
    // 5. Combine services and remove duplicates
    const allServices = [...enhancedServices];
    const serviceIds = new Set(allServices.map(s => s._id.toString()));
    
    categoryBasedServices.forEach(service => {
      if (!serviceIds.has(service._id.toString())) {
        allServices.push(service);
        serviceIds.add(service._id.toString());
      }
    });
    
    // 6. Sort by relevance
    allServices.sort((a, b) => {
      // Safe access to properties
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      const aCatName = (a.category?.name || '').toLowerCase();
      const bCatName = (b.category?.name || '').toLowerCase();
      const aSubcatName = (a.subcategory?.name || '').toLowerCase();
      const bSubcatName = (b.subcategory?.name || '').toLowerCase();
      
      // Score calculation
      let aScore = 0;
      let bScore = 0;
      
      // Exact matches in name (highest priority)
      if (aName === normalizedQuery) aScore += 100;
      if (bName === normalizedQuery) bScore += 100;
      
      // Word boundary matches in name
      if (new RegExp(`\\b${normalizedQuery}\\b`, 'i').test(aName)) aScore += 70;
      if (new RegExp(`\\b${normalizedQuery}\\b`, 'i').test(bName)) bScore += 70;
      
      // Contains query string in name
      if (aName.includes(normalizedQuery)) aScore += 30;
      if (bName.includes(normalizedQuery)) bScore += 30;
      
      // Category/subcategory matches
      if (aCatName === normalizedQuery) aScore += 20;
      if (bCatName === normalizedQuery) bScore += 20;
      if (aSubcatName === normalizedQuery) aScore += 15;
      if (bSubcatName === normalizedQuery) bScore += 15;
      
      return bScore - aScore; // Higher score first
    });
    
    // Limit to 30 results
    const limitedServices = allServices.slice(0, 30);
    
    console.log(`Final result count: ${limitedServices.length}`);
    
    res.json({
      success: true,
      count: limitedServices.length,
      data: limitedServices
    });
  } catch (error) {
    console.error('Search error:', error.message);
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
