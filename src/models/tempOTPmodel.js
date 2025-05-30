import mongoose from 'mongoose';

const tempOTPSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  otp: { 
    type: String, 
    required: true 
  },
  otpExpires: { 
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index - auto delete after expiry
  },
  attempts: {
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const TempOTP = mongoose.model('TempOTP', tempOTPSchema);
export default TempOTP;