import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Copy, ImagePlus, X, Layers } from "lucide-react";

import { createProductsBulkFn } from "@/lib/functions/products";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Availability } from "@/lib/products";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DropItem {
  key: string;
  id: string;
  idTouched: boolean;
  title: string;
  brand: string;
  era: string;
  price: string;
  size: string;
  availability: Availability;
  images: string[];
  uploading: boolean;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function newItem(defaults: Partial<DropItem> = {}): DropItem {
  return {
    key: Math.random().toString(36).slice(2),
    id: "",
    idTouched: false,
    title: "",
    brand: defaults.brand ?? "",
    era: defaults.era ?? "",
    price: defaults.price ?? "",
    size: defaults.size ?? "",
    availability: defaults.availability ?? "available",
    images: [],
    uploading: false,
  };
}

export function BulkDropDialog({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onDone: () => void | Promise<void>;
}) {
  const [defaults, setDefaults] = useState({
    brand: "",
    era: "",
    price: "",
    size: "",
    availability: "available" as Availability,
  });
  const [items, setItems] = useState<DropItem[]>([newItem()]);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setItems([newItem()]);
    setDefaults({ brand: "", era: "", price: "", size: "", availability: "available" });
  };

  const patch = (key: string, p: Partial<DropItem>) =>
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...p } : it)));

  const setTitle = (key: string, title: string) =>
    setItems((prev) =>
      prev.map((it) =>
        it.key === key
          ? { ...it, title, id: it.idTouched ? it.id : slugify(title) }
          : it,
      ),
    );

  const addRow = () => setItems((prev) => [...prev, newItem(defaults)]);

  const duplicateRow = (key: string) =>
    setItems((prev) => {
      const src = prev.find((it) => it.key === key);
      if (!src) return prev;
      const copy: DropItem = {
        ...src,
        key: Math.random().toString(36).slice(2),
        id: "",
        idTouched: false,
        title: `${src.title} copy`.trim(),
      };
      copy.id = slugify(copy.title);
      return [...prev, copy];
    });

  const removeRow = (key: string) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.key !== key) : prev));

  const applyDefaultsToAll = () => {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        brand: defaults.brand || it.brand,
        era: defaults.era || it.era,
        price: defaults.price || it.price,
        size: defaults.size || it.size,
        availability: defaults.availability,
      })),
    );
    toast.success("Applied shared details to all items");
  };

  const onFiles = async (key: string, files: FileList | null) => {
    if (!files?.length) return;
    patch(key, { uploading: true });
    try {
      const urls = await Promise.all(Array.from(files).map((f) => uploadToCloudinary(f)));
      setItems((prev) =>
        prev.map((it) =>
          it.key === key ? { ...it, images: [...it.images, ...urls], uploading: false } : it,
        ),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
      patch(key, { uploading: false });
    }
  };

  const removeImage = (key: string, idx: number) =>
    setItems((prev) =>
      prev.map((it) =>
        it.key === key ? { ...it, images: it.images.filter((_, i) => i !== idx) } : it,
      ),
    );

  const anyUploading = items.some((it) => it.uploading);
  const readyCount = items.filter((it) => it.id && it.title && it.price).length;

  const submit = async () => {
    const invalid = items.find((it) => !it.id || !it.title || !it.price);
    if (invalid) {
      toast.error("Every item needs an ID, title, and price");
      return;
    }
    const ids = items.map((it) => it.id);
    const dup = ids.find((id, i) => ids.indexOf(id) !== i);
    if (dup) {
      toast.error(`Duplicate ID in this drop: "${dup}"`);
      return;
    }

    setSaving(true);
    try {
      const payload = items.map((it) => ({
        id: it.id,
        title: it.title,
        brand: it.brand || "Unbranded",
        era: it.era || "Unknown",
        price: parseInt(it.price, 10),
        size: it.size || "One Size",
        availability: it.availability,
        images: it.images,
        productId: [] as string[],
        measurements: [] as string[],
      }));
      await createProductsBulkFn({ data: { items: payload } });
      toast.success(`Dropped ${payload.length} item${payload.length > 1 ? "s" : ""}`);
      reset();
      onOpenChange(false);
      await onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bulk drop failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-rust" /> Bulk Drop
          </DialogTitle>
          <DialogDescription>
            Add a whole drop at once. Set shared details below, then fine-tune each item —
            every item gets its own set of photos.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-hairline bg-surface p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-grey">
            Shared details (optional)
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <Input
              placeholder="Brand"
              value={defaults.brand}
              onChange={(e) => setDefaults({ ...defaults, brand: e.target.value })}
            />
            <Input
              placeholder="Era"
              value={defaults.era}
              onChange={(e) => setDefaults({ ...defaults, era: e.target.value })}
            />
            <Input
              placeholder="Price (EGP)"
              type="number"
              value={defaults.price}
              onChange={(e) => setDefaults({ ...defaults, price: e.target.value })}
            />
            <Input
              placeholder="Size"
              value={defaults.size}
              onChange={(e) => setDefaults({ ...defaults, size: e.target.value })}
            />
            <Select
              value={defaults.availability}
              onValueChange={(v) => setDefaults({ ...defaults, availability: v as Availability })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="one-left">1 Left</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={applyDefaultsToAll}
            type="button"
          >
            Apply to all items below
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((it, idx) => (
            <div key={it.key} className="rounded-md border border-hairline p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-rust">
                  Item {idx + 1}
                </p>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => duplicateRow(it.key)}
                    title="Duplicate"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => removeRow(it.key)}
                    disabled={items.length === 1}
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Title *</Label>
                  <Input value={it.title} onChange={(e) => setTitle(it.key, e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">ID (slug) *</Label>
                  <Input
                    value={it.id}
                    onChange={(e) => patch(it.key, { id: e.target.value, idTouched: true })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Brand</Label>
                  <Input
                    value={it.brand}
                    onChange={(e) => patch(it.key, { brand: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Price *</Label>
                  <Input
                    type="number"
                    value={it.price}
                    onChange={(e) => patch(it.key, { price: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Size</Label>
                  <Input
                    value={it.size}
                    onChange={(e) => patch(it.key, { size: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {it.images.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="h-14 w-14 rounded object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(it.key, i)}
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-paper"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex h-14 w-14 cursor-pointer items-center justify-center rounded border border-dashed border-hairline text-grey hover:border-rust hover:text-rust">
                  <ImagePlus className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={it.uploading}
                    onChange={(e) => onFiles(it.key, e.target.files)}
                  />
                </label>
                {it.uploading && <span className="text-xs text-grey">Uploading…</span>}
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addRow} type="button" className="mt-1">
          <Plus className="mr-2 h-4 w-4" /> Add another item
        </Button>

        <DialogFooter className="mt-2 items-center gap-3 sm:justify-between">
          <p className="text-xs text-grey">
            {readyCount}/{items.length} item{items.length > 1 ? "s" : ""} ready
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving || anyUploading}>
              {saving ? "Dropping…" : `Drop ${items.length} item${items.length > 1 ? "s" : ""}`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
