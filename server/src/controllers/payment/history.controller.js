import Payment from '../../models/payment.model.js';

export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    if (!userId) {
      return res.status(401).json({ error: 'User ID not found in token' });
    }

    const payments = await Payment.find({ userId: userId })
      .sort({ paymentDate: -1 });

    res.json(payments || []);
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
};
