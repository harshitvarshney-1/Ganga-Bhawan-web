import AuditLog from '../../models/auditLog.model.js';
import User from '../../models/user.model.js';

// ─── Helper: write a log entry (call from any controller) ────────────────────
export const writeLog = async ({ userId, action, req, metadata = {} }) => {
  try {
    const ipAddress =
      req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      req?.connection?.remoteAddress ||
      req?.socket?.remoteAddress ||
      null;

    const userAgent = req?.headers?.['user-agent'] || null;

    await AuditLog.create({ userId, action, ipAddress, userAgent, metadata });
  } catch (err) {
    // Never crash the main flow due to logging
    console.error('⚠️ AuditLog write failed:', err.message);
  }
};

// ─── GET /admin/audit-logs ────────────────────────────────────────────────────
export const getAuditLogs = async (req, res) => {
  try {
    const { userId, action, limit = 100, page = 1 } = req.query;

    const filter = {};
    if (userId)  filter.userId = userId;
    if (action)  filter.action = action;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'fullName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments(filter)
    ]);

    res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

// ─── GET /admin/audit-logs/stats ─────────────────────────────────────────────
export const getAuditStats = async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days

    // Per-tenant login counts
    const loginCounts = await AuditLog.aggregate([
      { $match: { action: 'login_success', createdAt: { $gte: since } } },
      { $group: { _id: '$userId', count: { $sum: 1 }, lastLogin: { $max: '$createdAt' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Populate users
    const userIds = loginCounts.map(l => l._id);
    const users = await User.find({ _id: { $in: userIds } }).select('fullName email');
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

    const topUsers = loginCounts.map(l => ({
      user: userMap[l._id?.toString()] || null,
      count: l.count,
      lastLogin: l.lastLogin
    }));

    // Daily activity (last 7 days)
    const dailyActivity = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          logins: { $sum: { $cond: [{ $eq: ['$action', 'login_success'] }, 1, 0] } },
          payments: { $sum: { $cond: [{ $eq: ['$action', 'payment_submitted'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Total counts
    const totalLogins   = await AuditLog.countDocuments({ action: 'login_success' });
    const todayLogins   = await AuditLog.countDocuments({
      action: 'login_success',
      createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    });

    res.json({ topUsers, dailyActivity, totalLogins, todayLogins });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({ error: 'Failed to fetch audit stats' });
  }
};
