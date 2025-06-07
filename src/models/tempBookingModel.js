import mongoose from 'mongoose';

const tempBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  // Changed from single service to array of services
  services: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    serviceDetails: {
      name: { type: String, required: true },
      category: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true 
      },
      subcategory: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true 
      }
    }
  }],
  // Total price now comes from frontend
  totalPrice: {
    type: Number,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  emailSent: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

const TempBooking = mongoose.model('TempBooking', tempBookingSchema);
export default TempBooking;