/**
 * Rate Limiting Utility for Supabase Edge Functions
 * Provides per-IP and per-user rate limiting with configurable thresholds
 */

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyPrefix: string; // Prefix for the rate limit key
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory storage for rate limits (per edge function instance)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check and enforce rate limit for a given key
 * @returns null if within limits, error Response if exceeded
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
  corsHeaders: Record<string, string>
): Response | null {
  const now = Date.now();
  const limitKey = `${config.keyPrefix}_${key}`;
  
  let entry = rateLimitStore.get(limitKey);
  
  // Create or reset entry if expired
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs
    };
    rateLimitStore.set(limitKey, entry);
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const remainingTime = Math.ceil((entry.resetAt - now) / 60000);
    console.warn(`Rate limit exceeded for key: ${limitKey}. Count: ${entry.count}`);
    
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${remainingTime} minute${remainingTime !== 1 ? 's' : ''}.`,
        retryAfter: remainingTime
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000))
        }
      }
    );
  }
  
  // Increment counter
  entry.count++;
  return null;
}

/**
 * Extract IP address from request
 *
 * SECURITY NOTE: Supabase Edge Runtime sits behind the Supabase/Cloudflare
 * proxy and there is no guaranteed trusted client-IP header available to
 * functions today. We use the leftmost `x-forwarded-for` value, which is
 * client-influenced and can be spoofed by rotating the header.
 *
 * Per-IP rate limits built on this value are therefore BEST-EFFORT only.
 * They reduce noise from naive abuse but MUST NOT be the sole defense for
 * sensitive flows (OTP verification, payment confirmation, etc.). Always
 * combine with a durable, server-side counter scoped to the protected
 * resource (e.g. the OTP row) — that DB-backed counter is the primary
 * brute-force control.
 */
export function getClientIP(req: Request): string {
  // Check various headers for the real IP
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback to a default (shouldn't happen in production)
  return 'unknown';
}

/**
 * Apply multiple rate limit checks
 * @returns error Response if any limit is exceeded, null otherwise
 */
export function applyRateLimits(
  checks: Array<{ key: string; config: RateLimitConfig }>,
  corsHeaders: Record<string, string>
): Response | null {
  for (const check of checks) {
    const limitResponse = checkRateLimit(check.key, check.config, corsHeaders);
    if (limitResponse) {
      return limitResponse;
    }
  }
  return null;
}

/**
 * Reset rate limit for a specific key (useful after successful operations)
 */
export function resetRateLimit(key: string, keyPrefix: string): void {
  const limitKey = `${keyPrefix}_${key}`;
  rateLimitStore.delete(limitKey);
}

// Default rate limit configurations
export const RateLimitPresets = {
  // Strict: 10 requests per minute
  STRICT: {
    windowMs: 60 * 1000,
    maxRequests: 10
  },
  // Standard: 30 requests per minute
  STANDARD: {
    windowMs: 60 * 1000,
    maxRequests: 30
  },
  // Lenient: 100 requests per minute
  LENIENT: {
    windowMs: 60 * 1000,
    maxRequests: 100
  },
  // Per-hour limits
  HOURLY_STRICT: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 100
  },
  HOURLY_STANDARD: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 500
  },
  // Auth-specific (stricter for sensitive operations)
  AUTH_OPERATION: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5
  }
};
