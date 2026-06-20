import mongoose from 'mongoose';

export const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String,
    required: true
  },
  monthIndex: { // Keeping for backward compatibility (optional)
    type: Number,
    required: false
  },
  monthIndices: { // Array for multi-month payments
    type: [Number],
    default: []
  },
  amount: {
    type: Number,
    required: true
  },
  isAdvanced: {
    type: Boolean,
    default: false
  },
  barcodeImage: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['due', 'pending', 'success', 'failed', 'rejected'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });
