import { cloudinaryConfig } from "./db";

export async function uploadToCloudinary(file: File): Promise<string> {
  const { cloudName, preset } = cloudinaryConfig();
  if (!cloudName || !preset) {
    throw new Error(
      "Cloudinary is not configured (missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_UNSIGNED_PRESET).",
    );
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Cloudinary upload failed (${res.status})`);
  }

  const data = (await res.json()) as { secure_url?: string; error?: { message?: string } };
  if (!data.secure_url) {
    throw new Error(data.error?.message ?? "Cloudinary upload returned no URL");
  }
  return data.secure_url;
}
