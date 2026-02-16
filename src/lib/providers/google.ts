import type { TextExtractionResult } from "@/types";

import { BaseVLMProvider } from "./base";
import { ImageAnnotatorClient } from "@google-cloud/vision";

export class GoogleVisionProvider extends BaseVLMProvider {
  name = "Google Cloud Vision";
  private client: ImageAnnotatorClient;

  constructor(apiKey?: string) {
    super();

    if (apiKey) {
      this.client = new ImageAnnotatorClient({
        apiKey: apiKey,
      });
    } else {
      this.client = new ImageAnnotatorClient();
    }
  }

  async extractText(imageData: string): Promise<TextExtractionResult> {
    try {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");

      const [result] = await this.client.textDetection({
        image: { content: imageBuffer },
      });

      const detections = result.textAnnotations;

      if (!detections || detections.length === 0) {
        return {
          texts: [],
          imageWidth: 0,
          imageHeight: 0,
        };
      }

      const textAnnotations = detections.slice(1);

      const fullTextAnnotation = result.fullTextAnnotation;
      let imageWidth = 0;
      let imageHeight = 0;

      if (fullTextAnnotation?.pages && fullTextAnnotation.pages.length > 0) {
        const page = fullTextAnnotation.pages[0];
        imageWidth = page.width || 0;
        imageHeight = page.height || 0;
      }

      if (imageWidth === 0 || imageHeight === 0) {
        detections.forEach((annotation) => {
          const vertices = annotation.boundingPoly?.vertices || [];
          vertices.forEach((vertex) => {
            if (vertex.x && vertex.x > imageWidth) imageWidth = vertex.x;
            if (vertex.y && vertex.y > imageHeight) imageHeight = vertex.y;
          });
        });
      }

      const texts = textAnnotations.map((annotation, index) => {
        const vertices = annotation.boundingPoly?.vertices || [];

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        vertices.forEach((vertex) => {
          const x = vertex.x || 0;
          const y = vertex.y || 0;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        });

        const bbox = {
          x: minX !== Infinity ? minX : 0,
          y: minY !== Infinity ? minY : 0,
          width: maxX !== -Infinity && minX !== Infinity ? maxX - minX : 0,
          height: maxY !== -Infinity && minY !== Infinity ? maxY - minY : 0,
        };

        const polygon = {
          vertices: vertices.map((vertex) => ({
            x: vertex.x || 0,
            y: vertex.y || 0,
          })),
        };

        return {
          id: `text-${index}`,
          text: annotation.description || "",
          bbox,
          confidence: annotation.confidence ?? undefined,
          polygon,
        };
      });

      return {
        texts,
        imageWidth,
        imageHeight,
      };
    } catch (error) {
      console.error("Google Vision API error:", error);
      throw new Error(
        `Failed to extract text: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
