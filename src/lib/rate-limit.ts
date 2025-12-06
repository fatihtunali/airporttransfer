/**
 * Rate Limiting Middleware
 * In-memory rate limiter with configurable windows and limits
 * For production, consider using Redis for distributed rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (use Redis for distributed systems)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
  /** Key prefix for different endpoints */
  keyPrefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Check rate limit for a given identifier
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const { limit, windowMs, keyPrefix = 'rl' } = config;
  const key = `${keyPrefix}:${identifier}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // If no entry or window expired, create new entry
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetAt: entry.resetAt,
    };
  }

  // Increment counter
  entry.count++;

  // Check if over limit
  if (entry.count > limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter,
    };
  }

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
  };

  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}

// Pre-configured rate limit configurations
export const RateLimits = {
  // Public search API - 60 requests per minute
  SEARCH: {
    limit: 60,
    windowMs: 60 * 1000,
    keyPrefix: 'search',
  },

  // Booking creation - 10 requests per minute
  BOOKING: {
    limit: 10,
    windowMs: 60 * 1000,
    keyPrefix: 'booking',
  },

  // Promo code validation - 30 requests per minute
  PROMO_VALIDATE: {
    limit: 30,
    windowMs: 60 * 1000,
    keyPrefix: 'promo',
  },

  // General API - 100 requests per minute
  GENERAL: {
    limit: 100,
    windowMs: 60 * 1000,
    keyPrefix: 'general',
  },

  // Auth endpoints - 5 requests per minute (stricter)
  AUTH: {
    limit: 5,
    windowMs: 60 * 1000,
    keyPrefix: 'auth',
  },

  // B2B/Agency API - 200 requests per minute
  B2B: {
    limit: 200,
    windowMs: 60 * 1000,
    keyPrefix: 'b2b',
  },

  // Tracking updates - 30 requests per minute per booking
  TRACKING: {
    limit: 30,
    windowMs: 60 * 1000,
    keyPrefix: 'tracking',
  },
} as const;

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback - in production this might be from the connection
  return 'unknown';
}

/**
 * Create rate limit response (429 Too Many Requests)
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...getRateLimitHeaders(result),
      },
    }
  );
}

/**
 * Apply rate limit to a Next.js API route
 * Returns null if allowed, Response if rate limited
 */
export function applyRateLimit(
  request: Request,
  config: RateLimitConfig = RateLimits.GENERAL
): { response: Response | null; result: RateLimitResult } {
  const ip = getClientIP(request);
  const result = checkRateLimit(ip, config);

  if (!result.success) {
    return {
      response: createRateLimitResponse(result),
      result,
    };
  }

  return { response: null, result };
}
