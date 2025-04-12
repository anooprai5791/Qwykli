import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String
  }
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String
  },
  subcategories: [subcategorySchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for services in this category
categorySchema.virtual('services', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'category'
});

// Index for faster queries
categorySchema.index({ name: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;