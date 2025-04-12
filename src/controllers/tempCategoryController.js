import asyncHandler from 'express-async-handler';
import Category from '../models/categoryModel.js';
import mongoose from 'mongoose';
// Temporary unauthenticated controller functions

export const tempCreateCategory = asyncHandler(async (req, res) => {
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
    res.status(201).json(category);
  } else {
    res.status(400);
    throw new Error('Invalid category data');
  }
});

export const tempAddSubcategory = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;

  const category = await Category.findById(req.params.id);

  if (category) {
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
    res.status(201).json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

export const tempGetCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  res.json(categories);
});



// @desc    Update a category
// @route   PUT /api/categories/temp/:id
// @access  Public (temporary)
export const tempUpdateCategory = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid category ID format');
  }

  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  category.name = name || category.name;
  category.description = description || category.description;
  category.icon = icon || category.icon;

  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

// @desc    Delete a category permanently
// @route   DELETE /api/categories/temp/:id
// @access  Public (temporary)
export const tempDeleteCategory = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid category ID format');
  }

  const deletedCategory = await Category.findByIdAndDelete(req.params.id);
  if (!deletedCategory) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json({
    success: true,
    message: 'Category deleted permanently',
    data: {
      id: deletedCategory._id,
      name: deletedCategory.name
    }
  });
});

// @desc    Update a subcategory
// @route   PUT /api/categories/temp/:categoryId/subcategories/:subcategoryId
// @access  Public (temporary)
export const tempUpdateSubcategory = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;

  // if (!mongoose.Types.ObjectId.isValid(req.params.categoryId) || 
  //     !mongoose.Types.ObjectId.isValid(req.params.subcategoryId)) {
  //   res.status(400);
  //   throw new Error('Invalid ID format');
  // }



  const { id, subcategoryId } = req.params;
  console.log(id,subcategoryId);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid category ID format' });
  }
  if (!mongoose.Types.ObjectId.isValid(subcategoryId)) {
    return res.status(400).json({ error: 'Invalid subcategory ID format' });
  }

  const category = await Category.findById(id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const subcategory = category.subcategories.id(subcategoryId);
  if (!subcategory) {
    res.status(404);
    throw new Error('Subcategory not found');
  }

  subcategory.name = name || subcategory.name;
  subcategory.description = description || subcategory.description;
  subcategory.icon = icon || subcategory.icon;

  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

// @desc    Delete a subcategory permanently
// @route   DELETE /api/categories/temp/:categoryId/subcategories/:subcategoryId
// @access  Public (temporary)
export const tempDeleteSubcategory = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id) || 
      !mongoose.Types.ObjectId.isValid(req.params.subcategoryId)) {
    res.status(400);
    throw new Error('Invalid ID format');
  }

  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Remove the subcategory
  category.subcategories.pull({ _id: req.params.subcategoryId });
  const updatedCategory = await category.save();

  res.json({
    success: true,
    message: 'Subcategory deleted permanently',
    data: {
      categoryId: updatedCategory._id,
      subcategoryId: req.params.subcategoryId,
      name: updatedCategory.name
    }
  });
});