import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory'
  }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  totalItems: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  // Calculate total amount
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // Calculate service fee (5% of total)
  this.serviceFee = parseFloat((this.totalAmount * 0.05).toFixed(2));
  
  // Calculate total items
  this.totalItems = this.items.reduce((count, item) => {
    return count + item.quantity;
  }, 0);
  
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;