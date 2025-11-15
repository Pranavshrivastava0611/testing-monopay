import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMonoPayMiddleware } from "monopay-server-sdk";

const apiKey = process.env.NEXT_PUBLIC_MONOPAY_API_KEY!;
const hostApi = process.env.NEXT_PUBLIC_MONOPAY_HOST_API;

const monoPay = createMonoPayMiddleware(apiKey, hostApi);

export default async function proxy(req: NextRequest) {
  // ---- 1. Handle CORS preflight ----
  if (req.method === "OPTIONS") {
    const res = new NextResponse("OK", { status: 200 });
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "*");
    return res;
  }

  // ---- 2. Forward request to your MonoPay server middleware ----
  const sdkResponse = await monoPay(req);

  // ---- 3. If not 200, return its response (402, 401, 403, 500) ----
  if (sdkResponse.status !== 200) {
    const body = await sdkResponse.text();
    const res = new NextResponse(body, { status: sdkResponse.status });

    // Inject CORS headers here
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "*");

    return res;
  }

  // ---- 4. Allow request to continue ----
  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", "*");
  return res;
}

export const config = {
  matcher: "/:path*",
};
