import { NextRequest, NextResponse } from "next/server";
import compression from "compression";
import { IncomingMessage, ServerResponse } from "http";

/**
 * Compression middleware for Next.js API routes
 * Note: Next.js has built-in compression, but this can be used for custom responses
 */
export function withCompression(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const response = await handler(req);

    // Next.js automatically compresses responses, but we can add headers
    // For API routes that return large JSON responses
    if (response.headers.get("content-type")?.includes("application/json")) {
      const body = await response.text();
      const compressed = await compressText(body);
      
      if (compressed.length < body.length) {
        return new NextResponse(compressed, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            "Content-Encoding": "gzip",
            "Content-Type": "application/json",
            "Content-Length": compressed.length.toString(),
          },
        });
      }
    }

    return response;
  };
}

async function compressText(text: string): Promise<Buffer> {
  const { gzip } = await import("zlib");
  const { promisify } = await import("util");
  const gzipAsync = promisify(gzip);
  return (await gzipAsync(Buffer.from(text))) as Buffer;
}

/**
 * Add compression headers to response
 */
export function addCompressionHeaders(response: NextResponse): NextResponse {
  response.headers.set("Vary", "Accept-Encoding");
  return response;
}

