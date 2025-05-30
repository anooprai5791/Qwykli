import TempBooking from '../models/tempBookingModel.js';
import User from '../models/userModel.js';
import Service from '../models/serviceModel.js';
import emailjs from '@emailjs/nodejs';

// Initialize EmailJS with your credentials
const initEmailJS = () => {
  emailjs.init({
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY
  });
};

// Admin email addresses
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL_1,
  process.env.ADMIN_EMAIL_2
];

export const createTempBooking = async (req, res) => {
  try {
    const { services, totalPrice, scheduledDate, scheduledTime } = req.body;
    const userId = req.user._id; // User ID comes from auth middleware

    // Fetch user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Process multiple services
    const serviceDetails = [];
    for (const item of services) {
      const service = await Service.findById(item.serviceId).populate('category');
      if (!service) {
        return res.status(404).json({ 
          success: false, 
          message: `Service with ID ${item.serviceId} not found` 
        });
      }

      serviceDetails.push({
        service: service._id,
        serviceDetails: {
          name: service.name,
          category: service.category._id,
          subcategory: service.subcategory
        }
      });
    }

    // Create new temp booking
    const newTempBooking = new TempBooking({
      user: userId,
      userDetails: {
        name: user.name || 'Not provided',
        phone: user.phone,
        address: user.address || 'Not provided'
      },
      services: serviceDetails,
      totalPrice, // Use the price from frontend
      scheduledDate,
      scheduledTime
    });

    // Save the booking
    const savedBooking = await newTempBooking.save();

    // Send emails to admins
    await sendEmailToAdmins(savedBooking);

    // Update the booking to mark emails as sent
    savedBooking.emailSent = true;
    await savedBooking.save();

    return res.status(201).json({
      success: true,
      message: 'Temporary booking created successfully',
      data: savedBooking
    });
  } catch (error) {
    console.error('Error creating temporary booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating temporary booking',
      error: error.message
    });
  }
};

export const getUserTempBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const tempBookings = await TempBooking.find({ user: userId })
      .populate({
        path: 'services.service',
        select: 'name'
      })
      .populate({
        path: 'services.serviceDetails.category',
        select: 'name'
      });

    return res.status(200).json({
      success: true,
      count: tempBookings.length,
      data: tempBookings
    });
  } catch (error) {
    console.error('Error fetching user temporary bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching temporary bookings',
      error: error.message
    });
  }
};

export const getAllTempBookings = async (req, res) => {
  try {
    const tempBookings = await TempBooking.find()
      .populate('user', 'name phone')
      .populate({
        path: 'services.service',
        select: 'name'
      })
      .populate({
        path: 'services.serviceDetails.category',
        select: 'name'
      });

    return res.status(200).json({
      success: true,
      count: tempBookings.length,
      data: tempBookings
    });
  } catch (error) {
    console.error('Error fetching all temporary bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching temporary bookings',
      error: error.message
    });
  }
};

export const getTempBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tempBooking = await TempBooking.findById(id)
      .populate('user', 'name phone')
      .populate({
        path: 'services.service',
        select: 'name'
      })
      .populate({
        path: 'services.serviceDetails.category',
        select: 'name'
      });
      
    if (!tempBooking) {
      return res.status(404).json({
        success: false,
        message: 'Temporary booking not found'
      });
    }

    // Check if user is authorized to view this booking
    if (req.user.role === 'user' && tempBooking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking'
      });
    }

    return res.status(200).json({
      success: true,
      data: tempBooking
    });
  } catch (error) {
    console.error('Error fetching temporary booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching temporary booking',
      error: error.message
    });
  }
};

// Function to send emails to admins
const sendEmailToAdmins = async (booking) => {
  try {
    initEmailJS();

    const formattedDate = new Date(booking.scheduledDate).toLocaleDateString();
    
    // Create a list of services for the email
    const servicesList = booking.services.map(item => 
      `${item.serviceDetails.name}`
    ).join(', ');
    
    const templateParams = {
      booking_id: booking._id.toString(),
      services_list: servicesList,
      total_price: booking.totalPrice,
      customer_name: booking.userDetails.name,
      customer_phone: booking.userDetails.phone,
      customer_address: booking.userDetails.address,
      scheduled_date: formattedDate,
      scheduled_time: booking.scheduledTime
    };

    // Send emails to both admins
    const emailPromises = ADMIN_EMAILS.map(email => {
      return emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID,
        {
          ...templateParams,
          admin_email: email
        }
      );
    });

    await Promise.all(emailPromises);
    console.log('Emails sent to admins successfully');

    return true;
  } catch (error) {
    console.error('Error sending emails to admins:', error);
    throw error;
  }
};