interface AppEnv {
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_UNSIGNED_PRESET?: string;
  COOKIE_SECURE?: string;
}

declare global {
  // Set by Nitro v3 cloudflare-module preset inside the Worker fetch.
  var __env__: AppEnv | undefined;
}

function resolveEnv(): AppEnv {
  if (globalThis.__env__) return globalThis.__env__;
  return {
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    SESSION_SECRET: process.env.SESSION_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UNSIGNED_PRESET: process.env.CLOUDINARY_UNSIGNED_PRESET,
    COOKIE_SECURE: process.env.COOKIE_SECURE,
  };
}

export function getEnv(): AppEnv {
  return resolveEnv();
}