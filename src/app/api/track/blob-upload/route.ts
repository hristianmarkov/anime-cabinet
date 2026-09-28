import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/schema";
import {
  MAX_TRACK_MESSAGE_IMAGE_BYTES,
  TRACK_MESSAGE_IMAGE_TYPES,
} from "@/lib/trackMessageAttachments";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const match = /^order-messages\/([^/]+)\//.exec(pathname);
        const trackToken = match?.[1];
        if (!trackToken) throw new Error("Invalid upload path");

        const db = getDb();
        const [order] = await db
          .select({ id: orders.id })
          .from(orders)
          .where(eq(orders.trackToken, trackToken))
          .limit(1);
        if (!order) throw new Error("Order not found");

        return {
          allowedContentTypes: [...TRACK_MESSAGE_IMAGE_TYPES],
          maximumSizeInBytes: MAX_TRACK_MESSAGE_IMAGE_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // The URL is validated and attached when the customer sends the message.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 }
    );
  }
}
