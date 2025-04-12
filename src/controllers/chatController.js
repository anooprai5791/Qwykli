import asyncHandler from 'express-async-handler';
import Chat from '../models/chatModel.js';
import Booking from '../models/bookingModel.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';


// Configure Cloudinary for file storage
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for file uploads
export const upload = multer({ dest: 'uploads/' });

// @desc    Create a new chat
// @route   POST /api/chats
// @access  Private
export const createChat = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  // Check if the booking exists
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if the user is part of the booking
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to create a chat for this booking');
  }

  // Check if a chat already exists for this booking
  const existingChat = await Chat.findOne({ booking: bookingId });
  if (existingChat) {
    res.status(400);
    throw new Error('Chat already exists for this booking');
  }

  // Create the chat
  const chat = await Chat.create({
    booking: bookingId,
    user: booking.user,
    provider: booking.provider,
    messages: [],
  });

  res.status(201).json(chat);
});

// @desc    Get chat by booking ID
// @route   GET /api/chats/:bookingId
// @access  Private
export const getChatByBookingId = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({ booking: req.params.bookingId });

  if (chat) {
    res.json(chat);
  } else {
    res.status(404);
    throw new Error('Chat not found');
  }
});

// @desc    Send a message in a chat
// @route   POST /api/chats/:bookingId/messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { content, sender } = req.body;
  const file = req.file;

  // Find the chat
  const chat = await Chat.findOne({ booking: req.params.bookingId });
  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  // Check if the user is part of the chat
  if (
    (sender === 'user' && chat.user.toString() !== req.user._id.toString()) ||
    (sender === 'provider' && chat.provider.toString() !== req.user._id.toString())
  ) {
    res.status(403);
    throw new Error('Not authorized to send a message in this chat');
  }

  let attachmentUrl = null;
  if (file) {
    const result = await cloudinary.uploader.upload(file.path);
    attachmentUrl = result.secure_url;
  }

  // Add the message to the chat
  chat.messages.push({ sender, content,attachment: attachmentUrl });
  await chat.save();

  // Emit the message to the other party
  const io = req.app.get('io');
  io.to(chat.booking.toString()).emit('newMessage', { sender, content,attachment: attachmentUrl });

  res.status(201).json(chat);
});