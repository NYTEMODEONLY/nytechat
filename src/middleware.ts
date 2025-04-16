import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory store for rate limiting
// In a production environment, you'd use Redis or another distributed store
interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

// Configure rate limits
const RATE_LIMIT_MAX = 25; // Maximum requests per window
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

// IP whitelist (for your development/personal IPs)
// You can add your own IPs here
const WHITELIST: string[] = [];

// Store for rate limiting
const rateLimitStore: RateLimitStore = {};

// Clean up the store periodically
setInterval(() => {
  const now = Date.now();
  for (const ip in rateLimitStore) {
    if (rateLimitStore[ip].resetTime < now) {
      delete rateLimitStore[ip];
    }
  }
}, 60 * 1000); // Clean up every minute

export function middleware(request: NextRequest) {
  // Only apply middleware to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Get client IP
  const ip = request.ip || 'unknown';
  
  // Skip rate limiting for whitelisted IPs
  if (WHITELIST.includes(ip)) {
    return NextResponse.next();
  }

  // Initialize rate limit data for this IP if not exists
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = {
      count: 0,
      resetTime: Date.now() + RATE_LIMIT_WINDOW,
    };
  }

  // If the reset time has passed, reset the counter
  if (rateLimitStore[ip].resetTime < Date.now()) {
    rateLimitStore[ip] = {
      count: 0,
      resetTime: Date.now() + RATE_LIMIT_WINDOW,
    };
  }

  // Increment the counter
  rateLimitStore[ip].count++;

  // Check if rate limit exceeded
  if (rateLimitStore[ip].count > RATE_LIMIT_MAX) {
    // Rate limit exceeded
    return new NextResponse(
      JSON.stringify({
        error: 'Rate limit exceeded. Please try again later.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(rateLimitStore[ip].resetTime / 1000).toString(),
        },
      }
    );
  }

  // Add rate limit headers to the response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
  response.headers.set(
    'X-RateLimit-Remaining',
    Math.max(0, RATE_LIMIT_MAX - rateLimitStore[ip].count).toString()
  );
  response.headers.set(
    'X-RateLimit-Reset',
    Math.ceil(rateLimitStore[ip].resetTime / 1000).toString()
  );

  return response;
}

export const config = {
  matcher: '/api/:path*',
}; 