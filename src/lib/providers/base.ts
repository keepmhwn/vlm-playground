import { VLMProvider } from "@/types";

export abstract class BaseVLMProvider implements VLMProvider {
  abstract name: string;

  abstract extractText(imageData: string): Promise<{
    texts: Array<{
      id: string;
      text: string;
      bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      confidence?: number;
    }>;
    imageWidth: number;
    imageHeight: number;
  }>;
}
