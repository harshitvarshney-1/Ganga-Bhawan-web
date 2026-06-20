import crypto from 'crypto';

// Store tokens in memory (in production, use Redis or session store)
const tokenStore = new Map();
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const generateCSRFToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiryTime = Date.now() + TOKEN_EXPIRY;
  tokenStore.set(token, expiryTime);
  return token;
};

export const validateCSRFToken = (token) => {
  if (!token || !tokenStore.has(token)) {
    return false;
  }

  const expiryTime = tokenStore.get(token);
  if (Date.now() > expiryTime) {
    tokenStore.delete(token);
    return false;
  }

  // Token is valid, keep it for potential reuse
  return true;
};

export const consumeCSRFToken = (token) => {
  if (!token || !tokenStore.has(token)) {
    return false;
  }

  const expiryTime = tokenStore.get(token);
  if (Date.now() > expiryTime) {
    tokenStore.delete(token);
    return false;
  }

  // Remove token after consumption
  tokenStore.delete(token);
  return true;
};

// Cleanup expired tokens periodically
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [token, expiryTime] of tokenStore.entries()) {
    if (now > expiryTime) {
      tokenStore.delete(token);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired CSRF tokens`);
  }
}, 60 * 60 * 1000); // Run every hour
