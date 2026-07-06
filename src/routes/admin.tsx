import {
  createFileRoute,
  redirect,
  useNavigate,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  ArrowUpDown,
  Layers,
  Search,
  Eye,
  EyeOff,
} from "lucide-react";

import { getIsAuthed } from "@/lib/auth";
import { logoutFn } from "@/lib/functions/auth";
import {
  listProductsFn,
  dashboardStatsFn,
  createProductFn,
  updateProductFn,
  deleteProductFn,
  toggleSoldFn,
  searchProductsFn,
} from "@/lib/functions/products";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Product, Availability } from "@/lib/products";
import type { DashboardStats } from "@/lib/products.server";
import { BulkDropDialog } from "@/components/admin/BulkDropDialog";
import { AdvancedSettingsPanel } from "@/components/admin/AdvancedSettingsPanel";

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
  beforeLoad: async ({ location }) => {
    const authed = await getIsAuthed();
    if (!authed && location.pathname !== "/admin/login") {
      throw redirect({ to: "/admin/login" });
    }
    return { authed };
  },
  loader: async ({ location }) => {
    if (location.pathname === "/admin/login") {
      return {
        products: { items: [], total: 0, page: 1, perPage: PER_PAGE, totalPages: 1 },
        stats: {
          total: 0,
          available: 0,
          sold: 0,
          oneLeft: 0,
          revenue: 0,
          topBrands: [],
          recentRevenue: 0,
          averagePrice: 0,
        },
      };
    }
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const initial = Route.useLoaderData();
  const [data, setData] = useState(initial.products);
  const [stats, setStats] = useState(initial.stats);
  const [availability, setAvailability] = useState<Availability | "all">("all");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "newest">("newest");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE);

  const [formOpen, setFormOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  const reload = async () => {
    const [products, s] = await Promise.all([
      listProductsFn({ data: { availability, sort, page, perPage } }),
      dashboardStatsFn(),
    ]);
    setData(products);
    setStats(s);
    setSearchActive(false);
    setSearchQuery("");
  };

  useEffect(() => {
    setPage(1);
  }, [availability, sort, perPage]);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availability, sort, page, perPage]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchActive(false);
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchProductsFn({ data: { query: searchQuery.trim() } });
        setSearchResults(results);
        setSearchActive(true);
      } catch {
        toast.error("Search failed");
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // /admin/login is a child route; render only its outlet (the login form)
  // without the dashboard chrome when on that path.
  if (pathname === "/admin/login") return <Outlet />;

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

  // Determine which products to show
  const displayedProducts = searchActive ? searchResults : data.items;
  const totalCount = searchActive ? searchResults.length : data.total;

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

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-6">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Available" value={stats.available} />
        <StatCard label="1 Left" value={stats.oneLeft} />
        <StatCard label="Sold" value={stats.sold} />
        <StatCard label="Revenue (EGP)" value={stats.revenue.toLocaleString()} />
        <StatCard label="Avg Price" value={`${stats.averagePrice} EGP`} />
      </div>

      {/* Secondary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="30d Revenue" value={`${stats.recentRevenue.toLocaleString()} EGP`} />
        {stats.topBrands.slice(0, 3).map((b) => (
          <StatCard key={b.brand} label={`Top: ${b.brand}`} value={b.count} />
        ))}
      </div>

      {/* Controls */}
      <div className="mt-10 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="pl-9"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-grey border-t-transparent" />
            </div>
          )}
        </div>

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

        {searchActive && (
          <Badge variant="secondary" className="text-xs">
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
          </Badge>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <AdvancedSettingsPanel
            perPage={perPage}
            onPerPageChange={setPerPage}
            onDataChanged={reload}
          />
          <Button
            variant="outline"
            className="border-rust text-rust hover:bg-rust hover:text-paper"
            onClick={() => setBulkOpen(true)}
          >
            <Layers className="mr-2 h-4 w-4" /> Bulk Drop
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="mt-6 rounded-md border border-hairline">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Img</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Era</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-grey">
                  {searchActive ? "No results found" : "No products"}
                </TableCell>
              </TableRow>
            )}
            {displayedProducts.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.images[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-surface" />
                  )}
                </TableCell>
                <TableCell className="max-w-[180px] truncate font-medium" title={p.title}>
                  {p.title}
                </TableCell>
                <TableCell className="text-grey">{p.brand}</TableCell>
                <TableCell className="text-xs text-grey">{p.era}</TableCell>
                <TableCell className="text-xs text-grey">{p.size}</TableCell>
                <TableCell className="font-mono text-xs">{p.price} EGP</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      p.availability === "sold"
                        ? "destructive"
                        : p.availability === "one-left"
                          ? "default"
                          : "secondary"
                    }
                  >
                    <div className="flex items-center gap-1">
                      {p.availability === "sold" ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                      {p.availability === "one-left" ? "1 Left" : p.availability}
                    </div>
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-rust text-rust hover:bg-rust hover:text-paper"
                      onClick={() => toggle(p)}
                      title={p.availability === "sold" ? "Mark available" : "Mark sold"}
                    >
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)} title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteTarget(p)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!searchActive && data.totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="h-9 border border-hairline px-3 text-xs font-semibold text-ink hover:border-rust hover:text-rust disabled:opacity-30"
          >
            ← Prev
          </button>
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-9 w-9 border text-xs font-semibold ${n === data.page ? "border-rust bg-rust text-paper" : "border-hairline text-ink hover:border-rust hover:text-rust"}`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(data.totalPages, page + 1))}
            disabled={page >= data.totalPages}
            className="h-9 border border-hairline px-3 text-xs font-semibold text-ink hover:border-rust hover:text-rust disabled:opacity-30"
          >
            Next →
          </button>
        </nav>
      )}

      {/* Create/Edit Dialog */}
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes &ldquo;{deleteTarget?.title}&rdquo;. This cannot be undone.
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

      <BulkDropDialog open={bulkOpen} onOpenChange={setBulkOpen} onDone={reload} />
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
