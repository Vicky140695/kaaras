/**
 * Browser-side photo handling for the admin dashboard.
 *
 * Phone photos are often 4–12 MB. Before uploading, every photo is resized
 * (longest side ≤ 1800px) and re-encoded as WebP/JPEG, so the public site
 * stays fast and the owner never has to edit or compress anything.
 */
import { supabase } from "@/integrations/supabase/client";

const MAX_INPUT_BYTES = 30 * 1024 * 1024;

type Decoded = {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
};

async function decode(file: File): Promise<Decoded> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      // fall through to the <img> decoder
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch {
    URL.revokeObjectURL(url);
    throw new Error("Could not read this photo. Please choose a JPG, PNG or WebP image.");
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export type OptimizedImage = { blob: Blob; ext: "webp" | "jpg"; type: string };

export async function optimizeImage(file: File, maxDimension = 1800): Promise<OptimizedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a photo (JPG, PNG or WebP).");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("That photo is too large. Please choose one under 30 MB.");
  }

  const decoded = await decode(file);
  try {
    const scale = Math.min(1, maxDimension / Math.max(decoded.width, decoded.height));
    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser could not process this photo.");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(decoded.source, 0, 0, width, height);

    const webp = await canvasToBlob(canvas, "image/webp", 0.86);
    if (webp && webp.type === "image/webp") {
      return { blob: webp, ext: "webp", type: "image/webp" };
    }
    const jpeg = await canvasToBlob(canvas, "image/jpeg", 0.88);
    if (jpeg) return { blob: jpeg, ext: "jpg", type: "image/jpeg" };
    throw new Error("Could not prepare this photo for upload.");
  } finally {
    decoded.release();
  }
}

/** Resize + upload a photo. Returns the storage path to save in the database. */
export async function uploadImage(bucket: string, folder: string, file: File): Promise<string> {
  const { blob, ext, type } = await optimizeImage(file);
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

/** Best-effort delete of an uploaded photo. Never throws. */
export async function removeImage(bucket: string, path: string | null | undefined) {
  if (!path || path.startsWith("http")) return;
  try {
    await supabase.storage.from(bucket).remove([path]);
  } catch {
    // orphaned file is harmless
  }
}

export function publicImageUrl(bucket: string, path: string): string {
  if (path.startsWith("http")) return path;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
