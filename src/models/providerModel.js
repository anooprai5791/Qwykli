import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const serviceOfferingSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: true });

// const providerSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     lowercase: true
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6
//   },
//   phone: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   experience: {
//     type: Number,
//     default: 0
//   },
//   location: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       default: 'Point'
//     },
//     coordinates: {
//       type: [Number], // [longitude, latitude]
//       default: [0, 0]
//     }
//   },
//   address: {
//     type: String,
//     trim: true
//   },
//   categories: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category'
//   }],
//   services: [serviceOfferingSchema],
//   rating: {
//     type: Number,
//     default: 0
//   },
//   numReviews: {
//     type: Number,
//     default: 0
//   },
//   isVerified: {
//     type: Boolean,
//     default: false
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   availability: {
//     type: [String],
//     default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
//   },
//   availableHours: {
//     start: {
//       type: String,
//       default: '09:00'
//     },
//     end: {
//       type: String,
//       default: '18:00'
//     }
//   }
// }, { 
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

//New Provider Model-->

const providerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{10}$/
  },
  current_location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  // Add service areas array that references the Area model
  service_areas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area'
  }],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  services: [serviceOfferingSchema],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  photo: {
    type: String, 
    required: true
  },
  aadhar_card: {
    type: String, 
    required: true
  },
  pan_card: {
    type: String, 
    required: true
  }, 
  isVerified: {
    type: Boolean,
    default: false
  },
  verification_token: String,
  otp: String,
  otpExpires: Date
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

providerSchema.index({ current_location: '2dsphere' });


providerSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'provider'
});


providerSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'provider'
});


// providerSchema.methods.matchPassword = async function(enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// Encrypt password before saving
// providerSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) {
//     next();
//   }

//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// Index for geospatial queries
// providerSchema.index({ location: '2dsphere' });
providerSchema.index({ categories: 1 });
providerSchema.index({ 'services.service': 1 });
providerSchema.index({ rating: -1 });
providerSchema.index({ experience: -1 });
// Add index for service_areas for faster queries
providerSchema.index({ service_areas: 1 });

const Provider = mongoose.model('Provider', providerSchema);

export default Provider;