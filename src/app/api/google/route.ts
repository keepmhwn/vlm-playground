import { NextRequest, NextResponse } from "next/server";

import { GoogleVisionProvider } from "@/lib/providers/google";

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 },
      );
    }

    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!apiKey && !credentials) {
      return NextResponse.json(
        {
          error:
            "Google Cloud credentials not configured. Set GOOGLE_CLOUD_API_KEY or GOOGLE_APPLICATION_CREDENTIALS",
        },
        { status: 500 },
      );
    }

    const provider = new GoogleVisionProvider(apiKey);
    const result = await provider.extractText(imageData);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error extracting text with Google Vision:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to extract text",
      },
      { status: 500 },
    );
  }
}
