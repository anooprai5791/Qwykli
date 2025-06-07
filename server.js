// import categoryRoutes from './src/routes/categoryRoutes.js';
// import serviceRoutes from './src/routes/serviceRoutes.js';
// import providerRoutes from './src/routes/providerRoutes.js';
// import userRoutes from './src/routes/userRoutes.js';
// import bookingRoutes from './src/routes/bookingRoutes.js';
// import authRoutes from './src/routes/authRoutes.js';


// const express = require("express");
// const dotenv = require("dotenv");
// const connectDB = require("./src/config/db");
// const cors = require("cors");

// dotenv.config();
// const app = express();

// app.use(cors());
// app.use(express.json());

// // Connect to MongoDB Atlas
// connectDB();

// app.use('/api/auth', authRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/services', serviceRoutes);
// app.use('/api/providers', providerRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/bookings', bookingRoutes);

// app.get("/", (req, res) => {
//   res.send("🚀 API is running...");
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));





// // const { MongoClient, ServerApiVersion } = require("mongodb");

// // // Replace the placeholder with your Atlas connection string
// // const uri = "mongodb+srv://raisahabanoop233:A2PNDz89DKWYd3nm@cluster0.ejpls.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&tls=true&tlsInsecure=true";

// // // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// // const client = new MongoClient(uri,  {
// //         serverApi: {
// //             version: ServerApiVersion.v1,
// //             strict: true,
// //             deprecationErrors: true,
// //             tlsAllowInvalidCertificates: true
// //         }
// //     }
// // );

// // async function run() {
// //   try {
// //     // Connect the client to the server (optional starting in v4.7)
// //     await client.connect();

// //     // Send a ping to confirm a successful connection
// //     await client.db("admin").command({ ping: 1 });
// //     console.log("Pinged your deployment. You successfully connected to MongoDB!");
// //   } finally {
// //     // Ensures that the client will close when you finish/error
// //     await client.close();
// //   }
// // }
// // run().catch(console.dir);


// // const { MongoClient, ServerApiVersion } = require('mongodb');
// // const uri = "mongodb://localhost:27017";

// // // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// // const client = new MongoClient(uri, {
// //   serverApi: {
// //     version: ServerApiVersion.v1,
// //     strict: true,
// //     deprecationErrors: true,
// //   }
// // });

// // async function run() {
// //   try {
// //     // Connect the client to the server	(optional starting in v4.7)
// //     await client.connect();
// //     // Send a ping to confirm a successful connection
// //     await client.db("admin").command({ ping: 1 });
// //     console.log("Pinged your deployment. You successfully connected to MongoDB!");
// //   } finally {
// //     // Ensures that the client will close when you finish/error
// //     await client.close();
// //   }
// // }
// // run().catch(console.dir);




// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import compression from 'compression';
// import rateLimit from 'express-rate-limit';
// import { connectDB } from './src/config/db.js';
// import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';
// import { logger } from './src/utils/logger.js';
// import { initRedis } from './src/config/redis.js';
// import { swaggerDocs } from './src/config/swagger.js';

// // Routes
// import categoryRoutes from './src/routes/categoryRoutes.js';
// import serviceRoutes from './src/routes/serviceRoutes.js';
// import providerRoutes from './src/routes/providerRoutes.js';
// import userRoutes from './src/routes/userRoutes.js';
// import bookingRoutes from './src/routes/bookingRoutes.js';
// import authRoutes from './src/routes/authRoutes.js';



// // import { logger } from './utils/logger.js';

// // Load environment variables
// dotenv.config();

// // Connect to MongoDB
// connectDB();

// // Initialize Redis
// initRedis();



// const app = express();

// // Security middleware
// app.use(helmet());
// app.use(cors());

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);

// // Logging middleware
// app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// // Parse JSON request body
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Compress all responses
// app.use(compression());

// swaggerDocs(app);

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/services', serviceRoutes);
// app.use('/api/providers', providerRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/bookings', bookingRoutes);

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'ok' });
// });

// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'Welcome to the Service Marketplace API!' });
// });

// app.get('/metrics', async (req, res) => {
//   res.set('Content-Type', register.contentType);
//   res.end(await register.metrics());
// });

// // Error handling middleware
// app.use(notFound);
// app.use(errorHandler);







// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
// });

// export default app;






import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http'; // Import createServer from http
import { Server } from 'socket.io'; // Import Server from socket.io
import { connectDB } from './src/config/db.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';
import { logger } from './src/utils/logger.js';
// import { initRedis, getRedisClient } from './src/config/redis.js'; // Import getRedisClient
import { swaggerDocs } from './src/config/swagger.js';
import jwt from 'jsonwebtoken'; // Import JWT for WebSocket authentication
import { createAdapter } from '@socket.io/redis-adapter';

// Routes
import categoryRoutes from './src/routes/categoryRoutes.js';
import serviceRoutes from './src/routes/serviceRoutes.js';
import providerRoutes from './src/routes/providerRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import providerAuthRoutes from './src/routes/providerAuthRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import tempBookingRoutes from './src/routes/tempBookingRoutes.js';

import { localizationMiddleware } from './src/middleware/localization.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Redis
// initRedis();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

app.use(localizationMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Parse JSON request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compress all responses
app.use(compression());

swaggerDocs(app);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/provider/auth',providerAuthRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/temp-booking', tempBookingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to Qwykli!' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Create an HTTP server
const httpServer = createServer(app);

// const pubClient = getRedisClient();
// const subClient = pubClient.duplicate();

// Initialize Socket.io with Redis adapter
//  const io = new Server(httpServer, {
//   cors: {
//     origin: '*', // Allow all origins (update for production)
//   },
//   adapter: createAdapter(pubClient, subClient),
//  });

// Handle WebSocket connections
// Handle WebSocket connections
// io.on('connection', (socket) => {
//   logger.info(`A user connected: ${socket.id}`);

//   // Authenticate the socket connection
//   const token = socket.handshake.auth.token;
//   if (!token) {
//     logger.warn('Unauthorized socket connection attempt');
//     socket.disconnect(true); // Disconnect unauthorized connections
//     return;
//   }

//   // Verify the token (e.g., JWT)
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id;

//     // Join the user's room for notifications
//     socket.join(userId);
//     logger.info(`User ${userId} joined room`);

//     // Handle disconnection
//     socket.on('disconnect', () => {
//       logger.info(`User ${userId} disconnected`);
//     });
   
//     // Handle custom events for notifications (e.g., joinRoom, leaveRoom)
//     socket.on('joinRoom', (roomId) => {
//       socket.join(roomId);
//       logger.info(`User ${userId} joined room ${roomId}`);
//     });

//     socket.on('leaveRoom', (roomId) => {
//       socket.leave(roomId);
//       logger.info(`User ${userId} left room ${roomId}`);
//     });

//     // Handle chat-specific events
//     socket.on('joinChatRoom', (bookingId) => {
//       socket.join(bookingId);
//       logger.info(`User ${userId} joined chat room for booking ${bookingId}`);
//     });

//     socket.on('sendMessage', async (data) => {
//       const { bookingId, sender, content } = data;

//       // Save the message to the database
//       const chat = await Chat.findOne({ booking: bookingId });
//       if (chat) {
//         chat.messages.push({ sender, content });
//         await chat.save();

//         // Broadcast the message to the chat room
//         io.to(bookingId).emit('newMessage', { sender, content });
//       }
//     });
//   } catch (error) {
//     logger.error('Socket authentication failed:', error);
//     socket.disconnect(true); // Disconnect invalid connections
//   }
// });

// Start the server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// export default app;
// export { io };


//In frontend---> 
//Option 1--> In a component---> 
// Add the heartbeat and reconnection logic directly in your component
// import React, { useEffect, useState } from 'react';
// import { io } from 'socket.io-client';

// const BookingComponent = ({ userId }) => {
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     // Connect to the WebSocket server
//     const socket = io('http://your-backend-url', {
//       reconnection: true, // Enable reconnection
//       reconnectionAttempts: 5, // Number of reconnection attempts
//       reconnectionDelay: 1000, // Delay between reconnection attempts (1 second)
//     });

//     // Set up heartbeat
//     let heartbeatInterval;
//     socket.on('connect', () => {
//       console.log('Connected to WebSocket server');

//       // Send a heartbeat every 25 seconds
//       heartbeatInterval = setInterval(() => {
//         socket.emit('heartbeat');
//       }, 25000);
//     });

//     // Handle reconnection
//     socket.on('reconnect', (attempt) => {
//       console.log(`Reconnected after ${attempt} attempts`);
//     });

//     // Handle disconnection
//     socket.on('disconnect', () => {
//       console.log('Disconnected from WebSocket server');
//       clearInterval(heartbeatInterval); // Clear the heartbeat interval
//     });

//     // Join the user's room
//     socket.emit('joinRoom', userId);

//     // Listen for new booking notifications
//     socket.on('newBooking', (data) => {
//       console.log('New booking:', data);
//       // Update UI to show the notification
//     });

//     // Listen for booking updates
//     socket.on('bookingCreated', (data) => {
//       console.log('Booking created:', data);
//       // Update UI to show the booking confirmation
//     });

//     // Save the socket instance in state
//     setSocket(socket);

//     // Cleanup on component unmount
//     return () => {
//       socket.disconnect(); // Disconnect the socket
//       clearInterval(heartbeatInterval); // Clear the heartbeat interval
//     };
//   }, [userId]);

//   return (
//     <div>
//       {/* Your component UI */}
//     </div>
//   );
// };

// export default BookingComponent;



//Option2 : in a custom hook---> 
// import { useEffect, useState } from 'react';
// import { io } from 'socket.io-client';

// const useSocket = (userId) => {
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     const socket = io('http://your-backend-url', {
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//     });

//     let heartbeatInterval;
//     socket.on('connect', () => {
//       console.log('Connected to WebSocket server');

//       heartbeatInterval = setInterval(() => {
//         socket.emit('heartbeat');
//       }, 25000);
//     });

//     socket.on('reconnect', (attempt) => {
//       console.log(`Reconnected after ${attempt} attempts`);
//     });

//     socket.on('disconnect', () => {
//       console.log('Disconnected from WebSocket server');
//       clearInterval(heartbeatInterval);
//     });

//     socket.emit('joinRoom', userId);

//     socket.on('newBooking', (data) => {
//       console.log('New booking:', data);
//     });

//     socket.on('bookingCreated', (data) => {
//       console.log('Booking created:', data);
//     });

//     setSocket(socket);

//     return () => {
//       socket.disconnect();
//       clearInterval(heartbeatInterval);
//     };
//   }, [userId]);

//   return socket;
// };

// export default useSocket;


//Payment integration---> after register

//On frontend for both notification and chat---> 
// const socket = io('http://your-backend-url', {
//   auth: {
//     token: 'your-jwt-token', // Authenticate the socket connection
//   },
// });

// // Join rooms for notifications
// socket.emit('joinRoom', userId);

// // Listen for notifications
// socket.on('newBooking', (data) => {
//   console.log('New booking:', data);
//   // Update UI to show the notification
// });

// // Join chat room for a specific booking
// socket.emit('joinChatRoom', bookingId);

// // Listen for chat messages
// socket.on('newMessage', (data) => {
//   console.log('New message:', data);
//   // Update the chat UI with the new message
// });

// // Send a chat message
// const sendMessage = (bookingId, sender, content) => {
//   socket.emit('sendMessage', { bookingId, sender, content });
// };


//For language preference, do it on frontend---> 
// const updateLanguage = async (language) => {
//   const response = await fetch('/api/users/language', {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${localStorage.getItem('token')}`,
//     },
//     body: JSON.stringify({ language }),
//   });

//   if (response.ok) {
//     console.log('Language preference updated');
//   } else {
//     console.error('Failed to update language preference');
//   }
// };


//For SMS, upgrade to paid twilio account,set up Messaging Service SID or with DLT registration 

//fcm token implementation is not clear(how user/provider will get fcm token and so on),what to do in frontend and all.


//Can see for BullMQ implementation


