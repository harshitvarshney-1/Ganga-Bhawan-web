import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

async function check() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ganga-bhawan';
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const payments = await db.collection('payments').find({ status: 'success' }).sort({paymentDate: -1}).toArray();
    let augTotal = 0;
    console.log("--- AUGUST SUCCESSFUL PAYMENTS ---");
    for (const p of payments) {
      const d = new Date(p.paymentDate);
      if (d.getMonth() === 7 && d.getFullYear() === 2026) { // 7 is August
        console.log(`Date: ${d.toISOString()} | Amount: ₹${p.amount} | Tenant ID: ${p.userId} | Month logic: ${p.month}`);
        augTotal += (p.amount || 0);
      }
    }
    console.log("----------------------------------");
    console.log("Total computed for August 2026:", augTotal);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
