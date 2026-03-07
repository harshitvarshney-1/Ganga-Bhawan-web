import Payment from "../../models/Payment";

const getHistoryController = async (req, res) => {
  try {
    // Use userId from JWT token (set in auth middleware)
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

export default getHistoryController;
