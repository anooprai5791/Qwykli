import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  city: {
    type: String,
    required: true,
    trim: true,
    default: 'Delhi'
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{6}$/
  },
  location: {
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
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Create geospatial index for location-based queries
areaSchema.index({ location: '2dsphere' });

const Area = mongoose.model('Area', areaSchema);

export default Area;