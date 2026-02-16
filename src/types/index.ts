export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Polygon {
  vertices: Point[];
}

export interface ExtractedText {
  id: string;
  text: string;
  bbox: BoundingBox;
  confidence?: number;
  polygon?: Polygon;
}

export interface TextExtractionResult {
  texts: ExtractedText[];
  imageWidth: number;
  imageHeight: number;
}

export interface VLMProvider {
  name: string;
  extractText(imageData: string): Promise<TextExtractionResult>;
}

export interface ImageDimensions {
  naturalWidth: number;
  naturalHeight: number;
  displayWidth: number;
  displayHeight: number;
}
