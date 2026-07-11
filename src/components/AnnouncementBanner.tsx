import { useState, useEffect } from "react";
import { X } from "lucide-react";

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return String(Math.abs(h));
}

export function AnnouncementBanner({ announcement }: { announcement: string }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const key = `dismissed-announcement-${simpleHash(announcement)}`;
    try {
      const stored = sessionStorage.getItem(key);
      if (stored === "1") {
        setDismissed(true);
      }
    } catch {
      // ignore
    }
  }, [announcement]);

  if (!announcement || dismissed) return null;

  const handleDismiss = () => {
    const key = `dismissed-announcement-${simpleHash(announcement)}`;
    try {
      sessionStorage.setItem(key, "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[110] bg-ink text-paper h-10 flex items-center">
      <div className="mx-auto max-w-7xl flex items-center justify-center gap-3 px-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-center">
          {announcement}
        </p>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="flex-shrink-0 text-paper/70 hover:text-paper transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}