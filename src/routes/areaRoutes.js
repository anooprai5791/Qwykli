import express from 'express';
import {
  createArea,
  getAreas,
  getAreaById,
  updateArea,
  deleteArea,
  createBulkAreas
} from '../controllers/areaController.js';
import { protectUser, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protectUser, admin, createArea)
  .get(getAreas);

router.route('/bulk')
  .post(protectUser, admin, createBulkAreas);

router.route('/:id')
  .get(getAreaById)
  .put(protectUser, admin, updateArea)
  .delete(protectUser, admin, deleteArea);

export default router;