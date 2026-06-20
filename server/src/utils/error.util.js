// Error handling utility to prevent information disclosure

const SENSITIVE_PATTERNS = [
  /mongodb|mongo/i,
  /sql|query/i,
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /database/i,
  /\.js|\.env|\.git/,
  /stack\s*trace|at\s+\w+/i
];

export const isSensitiveError = (message) => {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(message));
};

export const sanitizeError = (error) => {
  const message = error.message || String(error);

  // Log full error internally for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error('DEBUG ERROR:', message);
  }

  // Return generic message if error contains sensitive info
  if (isSensitiveError(message)) {
    return 'An error occurred. Please try again later.';
  }

  return message;
};

export const handleAsyncError = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.error('Async Error:', error);
      const sanitizedMessage = sanitizeError(error);
      res.status(500).json({ error: sanitizedMessage });
    }
  };
};
