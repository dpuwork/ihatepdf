import { compressGhostscript } from "./pdf-compressor-lossless-engines";

export type CompressionLevel = "extreme" | "recommended" | "print" | "lossless";

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  blob: Blob;
  fileName: string;
}

export interface CompressionOptions {
  level?: CompressionLevel;
  onProgress?: (progress: number, status?: string) => void;
}

function baseNameFor(file: File): string {
  return file.name.replace(/\.pdf$/i, "");
}

export async function compressPDF(
  file: File,
  options: CompressionOptions,
): Promise<CompressionResult> {
  const { onProgress } = options;
  const originalSize = file.size;
  const baseName = baseNameFor(file);
  const level = options.level || "lossless";

  onProgress?.(10, "Preparing compression engine...");

  try {
    const blob = await compressGhostscript(file, level);
    onProgress?.(100, "Compression complete");

    return {
      originalSize,
      compressedSize: blob.size,
      blob,
      fileName: `${baseName}_compressed.pdf`,
    };
  } catch (error) {
    const msg =
      error instanceof Error && error.message ? error.message : "Unknown compression error";
    throw new Error(`Ghostscript failed: ${msg}`);
  }
}

export { downloadBlob, formatBytes } from "./shared";

export function getCompressionPercent(original: number, compressed: number): number {
  if (original === 0) return 0;
  return Math.round(((original - compressed) / original) * 100);
}
