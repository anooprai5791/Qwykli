import asyncHandler from 'express-async-handler';
import Category from '../models/categoryModel.js';
import { clearCache } from '../config/redis.js';

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;

  const categoryExists = await Category.findOne({ name });
  
  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await Category.create({
    name,
    description,
    icon,
  });

  if (category) {
    // Clear cache
    await clearCache('__express__/api/categories*');
    
    res.status(201).json(category);
  } else {
    res.status(400);
    throw new Error('Invalid category data');
  }
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  res.json(categories);
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('services');
  
  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, isActive } = req.body;

  const category = await Category.findById(req.params.id);

  if (category) {
    category.name = name || category.name;
    category.description = description || category.description;
    category.icon = icon || category.icon;
    
    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    const updatedCategory = await category.save();
    
    // Clear cache
    await clearCache('__express__/api/categories*');
    
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Add subcategory to a category
// @route   POST /api/categories/:id/subcategories
// @access  Private/Admin
export const addSubcategory = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;

  const category = await Category.findById(req.params.id);

  if (category) {
    // Check if subcategory already exists
    const subcategoryExists = category.subcategories.find(
      (sub) => sub.name.toLowerCase() === name.toLowerCase()
    );

    if (subcategoryExists) {
      res.status(400);
      throw new Error('Subcategory already exists in this category');
    }

    category.subcategories.push({
      name,
      description,
      icon,
    });

    const updatedCategory = await category.save();
    
    // Clear cache
    await clearCache('__express__/api/categories*');
    
    res.status(201).json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Update a subcategory
// @route   PUT /api/categories/:id/subcategories/:subcategoryId
// @access  Private/Admin
export const updateSubcategory = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;

  const category = await Category.findById(req.params.id);

  if (category) {
    const subcategory = category.subcategories.id(req.params.subcategoryId);

    if (subcategory) {
      subcategory.name = name || subcategory.name;
      subcategory.description = description || subcategory.description;
      subcategory.icon = icon || subcategory.icon;

      const updatedCategory = await category.save();
      
      // Clear cache
      await clearCache('__express__/api/categories*');
      
      res.json(updatedCategory);
    } else {
      res.status(404);
      throw new Error('Subcategory not found');
    }
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    // Instead of deleting, mark as inactive
    category.isActive = false;
    await category.save();
    
    // Clear cache
    await clearCache('__express__/api/categories*');
    
    res.json({ message: 'Category removed' });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});