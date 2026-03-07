const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String,
    required: true
  },
  monthIndex: {
    type: Number,
    required: true
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
  barcodeImageData: {
    data: Buffer,
    contentType: String,
    filename: String
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'rejected'],
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

module.exports = mongoose.model('Payment', paymentSchema);
