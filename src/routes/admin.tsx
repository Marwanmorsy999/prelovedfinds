import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, LogOut, ArrowUpDown } from "lucide-react";

import { getIsAuthed } from "@/lib/auth";
import { logoutFn } from "@/lib/functions/auth";
import {
  listProductsFn,
  dashboardStatsFn,
  createProductFn,
  updateProductFn,
  deleteProductFn,
  toggleSoldFn,
} from "@/lib/functions/products";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Product, Availability } from "@/lib/products";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PER_PAGE = 8;

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const authed = await getIsAuthed();
    if (!authed) throw redirect({ to: "/admin/login" });
    return { authed };
  },
  loader: async () => {
    const [products, stats] = await Promise.all([
      listProductsFn({ data: { page: 1, perPage: PER_PAGE } }),
      dashboardStatsFn(),
    ]);
    return { products, stats };
  },
  component: AdminDashboard,
});

interface FormState {
  id: string;
  title: string;
  brand: string;
  era: string;
  price: string;
  size: string;
  availability: Availability;
  images: string[];
  productId: string;
  measurements: string;
}

const emptyForm: FormState = {
  id: "",
  title: "",
  brand: "",
  era: "",
  price: "",
  size: "",
  availability: "available",
  images: [],
  productId: "",
  measurements: "",
};

function AdminDashboard() {
  const navigate = useNavigate();
  const initial = Route.useLoaderData();
  const [data, setData] = useState(initial.products);
  const [stats, setStats] = useState(initial.stats);
  const [availability, setAvailability] = useState<Availability | "all">("all");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "newest">("newest");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const reload = async () => {
    const [products, s] = await Promise.all([
      listProductsFn({ data: { availability, sort, page, perPage: PER_PAGE } }),
      dashboardStatsFn(),
    ]);
    setData(products);
    setStats(s);
  };

  useEffect(() => {
    setPage(1);
  }, [availability, sort]);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availability, sort, page]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      id: p.id,
      title: p.title,
      brand: p.brand,
      era: p.era,
      price: String(p.price),
      size: p.size,
      availability: p.availability,
      images: p.images,
      productId: p.productId.join("\n"),
      measurements: p.measurements.join("\n"),
    });
    setFormOpen(true);
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map((f) => uploadToCloudinary(f)));
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
      toast.success(`Uploaded ${urls.length} image(s)`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.id || !form.title || !form.price) {
      toast.error("ID, title and price are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        id: form.id,
        title: form.title,
        brand: form.brand,
        era: form.era,
        price: parseInt(form.price, 10),
        size: form.size,
        availability: form.availability,
        images: form.images,
        productId: form.productId
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        measurements: form.measurements
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (editing) {
        await updateProductFn({ data: { id: editing.id, patch: payload } });
        toast.success("Product updated");
      } else {
        await createProductFn({ data: payload });
        toast.success("Product created");
      }
      setFormOpen(false);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProductFn({ data: { id: deleteTarget.id } });
      toast.success("Product deleted");
      setDeleteTarget(null);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const toggle = async (p: Product) => {
    try {
      await toggleSoldFn({ data: { id: p.id } });
      toast.success(p.availability === "sold" ? "Marked available" : "Marked sold");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const logout = async () => {
    try {
      await logoutFn();
    } catch {
      /* ignore */
    }
    navigate({ to: "/admin/login" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <div className="flex items-end justify-between border-b border-hairline pb-6">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-rust">
            Console
          </p>
          <h1 className="mt-2 font-display text-4xl uppercase tracking-tight text-ink md:text-5xl">
            Admin
          </h1>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Available" value={stats.available} />
        <StatCard label="1 Left" value={stats.oneLeft} />
        <StatCard label="Sold" value={stats.sold} />
        <StatCard label="Revenue (EGP)" value={stats.revenue.toLocaleString()} />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Select
          value={availability}
          onValueChange={(v) => setAvailability(v as Availability | "all")}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="one-left">1 Left</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-asc">Price low–high</SelectItem>
            <SelectItem value="price-desc">Price high–low</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-hairline">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Img</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-grey">
                  No products
                </TableCell>
              </TableRow>
            )}
            {data.items.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.images[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-surface" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell className="text-grey">{p.brand}</TableCell>
                <TableCell>{p.price} EGP</TableCell>
                <TableCell>
                  <Badge variant={p.availability === "sold" ? "destructive" : "secondary"}>
                    {p.availability}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-rust text-rust hover:bg-rust hover:text-paper"
                      onClick={() => toggle(p)}
                    >
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      {p.availability === "sold" ? "Available" : "Sold"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(p)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data.totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-9 w-9 border text-xs font-semibold ${n === data.page ? "border-rust bg-rust text-paper" : "border-hairline text-ink hover:border-rust hover:text-rust"}`}
            >
              {n}
            </button>
          ))}
        </nav>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the product details below." : "Fill in the product details."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <Field label="ID (slug)" required>
                <Input
                  value={form.id}
                  disabled={!!editing}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="levis-501-black"
                />
              </Field>
              <Field label="Title" required>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Brand">
                <Input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </Field>
              <Field label="Era">
                <Input
                  value={form.era}
                  onChange={(e) => setForm({ ...form, era: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Price (EGP)" required>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </Field>
              <Field label="Size">
                <Input
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                />
              </Field>
              <Field label="Availability">
                <Select
                  value={form.availability}
                  onValueChange={(v) => setForm({ ...form, availability: v as Availability })}
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
              </Field>
            </div>

            <Field label="Images">
              <div className="flex flex-wrap gap-2">
                {form.images.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="h-16 w-16 rounded object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, images: form.images.filter((_, j) => j !== i) })
                      }
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-paper"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={(e) => onFiles(e.target.files)}
                className="mt-2 block text-xs"
              />
              {uploading && <p className="text-xs text-grey">Uploading…</p>}
            </Field>

            <Field label="Product details (one per line)">
              <Textarea
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                rows={3}
              />
            </Field>

            <Field label="Measurements (one per line)">
              <Textarea
                value={form.measurements}
                onChange={(e) => setForm({ ...form, measurements: e.target.value })}
                rows={3}
              />
            </Field>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes “{deleteTarget?.title}”. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-hairline bg-surface p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-grey">{label}</p>
      <p className="mt-2 font-display text-2xl uppercase text-ink">{value}</p>
    </div>
  );
}
