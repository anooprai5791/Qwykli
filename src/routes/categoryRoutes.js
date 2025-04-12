import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  addSubcategory,
  updateSubcategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protectUser, admin } from '../middleware/authMiddleware.js';
import { validate, categorySchemas } from '../middleware/validationMiddleware.js';
import { cacheMiddleware } from '../config/redis.js';


import {
  tempCreateCategory,
  tempAddSubcategory,
  tempGetCategories,tempUpdateCategory,tempUpdateSubcategory,tempDeleteCategory,tempDeleteSubcategory
} from '../controllers/tempCategoryController.js';

const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */

router.route('/temp')
.post(validate(categorySchemas.create), tempCreateCategory)
.get(tempGetCategories);

router.route('/temp/:id/subcategories')
.post(tempAddSubcategory);
  // Add these temporary routes before the regular routes
  router.route('/temp/:id')
  .put(tempUpdateCategory)
  .delete(tempDeleteCategory);
  
  router.route('/temp/:id/subcategories/:subcategoryId')
  .put(tempUpdateSubcategory)
  .delete(tempDeleteSubcategory);

router.route('/')
  .get(cacheMiddleware(300), getCategories) 
  .post(protectUser, admin, validate(categorySchemas.create), createCategory);

  /**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid category data
 */
    
router.route('/:id')
  .get(cacheMiddleware(300), getCategoryById)
  .put(protectUser, admin, updateCategory)
  .delete(protectUser, admin, deleteCategory);

router.route('/:id/subcategories')
  .post(protectUser, admin, addSubcategory);

router.route('/:id/subcategories/:subcategoryId')
  .put(protectUser, admin, updateSubcategory);




export default router;