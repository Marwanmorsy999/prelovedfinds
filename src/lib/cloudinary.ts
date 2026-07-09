// Cloudinary public config — safe to expose client-side (not secrets).
// These match wrangler.jsonc vars: CLOUDINARY_CLOUD_NAME / CLOUDINARY_UNSIGNED_PRESET
const CLOUD_NAME = "dnggmrgmu";
const UPLOAD_PRESET = "prelovedfinds5";
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

/**
 * Upload a file to Cloudinary.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    let msg = `Cloudinary upload failed (${res.status})`;
    try {
      const err = (await res.json()) as { error?: { message?: string } };
      if (err.error?.message) msg = err.error.message;
    } catch {
      /* ignore parse error */
    }
    throw new Error(msg);
  }

  const data = (await res.json()) as { secure_url?: string; error?: { message?: string } };
  if (!data.secure_url) {
    throw new Error(data.error?.message ?? "Cloudinary returned no URL");
  }
  return data.secure_url;
}

/**
 * Extract the public ID from a Cloudinary URL.
 * Example: https://res.cloudinary.com/dnggmrgmu/image/upload/v1234/my-image.jpg -> my-image
 */
export function getPublicId(url: string): string {
  try {
    const parts = url.split("/");
    const last = parts[parts.length - 1] ?? "";
    return last.replace(/\.[^.]+$/, "").replace(/^v\d+\//, "");
  } catch {
    return url;
  }
}

/**
 * Generate a Cloudinary URL with optimal transformation parameters.
 * Automatically applies f_auto, q_auto, and responsive sizing.
 */
export function cloudinaryUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: "auto:best" | "auto:good" | "auto:eco" | "auto:low";
    format?: "auto" | "webp" | "avif" | "jpg";
    crop?: "fill" | "scale" | "limit" | "pad";
    fetchFormat?: boolean;
  } = {},
): string {
  if (!url.includes("res.cloudinary.com")) return url;

  const {
    width,
    height,
    quality = "auto:good",
    format = "auto",
    crop = "limit",
  } = options;

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`c_${crop}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  const transformStr = transformations.join(",");

  // Insert transformation after /upload/
  return url.replace(
    /(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload)\//,
    `$1/${transformStr}/`,
  );
}

/**
 * Generate a srcSet string for a Cloudinary image at multiple widths.
 */
export function cloudinarySrcSet(
  url: string,
  widths: readonly number[] = [400, 800, 1200],
  format: "auto" | "webp" | "avif" = "auto",
): string {
  return widths
    .map((w) => `${cloudinaryUrl(url, { width: w, format, crop: "limit" })} ${w}w`)
    .join(", ");
}

/**
 * Generate responsive image variants for a Cloudinary URL.
 * Returns an object with src, srcSet, sizes, and webpSrcSet.
 */
export function responsiveImage(url: string, options: { widths?: readonly number[] } = {}) {
  const widths = options.widths ?? [400, 800, 1200];
  return {
    src: cloudinaryUrl(url, { width: widths[0], format: "auto" }),
    srcSet: cloudinarySrcSet(url, widths, "auto"),
    webpSrcSet: cloudinarySrcSet(url, widths, "webp"),
    avifSrcSet: cloudinarySrcSet(url, widths, "avif"),
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  };
}