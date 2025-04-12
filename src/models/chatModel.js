import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ['user', 'provider'],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      attachment: {
        type: String, // URL to the uploaded file
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;