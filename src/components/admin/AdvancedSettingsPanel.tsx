import { useState } from "react";
import { toast } from "sonner";
import { Settings2, Download, AlertTriangle } from "lucide-react";

import { listProductsFn, deleteSoldProductsFn } from "@/lib/functions/products";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

export function AdvancedSettingsPanel({
  perPage,
  onPerPageChange,
  onDataChanged,
}: {
  perPage: number;
  onPerPageChange: (n: number) => void;
  onDataChanged: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all = await listProductsFn({ data: { page: 1, perPage: 10000 } });
      const rows = all.items.map((p) => ({
        id: p.id,
        title: p.title,
        brand: p.brand,
        era: p.era,
        price: p.price,
        currency: p.currency,
        availability: p.availability,
        size: p.size,
        images: p.images.join(" | "),
      }));
      const csv = toCsv(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `preloved-finds-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${rows.length} products`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const clearSold = async () => {
    setClearing(true);
    try {
      const removed = await deleteSoldProductsFn();
      toast.success(`Cleared ${removed} sold item${removed === 1 ? "" : "s"}`);
      await onDataChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Clear failed");
    } finally {
      setClearing(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Settings2 className="mr-2 h-4 w-4" /> Advanced
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display uppercase tracking-tight">
            Advanced Settings
          </SheetTitle>
          <SheetDescription>Dashboard preferences and inventory maintenance.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-8 px-4 pb-6">
          <section className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-grey">
              Display
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs">Rows per page</Label>
              <Select value={String(perPage)} onValueChange={(v) => onPerPageChange(Number(v))}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-grey">
              Data
            </p>
            <Button variant="outline" className="w-full justify-start" onClick={exportCsv} disabled={exporting}>
              <Download className="mr-2 h-4 w-4" />
              {exporting ? "Exporting…" : "Export inventory as CSV"}
            </Button>
          </section>

          <section className="space-y-2 border-t border-hairline pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-destructive">
              Danger zone
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Clear all sold items
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all sold items?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Permanently deletes every product marked "sold" to tidy the catalog. Your
                    revenue total is calculated from sold items, so it will drop to zero after
                    this. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearSold}
                    disabled={clearing}
                    className="bg-destructive text-destructive-foreground"
                  >
                    {clearing ? "Clearing…" : "Clear sold items"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
