import { createContext, useContext } from "react";

export const SettingsCtx = createContext<{ whatsapp: string }>({ whatsapp: "" });

export function useSettings() {
  return useContext(SettingsCtx);
}
