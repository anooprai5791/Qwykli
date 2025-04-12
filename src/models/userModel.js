// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const userSchema = new mongoose.Schema({
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
//     trim: true
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
//   isAdmin: {
//     type: Boolean,
//     default: false
//   },
//   isProvider: {
//     type: Boolean,
//     default: false
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   lastLogin: {
//     type: Date
//   },

  
//   twoFAEnabled: { type: Boolean, default: false },
//   twoFASecret: { type: String, default: null },
// }, { 
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Virtual for bookings
// userSchema.virtual('bookings', {
//   ref: 'Booking',
//   localField: '_id',
//   foreignField: 'user'
// });

// // Match user entered password to hashed password in database
// userSchema.methods.matchPassword = async function(enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// // Encrypt password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) {
//     next();
//   }
  
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// // Index for geospatial queries
// userSchema.index({ location: '2dsphere' });
// userSchema.index({ email: 1 });

// const User = mongoose.model('User', userSchema);
// export default User;




//New User Model---> 
// models/userModel.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  isAdmin:{type:Boolean, default:false},
  otp: { type: String }, // OTP for phone verification
  otpExpires: { type: Date }, // OTP expiration time
  isVerified: { type: Boolean, default: false }, // Phone verification status
  name: { type: String }, // Optional field
  email: { type: String }, // Optional field
  address: { type: String }, // Optional field
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
  },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'user'
});

const User = mongoose.model('User', userSchema);
export default User;




// Category: Electrician
// {
//   "_id": ObjectId("60d21b4667d0d8992e610c85"),
//   "name": "Electrician",
//   "description": "Professional electrical services",
//   "icon": "zap",
//   "subcategories": [
//     {
//       "_id": ObjectId("60d21b4667d0d8992e610c86"),
//       "name": "Fan Services",
//       "description": "All services related to fans",
//       "icon": "fan"
//     },
//     {
//       "_id": ObjectId("60d21b4667d0d8992e610c87"),
//       "name": "AC Services",
//       "description": "Air conditioner services",
//       "icon": "thermometer"
//     }
//   ],
//   "isActive": true
// }

// Services
// Fan Installation
// {
//   "_id": ObjectId("60d21b4667d0d8992e610c88"),
//   "name": "Fan Installation",
//   "description": "Installation of ceiling or wall fans",
//   "category": ObjectId("60d21b4667d0d8992e610c85"),
//   "subcategory": ObjectId("60d21b4667d0d8992e610c86"),
//   "basePrice": 50,
//   "isActive": true
// }
// Fan Repair
// {
//   "_id": ObjectId("60d21b4667d0d8992e610c89"),
//   "name": "Fan Repair",
//   "description": "Repair of ceiling or wall fans",
//   "category": ObjectId("60d21b4667d0d8992e610c85"),
//   "subcategory": ObjectId("60d21b4667d0d8992e610c86"),
//   "serviceType": "repair",
//   "basePrice": 40,
//   "estimatedTime": 45,
//   "isActive": true
// }

// Provider
// JE
// John's Electrical
// 4.8 (120 reviews)
// •
// 5 years experience
// Downtown, 2.3 miles away
// {
//   "_id": ObjectId("60d21b4667d0d8992e610c90"),
//   "name": "John's Electrical",
//   "email": "john@electrical.com",
//   "phone": "+1234567890",
//   "experience": 5,
//   "location": {
//     "type": "Point",
//     "coordinates": [-73.9857, 40.7484]
//   },
//   "address": "123 Main St, Downtown",
//   "categories": [ObjectId("60d21b4667d0d8992e610c85")],
//   "services": [
//     {
//       "service": ObjectId("60d21b4667d0d8992e610c88"),
//       "price": 60,
//       "isActive": true
//     },
//     {
//       "service": ObjectId("60d21b4667d0d8992e610c89"),
//       "price": 45,
//       "isActive": true
//     }
//   ],
//   "visitCharge": 20,
//   "rating": 4.8,
//   "numReviews": 120,
//   "isVerified": true,
//   "isActive": true
// }
// Booking
// Fan Installation Booking
// Scheduled for June 20, 2023 at 10:00 AM

// Confirmed
// {
//   "_id": ObjectId("60d21b4667d0d8992e610c95"),
//   "user": ObjectId("60d21b4667d0d8992e610c80"),
//   "provider": ObjectId("60d21b4667d0d8992e610c90"),
//   "service": ObjectId("60d21b4667d0d8992e610c88"),
//   "isVisitOnly": false,
//   "price": 60,
//   "visitCharge": 20,
//   "status": "confirmed",
//   "scheduledDate": ISODate("2023-06-20"),
//   "scheduledTime": "10:00",
//   "address": "456 Park Ave, Uptown",
//   "location": {
//     "type": "Point",
//     "coordinates": [-73.9654, 40.7829]
//   },
//   "notes": "Please bring tools for mounting on concrete ceiling",
//   "createdAt": ISODate("2023-06-15T10:00:00Z"),
//   "updatedAt": ISODate("2023-06-15T10:30:00Z")
// }