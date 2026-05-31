import rateLimit from 'express-rate-limit';

export const chatRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many requests, please slow down.' },
});
