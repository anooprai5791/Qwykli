import express from 'express';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  getServicesByCategory,
  getServicesBySubcategory
} from '../controllers/serviceController.js';
import { protectUser, admin } from '../middleware/authMiddleware.js';
import { validate, serviceSchemas } from '../middleware/validationMiddleware.js';
import { cacheMiddleware } from '../config/redis.js';
import {tempCreateService,
  tempGetServices,
  tempGetServicesByCategory,tempUpdateService,tempDeleteService,tempGetServiceById} from '../controllers/tempServiceController.js';

const router = express.Router();

// Temporary routes - must come before regular routes
router.route('/temp')
  .post(tempCreateService)
  .get(tempGetServices);

router.get('/temp/category/:categoryId', tempGetServicesByCategory);

router.route('/temp/:id')
  .put(tempUpdateService)
  .delete(tempDeleteService)
  .get(tempGetServiceById);

router.route('/')
  .get(cacheMiddleware(300), getServices)
  .post(protectUser, admin, validate(serviceSchemas.create), createService);

router.route('/:id')
  .get(cacheMiddleware(300), getServiceById)
  .put(protectUser, admin, updateService)
  .delete(protectUser, admin, deleteService);

router.get('/category/:categoryId', cacheMiddleware(300), getServicesByCategory);
router.get('/subcategory/:subcategoryId', cacheMiddleware(300), getServicesBySubcategory);



export default router;