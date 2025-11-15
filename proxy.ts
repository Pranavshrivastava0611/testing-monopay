import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {createMonoPayMiddleware} from "monopay-server-sdk"

const apiKey = process.env.NEXT_PUBLIC_MONOPAY_API_KEY;
console.log("apiKey", apiKey)

if (!apiKey) {
  throw new Error('MONOPAY_API_KEY environment variable is not set');
}

const monoPayMiddleware = createMonoPayMiddleware(apiKey,process.env.NEXT_PUBLIC_MONOPAY_HOST_API);
export async function proxy(request: NextRequest) {
  try {
    const response = await monoPayMiddleware(request);
    console.log("respone in the middlware", response)

    // Payment required
    if (response.status === 402) {
      return response;
    }

    // Errors
    if (response.status === 401 || response.status === 403 || response.status === 500) {
      return response;
    }

    // Success - continue to next
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|public).*)'],
};