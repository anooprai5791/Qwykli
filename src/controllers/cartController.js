import asyncHandler from 'express-async-handler';
import Cart from '../models/cartModel.js';
import Service from '../models/serviceModel.js';
import User from '../models/userModel.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  let cart = await Cart.findOne({ user: userId })
    .populate({
      path: 'items.service',
      select: 'name basePrice category subcategory'
    });

  if (!cart) {
    // Create a new cart if one doesn't exist
    cart = await Cart.create({
      user: userId,
      items: [],
      totalAmount: 0
    });
  }

  res.json(cart);
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  const { serviceId, quantity = 1 } = req.body;
  const userId = req.user._id;

  // Validate service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  // Find user's cart or create a new one
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [],
      totalAmount: 0
    });
  }

  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.service.toString() === serviceId
  );

  if (existingItemIndex > -1) {
    // Update quantity if item exists
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item to cart
    cart.items.push({
      service: serviceId,
      quantity,
      price: service.basePrice,
      name: service.name,
      category: service.category,
      subcategory: service.subcategory
    });
  }

  // Save cart (pre-save middleware will calculate totals)
  await cart.save();

  res.status(201).json(cart);
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user._id;

  // Validate quantity
  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error('Quantity must be at least 1');
  }

  // Find user's cart
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  // Find the item in the cart
  const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  // Update quantity
  cart.items[itemIndex].quantity = quantity;

  // Save cart (pre-save middleware will calculate totals)
  await cart.save();

  res.json(cart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  // Find user's cart
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  // Remove the item from the cart
  cart.items = cart.items.filter(item => item._id.toString() !== itemId);

  // Save cart (pre-save middleware will calculate totals)
  await cart.save();

  res.json(cart);
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find user's cart
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  // Clear all items
  cart.items = [];

  // Save cart (pre-save middleware will calculate totals)
  await cart.save();

  res.json({ message: 'Cart cleared', cart });
});

// @desc    Sync local cart with database (for guest users who log in)
// @route   POST /api/cart/sync
// @access  Private
export const syncCart = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const userId = req.user._id;

  if (!items || !Array.isArray(items)) {
    res.status(400);
    throw new Error('Invalid cart data');
  }

  // Find user's cart or create a new one
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [],
      totalAmount: 0
    });
  }

  // Process each item from the local cart
  for (const localItem of items) {
    // Validate service exists
    const service = await Service.findById(localItem.id);
    if (!service) continue; // Skip invalid services

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.service.toString() === localItem.id
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += localItem.quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        service: localItem.id,
        quantity: localItem.quantity,
        price: service.basePrice,
        name: service.name,
        description: service.description,
        category: service.category,
        subcategory: service.subcategory
      });
    }
  }

  // Save cart (pre-save middleware will calculate totals)
  await cart.save();

  res.status(200).json(cart);
});