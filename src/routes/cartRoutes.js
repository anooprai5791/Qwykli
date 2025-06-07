import express from 'express';
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart,
  syncCart
} from '../controllers/cartController.js';
import { protectUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected - require authentication
router.use(protectUser);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/sync')
  .post(syncCart);

router.route('/:itemId')
  .put(updateCartItem)
  .delete(removeCartItem);

export default router;