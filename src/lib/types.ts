export type ImageFormat = "png" | "jpeg" | "webp" | "avif";

export type AppSettings = {
  format: ImageFormat;
  quality: number;
  captureIframes: boolean;
  includeBrowserBar: boolean;
  includeUrlBar: boolean;
  autoDownload: boolean;
  saveAsDialog: boolean;
  downloadDirectory: string;
  filenameTemplate: string;
  maxWidth: number;
  maxHeight: number;
  scalePercent: number;
  maxFileMB: number;
};

export type CaptureRecord = {
  id: string;
  createdAt: number;
  title: string;
  url: string;
  dataUrl: string;
  width: number;
  height: number;
  format: ImageFormat;
  thumbUrl?: string;
  byteSize?: number;
  edited?: boolean;
};

export type Point = { x: number; y: number };

export type Tool =
  | "select"
  | "crop"
  | "pen"
  | "highlight"
  | "rect"
  | "ellipse"
  | "arrow"
  | "line"
  | "text"
  | "emoji"
  | "image"
  | "blur";

export type AnnotationBase = {
  id: string;
  color: string;
  strokeWidth: number;
};

export type StrokeAnn = AnnotationBase & {
  type: "pen" | "highlight";
  points: Point[];
};

export type ShapeAnn = AnnotationBase & {
  type: "rect" | "ellipse" | "arrow" | "line" | "blur";
  x: number;
  y: number;
  w: number;
  h: number;
  filled?: boolean;
};

export type TextAnn = AnnotationBase & {
  type: "text";
  x: number;
  y: number;
  w: number;
  fontSize: number;
  text: string;
};

export type StampAnn = AnnotationBase & {
  type: "emoji";
  x: number;
  y: number;
  size: number;
  emoji: string;
};

export type ImageAnn = AnnotationBase & {
  type: "image";
  x: number;
  y: number;
  w: number;
  h: number;
  src: string;
};

export type Annotation = StrokeAnn | ShapeAnn | TextAnn | StampAnn | ImageAnn;

export type CropRect = { x: number; y: number; w: number; h: number };
