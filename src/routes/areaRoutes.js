// src/routes/areaRoutes.js
import express from 'express';
import { 
  createArea, 
  getAreas, 
  getAreaById, 
  updateArea, 
  deleteArea,
  createBulkAreas
} from '../controllers/areacontroller.js';
// Import your auth middleware if needed
// import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(/* protect, admin, */ createArea)
  .get(getAreas);

router.route('/bulk')
  .post(/* protect, admin, */ createBulkAreas);

router.route('/:id')
  .get(getAreaById)
  .put(/* protect, admin, */ updateArea)
  .delete(/* protect, admin, */ deleteArea);

export default router;