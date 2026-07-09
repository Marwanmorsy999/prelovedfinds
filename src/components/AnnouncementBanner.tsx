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

export function AnnouncementBanner({ announcement, onDismiss }: { announcement: string; onDismiss?: () => void }) {
  const [dismissed, setDismissed] = useState(false);

  // Sync internal state with sessionStorage on mount and when announcement changes
  useEffect(() => {
    if (!announcement) {
      setDismissed(false);
      return;
    }
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
    onDismiss?.();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[51] bg-ink text-paper">
      <div className="mx-auto max-w-7xl flex items-center justify-center gap-3 px-4 py-2">
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
