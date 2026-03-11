import mongoose from 'mongoose';
import { paymentSchema } from '../schemas/payment.schema.js';

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
