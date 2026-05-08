# Rate Limiting System

## Overview

This project implements comprehensive rate limiting for all Supabase Edge Functions to prevent DoS attacks and abuse. The system provides both **per-IP** and **per-user** rate limiting with configurable thresholds.

## Architecture

### Shared Utility (`rateLimit.ts`)

The rate limiting system is centralized in `supabase/functions/_shared/rateLimit.ts`, which provides:

- **Per-IP rate limiting**: Tracks requests from client IP addresses
- **Per-user rate limiting**: Tracks authenticated user requests
- **Configurable thresholds**: Preset configurations for different sensitivity levels
- **Automatic cleanup**: Expired rate limit entries are automatically removed
- **Retry-After headers**: Compliant with HTTP 429 standards

### Storage

Rate limits are stored **in-memory per edge function instance**. This means:

- ✅ **Fast**: No database queries needed for rate limit checks
- ✅ **Simple**: No external dependencies
- ⚠️ **Instance-specific**: Each edge function instance maintains its own limits
- ⚠️ **Resets on restart**: Limits reset when the function cold-starts

For distributed, persistent rate limiting, consider using external services like Redis (not currently implemented).

## Rate Limit Presets

### Available Presets

```typescript
RateLimitPresets = {
  // STRICT: 10 requests per minute
  STRICT: { windowMs: 60 * 1000, maxRequests: 10 },
  
  // STANDARD: 30 requests per minute
  STANDARD: { windowMs: 60 * 1000, maxRequests: 30 },
  
  // LENIENT: 100 requests per minute
  LENIENT: { windowMs: 60 * 1000, maxRequests: 100 },
  
  // HOURLY_STRICT: 100 requests per hour
  HOURLY_STRICT: { windowMs: 60 * 60 * 1000, maxRequests: 100 },
  
  // HOURLY_STANDARD: 500 requests per hour
  HOURLY_STANDARD: { windowMs: 60 * 60 * 1000, maxRequests: 500 },
  
  // AUTH_OPERATION: 5 requests per hour (for sensitive auth operations)
  AUTH_OPERATION: { windowMs: 60 * 60 * 1000, maxRequests: 5 }
}
```

## Current Implementation

### Edge Function Rate Limits

| Function | Per-IP Limit | Per-User/Email Limit | Notes |
|----------|--------------|---------------------|-------|
| **create-lead** | 30/min | 100/hour per email | Prevents lead spam |
| **send-verification-email** | 30/min | 100/hour per email | Prevents email flooding |
| **verify-email-code** | 30/min | 5/hour per email | Prevents brute force |
| **email-fin-report** | 30/min | 500/hour per email | Allows report generation |
| **generate-dime-pdf** | 100/min | 100/min per user | Requires authentication |
| **generate-fin-pdf** | 100/min | 100/min per user | Requires authentication |

### Security Considerations

1. **Email Verification**: Uses the strictest limits (5 attempts/hour) to prevent brute force attacks on 6-digit codes
2. **Lead Creation**: Moderate limits to prevent spam while allowing legitimate high-volume testing
3. **PDF Generation**: Lenient limits since these require authentication and ownership verification
4. **Email Sending**: Balanced limits to prevent abuse while supporting legitimate use cases

## Usage Example

### Basic Implementation

```typescript
import { getClientIP, applyRateLimits, RateLimitPresets } from "../_shared/rateLimit.ts";

const handler = async (req: Request): Promise<Response> => {
  // Get client IP
  const clientIP = getClientIP(req);
  
  // Apply rate limits
  const rateLimitResponse = applyRateLimits([
    {
      key: clientIP,
      config: { ...RateLimitPresets.STANDARD, keyPrefix: 'my_function_ip' }
    }
  ], corsHeaders);
  
  if (rateLimitResponse) {
    return rateLimitResponse; // Returns 429 Too Many Requests
  }
  
  // Continue with normal processing...
};
```

### Multiple Rate Limits (IP + User)

```typescript
// Apply both IP and user-specific limits
const rateLimitResponse = applyRateLimits([
  {
    key: clientIP,
    config: { ...RateLimitPresets.STANDARD, keyPrefix: 'my_function_ip' }
  },
  {
    key: userId,
    config: { ...RateLimitPresets.HOURLY_STANDARD, keyPrefix: 'my_function_user' }
  }
], corsHeaders);
```

### Custom Configuration

```typescript
const rateLimitResponse = applyRateLimits([
  {
    key: email,
    config: {
      windowMs: 10 * 60 * 1000, // 10 minutes
      maxRequests: 5,            // 5 requests
      keyPrefix: 'custom_limit'
    }
  }
], corsHeaders);
```

## Monitoring

Rate limit violations are logged with the following information:

```typescript
console.warn(`Rate limit exceeded for key: ${limitKey}. Count: ${entry.count}`);
```

Monitor your edge function logs for patterns:
- Frequent rate limit hits from the same IP (potential attack)
- Legitimate users hitting limits (consider increasing thresholds)
- Abnormal traffic patterns (investigate potential abuse)

## Response Format

When rate limits are exceeded, the API returns:

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again in 5 minutes.",
  "retryAfter": 5
}
```

**HTTP Headers:**
- Status: `429 Too Many Requests`
- `Retry-After`: Number of seconds until retry (HTTP standard)
- `Content-Type`: `application/json`

## Customization

### Adjusting Limits

To modify rate limits for a specific function:

1. Open the edge function file (e.g., `supabase/functions/create-lead/index.ts`)
2. Find the `applyRateLimits` call
3. Change the preset or specify custom values:

```typescript
// Before (standard limit)
config: { ...RateLimitPresets.STANDARD, keyPrefix: 'my_function' }

// After (custom limit - 50 requests per minute)
config: { 
  windowMs: 60 * 1000, 
  maxRequests: 50, 
  keyPrefix: 'my_function' 
}
```

### Adding Rate Limiting to New Functions

1. Import the utilities:
```typescript
import { getClientIP, applyRateLimits, RateLimitPresets } from "../_shared/rateLimit.ts";
```

2. Apply rate limits at the start of your handler:
```typescript
const clientIP = getClientIP(req);
const rateLimitResponse = applyRateLimits([
  {
    key: clientIP,
    config: { ...RateLimitPresets.STANDARD, keyPrefix: 'new_function_ip' }
  }
], corsHeaders);

if (rateLimitResponse) return rateLimitResponse;
```

## Best Practices

1. **Always prefix keys**: Use unique `keyPrefix` values for each function to avoid conflicts
2. **Layer defenses**: Combine IP and user-based limits for comprehensive protection
3. **Be user-friendly**: Provide clear error messages with retry timing
4. **Monitor logs**: Watch for abuse patterns and adjust limits accordingly
5. **Reset on success**: For operations like verification, reset rate limits after successful completion

## Limitations

- **In-memory only**: Limits are per-instance and reset on function restart
- **Not distributed**: Each edge function instance has independent limits
- **Cold start resets**: Rate limit state is lost when instances scale down

For production applications with high traffic, consider:
- Implementing persistent storage (e.g., Redis, Supabase database)
- Using a distributed rate limiting service
- Setting up monitoring and alerting for rate limit violations

## Security Notes

This rate limiting system is designed to prevent:
- ✅ **Brute force attacks** (email verification)
- ✅ **DoS attacks** (overwhelming the service)
- ✅ **Spam** (lead creation, email sending)
- ✅ **Resource abuse** (PDF generation)

However, sophisticated attackers may still bypass IP-based limits using:
- Distributed botnets
- IP rotation
- Proxy services

Additional security measures recommended:
- CAPTCHA for public-facing forms
- Authentication for sensitive operations
- Network-level DDoS protection
- Suspicious pattern detection and blocking
