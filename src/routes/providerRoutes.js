// import express from 'express';
// import {
//   getProviders,
//   getProviderById,
//   updateProviderProfile,
//   getProvidersByService,
//   getProvidersByCategory,
//   addProviderService,
//   updateProviderService,
//   removeProviderService,
//   getNearbyProviders
// } from '../controllers/providerController.js';
// import { protect, provider } from '../middleware/authMiddleware.js';
// import { validate, providerSchemas } from '../middleware/validationMiddleware.js';
// import { cacheMiddleware } from '../config/redis.js';

// const router = express.Router();

// router.route('/')
//   .get(cacheMiddleware(300), getProviders);

// router.route('/profile')
//   .put(protect, provider, validate(providerSchemas.updateProfile), updateProviderProfile);

// router.route('/:id')
//   .get(cacheMiddleware(300), getProviderById);

// router.get('/service/:serviceId', cacheMiddleware(60), getProvidersByService);
// router.get('/category/:categoryId', cacheMiddleware(300), getProvidersByCategory);

// router.route('/services')
//   .post(protect, provider, addProviderService);

//   router.get('/nearby', getNearbyProviders);

// router.route('/services/:serviceId')
//   .put(protect, provider, updateProviderService)
//   .delete(protect, provider, removeProviderService);

// export default router;


import express from 'express';
import {
  getProviders,
  getProviderById,
  updateProviderProfile,
  addProviderService,
  updateProviderService,
  removeProviderService,
  getProvidersByCategory,
  getProvidersByService,
  getNearbyProviders,
  getProviderDashboard,
  getMyServices
} from '../controllers/providerController.js';
import { protectProvider, activeProvider } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { cacheMiddleware } from '../config/redis.js';

const router = express.Router();

// Public routes
router.get('/', cacheMiddleware(300), getProviders);
router.get('/:id', cacheMiddleware(300), getProviderById);
router.get('/category/:categoryId', cacheMiddleware(300), getProvidersByCategory);
router.get('/service/:serviceId', cacheMiddleware(300), getProvidersByService);
router.get('/nearby', cacheMiddleware(60), getNearbyProviders);

// Protected provider routes
router.use(protectProvider, activeProvider);

router.route('/profile')
  .put(validate('updateProviderProfile'), updateProviderProfile);

router.route('/services')
  .post(validate('addProviderService'), addProviderService)
  .get(getMyServices);

router.route('/services/:serviceId')
  .put(validate('updateProviderService'), updateProviderService)
  .delete(removeProviderService);

router.get('/dashboard', getProviderDashboard);

export default router;