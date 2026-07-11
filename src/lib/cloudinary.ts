// Cloudinary public config — safe to expose client-side (not secrets).
// These match wrangler.jsonc vars: CLOUDINARY_CLOUD_NAME / CLOUDINARY_UNSIGNED_PRESET
const CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ??
  (globalThis as any).CLOUDINARY_CLOUD_NAME ??
  "dnggmrgmu";
const UPLOAD_PRESET = "prelovedfinds5";

export const cloudinaryUrl = (publicIdOrUrl: string, transforms = "q_auto,f_auto") => {
  if (!publicIdOrUrl) return "";
  // If it's already a full Cloudinary URL, extract the public ID and rebuild with requested transforms
  if (publicIdOrUrl.startsWith("http")) {
    const match = publicIdOrUrl.match(/\/upload\/(?:[^/]+\/)?(.+)$/);
    if (match) {
      return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${match[1]}`;
    }
    return publicIdOrUrl;
  }
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicIdOrUrl}`;
};

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