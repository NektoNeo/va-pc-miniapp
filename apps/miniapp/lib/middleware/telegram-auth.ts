import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import {
  validateInitDataWithDevBypass,
  type TelegramUser,
} from '../telegram/validate-init-data';

/**
 * Extended request type with Telegram user info
 */
export interface TelegramAuthRequest extends NextRequest {
  telegramUser?: TelegramUser;
  telegramUserId?: number;
}

/**
 * Telegram authentication middleware for Next.js API routes
 *
 * Usage in API route:
 * ```ts
 * import { withTelegramAuth } from '@/lib/middleware/telegram-auth';
 *
 * async function handler(req: TelegramAuthRequest) {
 *   const userId = req.telegramUserId;
 *   const user = req.telegramUser;
 *   // ... your handler logic
 *   return NextResponse.json({ success: true });
 * }
 *
 * export const GET = withTelegramAuth(handler);
 * ```
 */
export function withTelegramAuth<T = unknown>(
  handler: (req: TelegramAuthRequest, context?: T) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest, context?: T): Promise<NextResponse> => {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      // In development, allow bypassing token check if using dev initData
      const isDevelopment = process.env.NODE_ENV === 'development';

      if (!botToken && !isDevelopment) {
        console.error('TELEGRAM_BOT_TOKEN environment variable is not set');
        return NextResponse.json(
          {
            error: 'Server configuration error',
            message: 'Telegram bot token not configured',
          },
          { status: 500 }
        );
      }

      // Extract initData from different sources
      let initData: string | undefined;

      // 1. Try to get from Authorization header (Bearer token)
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        initData = authHeader.substring(7);
      }

      // 2. Try to get from X-Telegram-Init-Data header
      if (!initData) {
        initData = req.headers.get('x-telegram-init-data') || undefined;
      }

      // 3. Try to get from query parameter (for GET requests)
      if (!initData) {
        const { searchParams } = new URL(req.url);
        initData = searchParams.get('initData') || undefined;
      }

      // 4. Try to get from request body (for POST/PUT/PATCH requests)
      if (!initData && req.method !== 'GET' && req.method !== 'HEAD') {
        try {
          // Clone the request to read body without consuming it
          const clonedReq = req.clone();
          const body = await clonedReq.json();
          initData = body.initData;
        } catch {
          // Body parsing failed or not JSON, continue
        }
      }

      // In development mode, use "dev" bypass if no initData provided
      if (isDevelopment && !initData) {
        initData = 'dev';
      }

      // Validate initData (use dummy token in dev if not provided)
      const validationResult = validateInitDataWithDevBypass(
        initData,
        botToken || 'dev'
      );

      if (!validationResult.valid) {
        return NextResponse.json(
          {
            error: 'Unauthorized',
            message: validationResult.error || 'Invalid Telegram authentication',
          },
          { status: 401 }
        );
      }

      // Attach user info to request
      const authReq = req as TelegramAuthRequest;
      authReq.telegramUserId = validationResult.userId;
      authReq.telegramUser = validationResult.user;

      // Set Sentry user context for server-side tracking
      if (validationResult.user) {
        const user = validationResult.user;
        Sentry.setUser({
          id: user.id.toString(),
          username: user.username || `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`,
        });

        Sentry.setTag('telegram_user_id', user.id.toString());
        Sentry.setTag('telegram_language', user.language_code || 'unknown');

        if (user.is_premium) {
          Sentry.setTag('telegram_premium', 'true');
        }
      }

      // Call the actual handler with context (for dynamic routes)
      return await handler(authReq, context);
    } catch (error) {
      console.error('Telegram auth middleware error:', error);
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: 'Authentication failed',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Simplified middleware that only checks for valid initData
 * and returns user info without requiring a handler
 */
export async function validateTelegramAuth(
  req: NextRequest
): Promise<
  | { valid: true; userId: number; user?: TelegramUser }
  | { valid: false; error: string; status: number }
> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return {
      valid: false,
      error: 'Server configuration error',
      status: 500,
    };
  }

  // Extract initData (same logic as withTelegramAuth)
  let initData: string | undefined;

  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    initData = authHeader.substring(7);
  }

  if (!initData) {
    initData = req.headers.get('x-telegram-init-data') || undefined;
  }

  if (!initData) {
    const { searchParams } = new URL(req.url);
    initData = searchParams.get('initData') || undefined;
  }

  const validationResult = validateInitDataWithDevBypass(initData, botToken);

  if (!validationResult.valid) {
    return {
      valid: false,
      error: validationResult.error || 'Invalid authentication',
      status: 401,
    };
  }

  return {
    valid: true,
    userId: validationResult.userId!,
    user: validationResult.user,
  };
}
