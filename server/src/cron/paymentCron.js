import cron from 'node-cron';
import Payment from '../models/payment.model.js';
import User from '../models/user.model.js';
import { sendEmail, getPaymentReminderEmailTemplate } from '../utils/email.util.js';

const getNextMonthText = (lastMonthStr) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  if (!lastMonthStr) return 'Next Month';
  // Example: "July 2026"
  const parts = lastMonthStr.split(' ');
  const monthName = parts[0];
  let year = parseInt(parts[1]) || new Date().getFullYear();
  let idx = months.indexOf(monthName);
  if (idx === -1) return lastMonthStr; // fallback

  if (idx === 11) {
    idx = 0;
    year += 1;
  } else {
    idx += 1;
  }
  return `${months[idx]} ${year}`;
};

const createRecurringPayments = async () => {
  try {
    const tenants = await User.find({ role: 'tenant' });
    const now = new Date();

    for (const tenant of tenants) {
      // Find the latest payment assigned to this tenant
      const latestPayment = await Payment.findOne({ userId: tenant._id }).sort({ createdAt: -1 });
      if (!latestPayment) continue;

      // Check if 30 days have passed since the latest payment was created/assigned
      const createdTime = new Date(latestPayment.createdAt).getTime();
      const diffTime = now.getTime() - createdTime;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 30) {
        // Automatically assign the next month
        const nextMonth = getNextMonthText(latestPayment.month);
        
        // Prevent duplicate automatic assignment for the exact same month if script runs twice
        const exists = await Payment.findOne({ userId: tenant._id, month: nextMonth });
        if (!exists) {
          const newPayment = new Payment({
            userId: tenant._id,
            month: nextMonth,
            monthIndex: latestPayment.monthIndex === undefined ? undefined : (latestPayment.monthIndex === 11 ? 0 : latestPayment.monthIndex + 1),
            amount: latestPayment.amount, // Assign the same amount
            status: 'due',
            paymentDate: new Date(),
            dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // Next one due in 30 days
          });
          await newPayment.save();
          console.log(`✅ Automatically assigned rent for ${tenant.email} for ${nextMonth}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error creating recurring payments:', error);
  }
};

const sendPaymentReminders = async () => {
  try {
    const now = new Date();
    // Only fetch payments that are due, have less than 3 reminders sent
    const duePayments = await Payment.find({
      status: 'due',
      remindersSent: { $lt: 3 }
    }).populate('userId', 'fullName email');

    for (const payment of duePayments) {
      if (!payment.userId) continue;

      let shouldSend = false;

      if (!payment.lastReminderDate) {
        // It's due, hasn't sent a reminder yet. Send the first one immediately or tomorrow?
        // Let's send the first reminder immediately if it's due and not paid.
        shouldSend = true;
      } else {
        const lastReminderTime = new Date(payment.lastReminderDate).getTime();
        const diffTime = now.getTime() - lastReminderTime;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 1) {
          shouldSend = true;
        }
      }

      if (shouldSend) {
        const reminderNumber = payment.remindersSent + 1;
        const emailHtml = getPaymentReminderEmailTemplate(payment.userId.fullName, payment.month, reminderNumber);
        
        await sendEmail({
          to: payment.userId.email,
          subject: `Payment Reminder #${reminderNumber} - ${payment.month}`,
          html: emailHtml
        });

        payment.remindersSent = reminderNumber;
        payment.lastReminderDate = now;
        await payment.save();

        console.log(`📧 Sent reminder #${reminderNumber} for ${payment.month} to ${payment.userId.email}`);
      }
    }
  } catch (error) {
    console.error('❌ Error sending payment reminders:', error);
  }
};

export const startCronJobs = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running daily payment check...');
    await createRecurringPayments();
    await sendPaymentReminders();
  });
  console.log('✅ Payment cron jobs initialized.');
};
