import rateLimit from "express-rate-limit";

// General purpose limiter
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 60,             // 60 requests per minute per IP
  message: "Too many requests from this IP, please try again later."
});

// AI endpoints limiter (expensive API)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5,              // 5 AI calls per minute per IP/user
  message: "AI usage limit reached, try again later."
});

// Auth endpoints limiter (login/signup)
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10,             // 10 requests per minute
  message: "Too many login attempts, try again later."
});