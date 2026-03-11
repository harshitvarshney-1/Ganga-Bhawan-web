import Payment from '../../models/payment.model.js';

export const submitPayment = async (req, res) => {
  try {
    const { month, monthIndex, amount } = req.body;

    console.log('Payment submission data received:', { month, monthIndex, amount });

    if (!month || monthIndex === undefined || (amount === undefined || amount === null || amount === '')) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: month, monthIndex, amount'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Barcode image is required'
      });
    }

    const userId = req.user.userId || req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User ID not found in token'
      });
    }

    const existingPayment = await Payment.findOne({
      userId: userId,
      month: month,
      monthIndex: parseInt(monthIndex),
      isAdvanced: req.body.isAdvanced === 'true' || req.body.isAdvanced === true,
      status: { $in: ['pending', 'success'] }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        error: 'Payment already submitted for this month'
      });
    }

    const payment = new Payment({
      userId: userId,
      month: month,
      monthIndex: parseInt(monthIndex),
      amount: parseFloat(amount),
      isAdvanced: req.body.isAdvanced === 'true' || req.body.isAdvanced === true,
      barcodeImage: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null,
      barcodeImageData: req.file ? {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      } : null,
      status: 'pending',
      paymentDate: new Date()
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Payment submitted successfully. Waiting for admin approval.',
      payment
    });

  } catch (error) {
    console.error('Payment submission error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit payment'
    });
  }
};
