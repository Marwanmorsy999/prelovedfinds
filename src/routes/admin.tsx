import {
  createFileRoute,
  redirect,
  useNavigate,
  Outlet,
  useRouterState,
  Link,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Trash2, LogOut, Search, X, Plus, ImagePlus, ChevronDown, Eye } from "lucide-react";

import { getIsAuthed } from "@/lib/auth";
import { logoutFn } from "@/lib/functions/auth";
import {
  listProductsFn,
  dashboardStatsFn,
  createProductFn,
  createProductsBulkFn,
  updateProductFn,
  deleteProductFn,
  toggleSoldFn,
  searchProductsFn,
  getDistinctTagsFn,
  getDistinctSizesFn,
  getDistinctConditionsFn,
} from "@/lib/functions/products";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Product, Availability, Order } from "@/lib/products";
import {
  listOrdersFn,
  getOrderFn,
  updateOrderStatusFn,
  deleteOrderFn,
  getOrderStatsFn,
} from "@/lib/functions/orders";
import { getSettingFn, setSettingFn } from "@/lib/functions/settings";
import { listCategoriesFn, createCategoryFn, deleteCategoryFn } from "@/lib/functions/categories";
import type { Category } from "@/lib/categories.server";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const PER_PAGE = 24;
const CONDITIONS = ["Excellent", "Good", "Fair"];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "" }],
  }),
  errorComponent: AdminErrorComponent,
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
          avgOrderValue: 0,
          avgOrderCount: 0,
          topTags: [],
        },
        orderStats: {
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          revenue: 0,
          ordersCount: 0,
        },
        tags: [],
        sizes: [],
        conditions: [],
        dbCategories: [],
      };
    }
    try {
      const s = location.search as {
        tag?: string;
        size?: string;
        condition?: string;
        availability?: string;
      };
      const [products, stats, orderStats, tags, sizes, conditions, dbCategories] =
        await Promise.all([
          listProductsFn({
            data: {
              tag: s.tag === "all" ? undefined : (s.tag as never),
              size: s.size === "all" ? undefined : s.size,
              condition: s.condition === "all" ? undefined : (s.condition as never),
              availability: s.availability === "all" ? undefined : (s.availability as never),
              page: 1,
              perPage: PER_PAGE,
            },
          }),
          dashboardStatsFn(),
          getOrderStatsFn(),
          getDistinctTagsFn(),
          getDistinctSizesFn(),
          getDistinctConditionsFn(),
          listCategoriesFn(),
        ]);
      return { products, stats, orderStats, categories: tags, sizes, conditions, dbCategories };
    } catch (err) {
      console.error("[admin/loader] failed to load dashboard data:", err);
      throw err;
    }
  },
  component: AdminDashboard,
});

function AdminErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-[18px] font-semibold text-[#1a1a1a]">Couldn't load admin data</h1>
        {import.meta.env?.DEV && (
          <pre className="mt-4 text-left text-[12px] text-red-600 bg-[#111] p-4 overflow-auto max-h-64">
            {error.message}
            {"\n\n"}
            {error.stack}
          </pre>
        )}
        <p className="mt-2 text-[13px] text-[#6b7280]">
          {import.meta.env?.DEV
            ? "Check the server logs for details."
            : "Something went wrong on our end — check the server logs (console) and try again later."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={reset}
            className="border border-ink bg-ink px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-background hover:opacity-80"
          >
            Try again
          </button>
          <Link
            to="/"
            className="border border-ink px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink hover:bg-ink hover:text-background"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface SingleForm {
  title: string;
  size: string;
  price: string;
  category: string;
  condition: string;
  description: string;
  images: string[];
  uploading: boolean;
  newCategoryName: string;
}

const emptySingle: SingleForm = {
  title: "",
  size: "",
  price: "",
  category: "",
  condition: "Good",
  description: "",
  images: [],
  uploading: false,
  newCategoryName: "",
};

interface BulkRow {
  key: string;
  title: string;
  size: string;
  price: string;
  category: string;
  condition: string;
  description: string;
  images: string[];
  uploading: boolean;
  newCategoryName: string;
}

function newRow(): BulkRow {
  return {
    key: Math.random().toString(36).slice(2),
    title: "",
    size: "",
    price: "",
    category: "",
    condition: "Good",
    description: "",
    images: [],
    uploading: false,
    newCategoryName: "",
  };
}

function AdminDashboard() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search });
  const initial = Route.useLoaderData();
  const [data, setData] = useState(initial.products);
  const [stats, setStats] = useState(initial.stats);
  const [categories, setCategories] = useState(initial.categories);
  const [dbCategories, setDbCategories] = useState<Category[]>(initial.dbCategories);
  const [sizes, setSizes] = useState(initial.sizes);
  const [conditions, setConditions] = useState(initial.conditions);
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "settings">("products");
  const [addMode, setAddMode] = useState<"single" | "bulk">("single");
  const [single, setSingle] = useState<SingleForm>(emptySingle);
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([newRow()]);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchActive, setSearchActive] = useState(false);
  const [searching, setSearching] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [orderStats, setOrderStats] = useState(initial.orderStats);
  const [reorderMode, setReorderMode] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());

  // orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [orderSort, setOrderSort] = useState<string>("newest");
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderStatusSaving, setOrderStatusSaving] = useState(false);

  // settings state
  const [announcement, setAnnouncement] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryLabel, setNewCategoryLabel] = useState("");

  // Load settings once when the settings tab opens for the first time.
  const settingsLoadedRef = useRef(false);
  useEffect(() => {
    if (settingsLoadedRef.current) return;
    if (activeTab !== "settings") return;
    settingsLoadedRef.current = true;
    (async () => {
      try {
        const [ann, wa] = await Promise.all([
          getSettingFn({ data: { key: "announcement" } }),
          getSettingFn({ data: { key: "whatsapp" } }),
        ]);
        setAnnouncement(ann);
        setWhatsapp(wa);
      } catch {
        // ignore — defaults remain
      }
    })();
  }, [activeTab]);

  if (pathname === "/admin/login") return <Outlet />;

  const reload = async () => {
    const s = typeof search === "string" ? new URLSearchParams(search) : new URLSearchParams();
    const [products, stats, orderStats, tags, sizes, conditions, dbCategories, ordersRes] =
      await Promise.all([
        listProductsFn({
          data: {
            tag: (s.get("tag") || "all") === "all" ? undefined : (s.get("tag") as never),
            size: (s.get("size") || "all") === "all" ? undefined : (s.get("size") ?? undefined),
            condition:
              (s.get("condition") || "all") === "all" ? undefined : (s.get("condition") as never),
            availability:
              (s.get("availability") || "all") === "all"
                ? undefined
                : (s.get("availability") as never),
            page: 1,
            perPage: PER_PAGE,
          },
        }),
        dashboardStatsFn(),
        getOrderStatsFn(),
        getDistinctTagsFn(),
        getDistinctSizesFn(),
        getDistinctConditionsFn(),
        listCategoriesFn(),
        listOrdersFn({
          data: {
            status:
              orderStatusFilter === "all"
                ? undefined
                : (orderStatusFilter as "pending" | "confirmed" | "completed" | "cancelled"),
            q: orderSearch.trim() || undefined,
            sort: orderSort as "newest" | "oldest" | "total-asc" | "total-desc",
          },
        }),
      ]);
    setData(products);
    setStats(stats);
    setOrderStats(orderStats);
    setSearchActive(false);
    setSearchQuery("");
    setCategories(tags);
    setDbCategories(dbCategories);
    setSizes(sizes);
    setConditions(conditions);
    setBulkSelected(new Set());
    setOrders(ordersRes);
    setOrderPage(1);
    setOrderTotalPages(Math.max(1, Math.ceil(ordersRes.length / PER_PAGE)));
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchActive(false);
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await searchProductsFn({ data: { query: searchQuery.trim() } });
        setSearchResults(r);
        setSearchActive(true);
      } catch {
        toast.error("Search failed");
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const logout = async () => {
    try {
      await logoutFn();
    } catch {
      /* ignore */
    }
    navigate({ to: "/admin/login" });
  };

  const uploadFiles = async (files: FileList | null): Promise<string[]> => {
    if (!files?.length) return [];
    return Promise.all(Array.from(files).map((f) => uploadToCloudinary(f)));
  };

  const getCategoryOptions = () => {
    // Merge DB categories with tags from products
    const dbNames = new Set(dbCategories.map((c) => c.name));
    const tags = categories ?? [];
    const allNames = new Set([...dbNames, ...tags]);
    return Array.from(allNames).sort();
  };

  const ensureCategory = async (name: string): Promise<string> => {
    if (!name) return "";
    const exists = dbCategories.find((c) => c.name === name);
    if (exists) return name;
    // Create the category in DB
    try {
      await createCategoryFn({ data: { name, label: name } });
      await reload();
      return name;
    } catch {
      return name; // still use it even if creation fails
    }
  };

  const submitSingle = async () => {
    if (!single.title || !single.price) {
      toast.error("Name and price are required");
      return;
    }
    let category = single.category;
    if (!category && single.newCategoryName.trim()) {
      category = slugify(single.newCategoryName.trim());
      await ensureCategory(category);
    }
    if (!category) {
      toast.error("Please select or create a category");
      return;
    }
    setSaving(true);
    try {
      const id = slugify(single.title) || `product-${Date.now()}`;
      await createProductFn({
        data: {
          id,
          title: single.title,
          tag: category,
          condition: single.condition,
          description: single.description,
          price: parseInt(single.price, 10),
          size: single.size || "One Size",
          availability: "available",
          images: single.images,
        },
      });
      toast.success("Product added");
      setSingle(emptySingle);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const submitBulk = async () => {
    const ready = bulkRows.filter((r) => r.title && r.price);
    if (!ready.length) {
      toast.error("Add at least one item with name and price");
      return;
    }
    // Ensure all categories exist
    for (const row of ready) {
      let category = row.category;
      if (!category && row.newCategoryName.trim()) {
        category = slugify(row.newCategoryName.trim());
        await ensureCategory(category);
      }
    }
    setSaving(true);
    try {
      await createProductsBulkFn({
        data: {
          items: ready.map((r) => {
            let cat = r.category;
            if (!cat && r.newCategoryName.trim()) {
              cat = slugify(r.newCategoryName.trim());
            }
            return {
              id: slugify(r.title) + "-" + Math.random().toString(36).slice(2, 6),
              title: r.title,
              tag: cat || "OTHER",
              condition: r.condition,
              description: r.description,
              price: parseInt(r.price, 10),
              size: r.size || "One Size",
              availability: "available" as Availability,
              images: r.images,
            };
          }),
        },
      });
      toast.success(`Published ${ready.length} item${ready.length > 1 ? "s" : ""}`);
      setBulkRows([newRow()]);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (p: Product) => {
    try {
      await toggleSoldFn({ data: { id: p.id } });
      toast.success(p.availability === "sold" ? "Marked available" : "Marked sold");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const confirmDelete = async (p: Product) => {
    try {
      await deleteProductFn({ data: { id: p.id } });
      toast.success("Deleted");
      setDeleteTarget(null);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const bulkSold = async () => {
    const available = data.items.filter((p) => p.availability !== "sold");
    for (const p of available) {
      try {
        await toggleSoldFn({ data: { id: p.id } });
      } catch {
        /* skip */
      }
    }
    toast.success(`Marked ${available.length} items sold`);
    await reload();
  };

  const handleCreateCategory = async () => {
    const name = slugify(newCategoryName.trim());
    const label = newCategoryLabel.trim() || newCategoryName.trim();
    if (!name) {
      toast.error("Category name is required");
      return;
    }
    try {
      await createCategoryFn({ data: { name, label } });
      toast.success(`Category "${label}" created`);
      setNewCategoryName("");
      setNewCategoryLabel("");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const handleDeleteCategory = async (name: string) => {
    try {
      await deleteCategoryFn({ data: { name } });
      toast.success("Category deleted");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const handleOrderStatusUpdate = async (id: string, status: Order["status"]) => {
    if (orderStatusSaving) return;
    setOrderStatusSaving(true);
    try {
      await updateOrderStatusFn({ data: { id, status } });
      toast.success("Order updated");
      setSelectedOrder(null);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update order");
    } finally {
      setOrderStatusSaving(false);
    }
  };

  const confirmDeleteOrder = async (o: Order) => {
    try {
      await deleteOrderFn({ data: { id: o.id } });
      toast.success("Order deleted");
      setOrderToDelete(null);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete order");
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await Promise.all([
        setSettingFn({ data: { key: "announcement", value: announcement } }),
        setSettingFn({ data: { key: "whatsapp", value: whatsapp } }),
      ]);
      toast.success("Settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const displayedProducts = searchActive ? searchResults : data.items;
  const availableCount = data.items.filter((p) => p.availability !== "sold").length;
  const readyCount = bulkRows.filter((r) => r.title && r.price).length;
  const categoryOptions = getCategoryOptions();

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
        <span className="font-bold text-[16px] uppercase tracking-widest">Admin</span>
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-[#888]">Preloved Finds</span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-[12px] text-[#888] hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-5 border-b border-[#2a2a2a]">
        {[
          { label: "TOTAL REVENUE", value: `${stats.revenue.toLocaleString()} EGP` },
          {
            label: "AVG ORDER",
            value: `${stats.avgOrderValue.toLocaleString()} EGP (${stats.avgOrderCount})`,
          },
          { label: "AVAILABLE", value: stats.available },
          { label: "SOLD", value: stats.sold },
        ].map((s) => (
          <div key={s.label} className="bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#555] mb-1">
              {s.label}
            </p>
            <p className="text-[22px] font-bold text-white leading-none">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 px-6 border-b border-[#2a2a2a]">
        {(["products", "orders", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-[12px] font-bold uppercase tracking-widest border-b-2 transition-colors ${
              activeTab === tab
                ? "border-white text-white"
                : "border-transparent text-[#555] hover:text-[#aaa]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-6 py-6 max-w-5xl">
        {activeTab === "products" && (
          <>
            {/* Add product panel */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12px] font-bold uppercase tracking-widest text-white">
                  Add Product
                </p>
                <div className="flex gap-1">
                  {(["single", "bulk"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setAddMode(m)}
                      className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest border transition-colors ${
                        addMode === m
                          ? "bg-white text-[#111] border-white"
                          : "bg-transparent text-[#888] border-[#333] hover:border-[#555]"
                      }`}
                    >
                      {m === "single" ? "Single Item" : "Bulk Drop"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Single item form */}
              {addMode === "single" && (
                <div className="space-y-3">
                  <input
                    placeholder="Name *"
                    value={single.title}
                    onChange={(e) => setSingle({ ...single, title: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555] placeholder:text-[#444]"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Size (e.g. L, XL, OS)"
                      value={single.size}
                      onChange={(e) => setSingle({ ...single, size: e.target.value })}
                      className="bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555] placeholder:text-[#444]"
                    />
                    <input
                      placeholder="Price (EGP)"
                      type="number"
                      value={single.price}
                      onChange={(e) => setSingle({ ...single, price: e.target.value })}
                      className="bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555] placeholder:text-[#444]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <select
                        value={single.category}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "__new__") {
                            // User wants to create a new category
                            setSingle({ ...single, category: "" });
                          } else {
                            setSingle({ ...single, category: val, newCategoryName: "" });
                          }
                        }}
                        className="w-full bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555]"
                      >
                        <option value="">Select category…</option>
                        {categoryOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                        <option value="__new__">+ Create new category</option>
                      </select>
                      {/* Show new category input when no category selected */}
                      {!single.category && (
                        <input
                          placeholder="New category name"
                          value={single.newCategoryName}
                          onChange={(e) =>
                            setSingle({ ...single, newCategoryName: e.target.value })
                          }
                          className="w-full mt-2 bg-[#111] border border-[#333] text-white text-[12px] px-3 py-2 outline-none focus:border-[#555] placeholder:text-[#444]"
                        />
                      )}
                    </div>
                    <select
                      value={single.condition}
                      onChange={(e) => setSingle({ ...single, condition: e.target.value })}
                      className="bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555]"
                    >
                      {CONDITIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    placeholder="Description (optional)"
                    value={single.description}
                    onChange={(e) => setSingle({ ...single, description: e.target.value })}
                    rows={2}
                    className="w-full bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555] placeholder:text-[#444] resize-none"
                  />
                  {/* Images */}
                  <div className="flex flex-wrap gap-2 items-center">
                    {single.images.map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} className="h-14 w-14 object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setSingle({
                              ...single,
                              images: single.images.filter((_, j) => j !== i),
                            })
                          }
                          className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <label className="flex items-center gap-2 bg-[#222] border border-[#333] px-3 py-2 text-[12px] text-[#888] hover:border-[#555] cursor-pointer">
                      <ImagePlus className="h-4 w-4" />
                      {single.images.length === 0 ? "Upload main image" : "+ Add extra images"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={single.uploading}
                        onChange={async (e) => {
                          setSingle((s) => ({ ...s, uploading: true }));
                          try {
                            const urls = await uploadFiles(e.target.files);
                            setSingle((s) => ({
                              ...s,
                              images: [...s.images, ...urls],
                              uploading: false,
                            }));
                          } catch {
                            toast.error("Upload failed");
                            setSingle((s) => ({ ...s, uploading: false }));
                          }
                        }}
                      />
                    </label>
                    {single.uploading && (
                      <span className="text-[11px] text-[#888]">Uploading…</span>
                    )}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={submitSingle}
                      disabled={saving}
                      className="bg-white text-[#111] px-5 py-2 text-[12px] font-bold uppercase tracking-widest hover:bg-[#eee] transition-colors disabled:opacity-50"
                    >
                      {saving ? "Adding…" : "+ ADD PRODUCT"}
                    </button>
                  </div>
                </div>
              )}

              {/* Bulk drop form */}
              {addMode === "bulk" && (
                <div className="space-y-2">
                  {bulkRows.map((row, idx) => (
                    <div
                      key={row.key}
                      className="flex flex-wrap items-center gap-2 bg-[#111] border border-[#2a2a2a] p-2"
                    >
                      {/* Image slots */}
                      <div className="flex gap-1">
                        {row.images.slice(0, 2).map((url, i) => (
                          <div key={i} className="relative">
                            <img src={url} className="h-9 w-9 object-cover" />
                            <button
                              type="button"
                              onClick={() =>
                                setBulkRows((prev) =>
                                  prev.map((r) =>
                                    r.key === row.key
                                      ? { ...r, images: r.images.filter((_, j) => j !== i) }
                                      : r,
                                  ),
                                )
                              }
                              className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-3.5 w-3.5 flex items-center justify-center text-[8px]"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {row.images.length < 2 && (
                          <label className="h-9 w-9 flex items-center justify-center bg-[#1a1a1a] border border-[#333] cursor-pointer hover:border-[#555]">
                            <Plus className="h-3.5 w-3.5 text-[#555]" />
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={async (e) => {
                                setBulkRows((prev) =>
                                  prev.map((r) =>
                                    r.key === row.key ? { ...r, uploading: true } : r,
                                  ),
                                );
                                try {
                                  const urls = await uploadFiles(e.target.files);
                                  setBulkRows((prev) =>
                                    prev.map((r) =>
                                      r.key === row.key
                                        ? {
                                            ...r,
                                            images: [...r.images, ...urls].slice(0, 4),
                                            uploading: false,
                                          }
                                        : r,
                                    ),
                                  );
                                } catch {
                                  toast.error("Upload failed");
                                  setBulkRows((prev) =>
                                    prev.map((r) =>
                                      r.key === row.key ? { ...r, uploading: false } : r,
                                    ),
                                  );
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                      <input
                        placeholder="Size"
                        value={row.size}
                        onChange={(e) =>
                          setBulkRows((prev) =>
                            prev.map((r) =>
                              r.key === row.key ? { ...r, size: e.target.value } : r,
                            ),
                          )
                        }
                        className="w-20 bg-[#1a1a1a] border border-[#333] text-white text-[12px] px-2 py-1.5 outline-none focus:border-[#555] placeholder:text-[#444]"
                      />
                      <input
                        placeholder="Price"
                        type="number"
                        value={row.price}
                        onChange={(e) =>
                          setBulkRows((prev) =>
                            prev.map((r) =>
                              r.key === row.key ? { ...r, price: e.target.value } : r,
                            ),
                          )
                        }
                        className="w-24 bg-[#1a1a1a] border border-[#333] text-white text-[12px] px-2 py-1.5 outline-none focus:border-[#555] placeholder:text-[#444]"
                      />
                      <div>
                        <select
                          value={row.category}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "__new__") {
                              setBulkRows((prev) =>
                                prev.map((r) => (r.key === row.key ? { ...r, category: "" } : r)),
                              );
                            } else {
                              setBulkRows((prev) =>
                                prev.map((r) =>
                                  r.key === row.key
                                    ? { ...r, category: val, newCategoryName: "" }
                                    : r,
                                ),
                              );
                            }
                          }}
                          className="bg-[#1a1a1a] border border-[#333] text-white text-[12px] px-2 py-1.5 outline-none focus:border-[#555]"
                        >
                          <option value="">Category…</option>
                          {categoryOptions.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                          <option value="__new__">+ New</option>
                        </select>
                        {!row.category && (
                          <input
                            placeholder="New category"
                            value={row.newCategoryName}
                            onChange={(e) =>
                              setBulkRows((prev) =>
                                prev.map((r) =>
                                  r.key === row.key ? { ...r, newCategoryName: e.target.value } : r,
                                ),
                              )
                            }
                            className="w-full mt-1 bg-[#1a1a1a] border border-[#333] text-white text-[11px] px-2 py-1 outline-none focus:border-[#555] placeholder:text-[#444]"
                          />
                        )}
                      </div>
                      <select
                        value={row.condition}
                        onChange={(e) =>
                          setBulkRows((prev) =>
                            prev.map((r) =>
                              r.key === row.key ? { ...r, condition: e.target.value } : r,
                            ),
                          )
                        }
                        className="bg-[#1a1a1a] border border-[#333] text-white text-[12px] px-2 py-1.5 outline-none focus:border-[#555]"
                      >
                        {CONDITIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <input
                        placeholder="Name *"
                        value={row.title}
                        onChange={(e) =>
                          setBulkRows((prev) =>
                            prev.map((r) =>
                              r.key === row.key ? { ...r, title: e.target.value } : r,
                            ),
                          )
                        }
                        className="flex-1 min-w-[120px] bg-[#1a1a1a] border border-[#333] text-white text-[12px] px-2 py-1.5 outline-none focus:border-[#555] placeholder:text-[#444]"
                      />
                      <input
                        placeholder="Description (optional)"
                        value={row.description}
                        onChange={(e) =>
                          setBulkRows((prev) =>
                            prev.map((r) =>
                              r.key === row.key ? { ...r, description: e.target.value } : r,
                            ),
                          )
                        }
                        className="flex-1 min-w-[120px] bg-[#1a1a1a] border border-[#333] text-white text-[12px] px-2 py-1.5 outline-none focus:border-[#555] placeholder:text-[#444]"
                      />
                      {bulkRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setBulkRows((prev) => prev.filter((r) => r.key !== row.key))
                          }
                          className="text-[#555] hover:text-red-400 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setBulkRows((prev) => [...prev, newRow()])}
                      className="flex items-center gap-1.5 text-[12px] text-[#888] hover:text-white border border-[#333] px-3 py-2 hover:border-[#555] transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> ADD ANOTHER ITEM
                    </button>
                    <button
                      onClick={submitBulk}
                      disabled={saving || readyCount === 0}
                      className="flex items-center gap-2 bg-white text-[#111] px-5 py-2 text-[12px] font-bold uppercase tracking-widest hover:bg-[#eee] transition-colors disabled:opacity-40"
                    >
                      {saving
                        ? "Publishing…"
                        : `Publish Drop (${readyCount} Item${readyCount !== 1 ? "s" : ""}) ✓`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, tag, or size…"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-[13px] pl-9 pr-3 py-2.5 outline-none focus:border-[#444] placeholder:text-[#444]"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-[#555] border-t-white" />
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#555] mb-1">
                  Category
                </label>
                <select
                  value={(() => {
                    const raw = typeof search === "string" ? search : "";
                    return raw.includes("tag=") ? "" : "all";
                  })()}
                  onChange={(e) => {
                    const v = e.target.value;
                    const s =
                      typeof search === "string"
                        ? new URLSearchParams(search)
                        : new URLSearchParams();
                    if (v === "all") s.delete("tag");
                    else s.set("tag", v);
                    s.delete("page");
                    navigate({ to: "/admin", search: Object.fromEntries(s) });
                    reload();
                  }}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-[12px] px-2 py-2 outline-none focus:border-[#444]"
                >
                  <option value="all">All</option>
                  {(categories ?? []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#555] mb-1">
                  Size
                </label>
                <select
                  onChange={(e) => {
                    const v = e.target.value;
                    const s =
                      typeof search === "string"
                        ? new URLSearchParams(search)
                        : new URLSearchParams();
                    if (v === "all") s.delete("size");
                    else s.set("size", v);
                    s.delete("page");
                    navigate({ to: "/admin", search: Object.fromEntries(s) });
                    reload();
                  }}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-[12px] px-2 py-2 outline-none focus:border-[#444]"
                >
                  <option value="all">All</option>
                  {(sizes ?? []).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#555] mb-1">
                  Condition
                </label>
                <select
                  onChange={(e) => {
                    const v = e.target.value;
                    const s =
                      typeof search === "string"
                        ? new URLSearchParams(search)
                        : new URLSearchParams();
                    if (v === "all") s.delete("condition");
                    else s.set("condition", v);
                    s.delete("page");
                    navigate({ to: "/admin", search: Object.fromEntries(s) });
                    reload();
                  }}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-[12px] px-2 py-2 outline-none focus:border-[#444]"
                >
                  <option value="all">All</option>
                  {(conditions ?? []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#555] mb-1">
                  Availability
                </label>
                <select
                  onChange={(e) => {
                    const v = e.target.value;
                    const s =
                      typeof search === "string"
                        ? new URLSearchParams(search)
                        : new URLSearchParams();
                    if (v === "all") s.delete("availability");
                    else s.set("availability", v);
                    s.delete("page");
                    navigate({ to: "/admin", search: Object.fromEntries(s) });
                    reload();
                  }}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-[12px] px-2 py-2 outline-none focus:border-[#444]"
                >
                  <option value="all">All</option>
                  <option value="available">In Stock</option>
                  <option value="one-left">1 Left</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>

            {/* List header */}
            <div className="flex items-center gap-3 mb-3">
              <p className="text-[12px] font-bold uppercase tracking-widest text-white">
                Available ({availableCount})
              </p>
              <button
                onClick={bulkSold}
                className="px-3 py-1 bg-[#2a2a2a] text-[11px] font-semibold uppercase tracking-widest text-[#aaa] hover:text-white border border-[#333] hover:border-[#555] transition-colors"
              >
                Bulk sold
              </button>
              <button className="px-3 py-1 bg-[#2a2a2a] text-[11px] font-semibold uppercase tracking-widest text-[#aaa] hover:text-white border border-[#333] hover:border-[#555] transition-colors">
                ⇅ Reorder
              </button>
            </div>

            {/* Product rows */}
            <div className="space-y-1">
              {displayedProducts.length === 0 && (
                <p className="text-[13px] text-[#555] py-8 text-center">
                  {searchActive ? "No results found" : "No products yet"}
                </p>
              )}
              {displayedProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2.5 hover:border-[#333] transition-colors"
                >
                  {p.images[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="h-10 w-10 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-[#2a2a2a] flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white truncate">{p.title}</p>
                    <p className="text-[11px] text-[#555]">
                      {p.tag} · LE {p.price.toLocaleString()} · {p.size}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggle(p)}
                      className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest border transition-colors ${
                        p.availability === "sold"
                          ? "bg-[#2a2a2a] text-[#888] border-[#333] hover:border-white hover:text-white"
                          : "bg-white text-[#111] border-white hover:bg-[#eee]"
                      }`}
                    >
                      {p.availability === "sold" ? "Unsell" : "Sold"}
                    </button>
                    <button
                      onClick={() => setEditTarget(p)}
                      className="px-3 py-1 text-[11px] font-bold uppercase tracking-widest border border-[#333] text-[#888] hover:border-white hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="p-1.5 text-[#555] hover:text-red-400 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "orders" && (
          <div>
            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#555] mb-1">
                  Status
                </label>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => {
                    setOrderStatusFilter(e.target.value);
                    setOrderPage(1);
                  }}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-[12px] px-2 py-2 outline-none focus:border-[#444]"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#555] mb-1">
                  Sort
                </label>
                <select
                  value={orderSort}
                  onChange={(e) => {
                    setOrderSort(e.target.value);
                    setOrderPage(1);
                  }}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-[12px] px-2 py-2 outline-none focus:border-[#444]"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="total-asc">Total: Low–High</option>
                  <option value="total-desc">Total: High–Low</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#555] mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555]" />
                  <input
                    value={orderSearch}
                    onChange={(e) => {
                      setOrderSearch(e.target.value);
                      setOrderPage(1);
                    }}
                    placeholder="Name, phone, or order ID…"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-[13px] pl-9 pr-3 py-2 outline-none focus:border-[#444] placeholder:text-[#444]"
                  />
                </div>
              </div>
            </div>

            {/* Orders count */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-bold uppercase tracking-widest text-white">
                Orders ({orders.length})
              </p>
            </div>

            {/* Orders list */}
            <div className="space-y-1">
              {orders.length === 0 && (
                <p className="text-[13px] text-[#555] py-8 text-center">No orders found</p>
              )}
              {orders.map((o) => {
                const statusColors: Record<string, string> = {
                  pending: "bg-yellow-900/40 text-yellow-400 border-yellow-700",
                  confirmed: "bg-blue-900/40 text-blue-400 border-blue-700",
                  completed: "bg-green-900/40 text-green-400 border-green-700",
                  cancelled: "bg-red-900/40 text-red-400 border-red-700",
                };
                return (
                  <div
                    key={o.id}
                    className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2.5 hover:border-[#333] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[13px] font-medium text-white truncate">{o.id}</p>
                        <span
                          className={`inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 border ${statusColors[o.status] || "bg-[#2a2a2a] text-[#888] border-[#333]"}`}
                        >
                          {o.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#555]">
                        {o.customerName} · {o.customerPhone} · {o.governorate || "N/A"}
                      </p>
                      <p className="text-[11px] text-[#555]">
                        {o.items.length} item{o.items.length !== 1 ? "s" : ""} ·{" "}
                        {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[13px] font-medium text-white whitespace-nowrap">
                        LE {o.total.toLocaleString()}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 text-[#555] hover:text-white transition-colors"
                        aria-label="View order"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setOrderToDelete(o)}
                        className="p-1.5 text-[#555] hover:text-red-400 transition-colors"
                        aria-label="Delete order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {orderTotalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                  disabled={orderPage <= 1}
                  className="px-4 py-2 bg-[#1a1a1a] border border-[#333] text-[11px] font-bold uppercase tracking-widest text-[#888] hover:text-white hover:border-[#555] transition-colors disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-[12px] text-[#888]">
                  Page {orderPage} / {orderTotalPages}
                </span>
                <button
                  onClick={() => setOrderPage((p) => Math.min(orderTotalPages, p + 1))}
                  disabled={orderPage >= orderTotalPages}
                  className="px-4 py-2 bg-[#1a1a1a] border border-[#333] text-[11px] font-bold uppercase tracking-widest text-[#888] hover:text-white hover:border-[#555] transition-colors disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6 max-w-md">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#888]">Settings</p>

            {/* Announcement Banner */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#555]">
                Announcement Banner
              </p>
              <p className="text-[12px] text-[#666]">
                Shown at the top of the storefront. Leave empty to hide.
              </p>
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="e.g. Free shipping on orders over EGP 1000"
                rows={2}
                maxLength={1000}
                className="w-full bg-[#111] border border-[#333] text-white text-[12px] px-3 py-2 outline-none focus:border-[#555] placeholder:text-[#444] resize-none"
              />
            </div>

            {/* WhatsApp Number */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#555]">
                WhatsApp Number
              </p>
              <p className="text-[12px] text-[#666]">
                Used for order confirmations and contact links.
              </p>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. 201234567890"
                className="w-full bg-[#111] border border-[#333] text-white text-[12px] px-3 py-2 outline-none focus:border-[#555] placeholder:text-[#444]"
              />
            </div>

            {/* Save button */}
            <button
              onClick={saveSettings}
              disabled={savingSettings}
              className="px-5 py-2 bg-white text-[#111] text-[12px] font-bold uppercase tracking-widest hover:bg-[#eee] transition-colors disabled:opacity-50"
            >
              {savingSettings ? "Saving…" : "Save Settings"}
            </button>

            {/* Category Management */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#555]">
                Categories
              </p>
              <p className="text-[12px] text-[#666]">
                Create and manage product categories. New categories appear automatically on the
                shop page.
              </p>

              {/* Existing categories */}
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {dbCategories.map((cat) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between bg-[#111] border border-[#2a2a2a] px-3 py-2"
                  >
                    <span className="text-[13px] text-white">{cat.label}</span>
                    <button
                      onClick={() => handleDeleteCategory(cat.name)}
                      className="text-[#555] hover:text-red-400 transition-colors p-1"
                      aria-label={`Delete category ${cat.label}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {dbCategories.length === 0 && (
                  <p className="text-[12px] text-[#555] py-2">No categories yet</p>
                )}
              </div>

              {/* Add new category */}
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <input
                    placeholder="Category name (e.g. TEE)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full bg-[#111] border border-[#333] text-white text-[12px] px-3 py-2 outline-none focus:border-[#555] placeholder:text-[#444]"
                  />
                  <input
                    placeholder="Display label (e.g. T-Shirts)"
                    value={newCategoryLabel}
                    onChange={(e) => setNewCategoryLabel(e.target.value)}
                    className="w-full bg-[#111] border border-[#333] text-white text-[12px] px-3 py-2 outline-none focus:border-[#555] placeholder:text-[#444]"
                  />
                </div>
                <button
                  onClick={handleCreateCategory}
                  className="flex items-center gap-1 bg-white text-[#111] px-3 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-[#eee] transition-colors whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#555]">
                Danger Zone
              </p>
              <p className="text-[12px] text-[#666]">
                Permanently delete all sold items from the catalog.
              </p>
              <button
                onClick={async () => {
                  if (!confirm("Delete all sold items? This cannot be undone.")) return;
                  const sold = data.items.filter((p) => p.availability === "sold");
                  for (const p of sold) {
                    try {
                      await deleteProductFn({ data: { id: p.id } });
                    } catch {
                      /* skip */
                    }
                  }
                  toast.success(`Cleared ${sold.length} sold items`);
                  await reload();
                }}
                className="px-4 py-2 bg-red-900/50 border border-red-800 text-red-400 text-[12px] font-bold uppercase tracking-widest hover:bg-red-900 transition-colors"
              >
                Clear all sold items
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white sm:rounded-lg max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Product</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <EditModal
              product={editTarget}
              categories={categoryOptions}
              onClose={() => setEditTarget(null)}
              onSaved={async () => {
                setEditTarget(null);
                await reload();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      {deleteTarget && (
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete product?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes &ldquo;{deleteTarget.title}&rdquo;. Cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmDelete(deleteTarget)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Order detail modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white sm:rounded-lg max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Order {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-[#111] border border-[#2a2a2a] p-4 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#555]">
                  Customer
                </p>
                <p className="text-[13px] text-white">{selectedOrder.customerName}</p>
                <p className="text-[13px] text-[#888]">{selectedOrder.customerPhone}</p>
                {selectedOrder.customerInstagram && (
                  <p className="text-[13px] text-[#888]">@{selectedOrder.customerInstagram}</p>
                )}
              </div>
              <div className="bg-[#111] border border-[#2a2a2a] p-4 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#555]">
                  Shipping
                </p>
                <p className="text-[13px] text-white">{selectedOrder.address}</p>
                {selectedOrder.governorate && (
                  <p className="text-[13px] text-[#888]">{selectedOrder.governorate}</p>
                )}
                <p className="text-[13px] text-[#888]">
                  {selectedOrder.pickup ? "Pickup" : "Delivery"}
                </p>
                {selectedOrder.notes && (
                  <p className="text-[13px] text-[#888]">Notes: {selectedOrder.notes}</p>
                )}
              </div>
              <div className="bg-[#111] border border-[#2a2a2a] p-4 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#555]">
                  Items
                </p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] text-white">{item.name}</p>
                      {item.size && <p className="text-[11px] text-[#888]">Size: {item.size}</p>}
                    </div>
                    <p className="text-[13px] text-white">LE {item.price?.toLocaleString()}</p>
                  </div>
                ))}
                <div className="border-t border-[#2a2a2a] pt-2 mt-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#888]">Subtotal</span>
                    <span className="text-[13px] text-white">
                      LE {selectedOrder.subtotal?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#888]">Shipping</span>
                    <span className="text-[13px] text-white">
                      LE {(selectedOrder.total - (selectedOrder.subtotal || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#2a2a2a]">
                    <span className="text-[14px] font-bold text-white">Total</span>
                    <span className="text-[14px] font-bold text-white">
                      LE {selectedOrder.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-[#111] border border-[#2a2a2a] p-4 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#555]">
                  Status
                </p>
                <select
                  value={selectedOrder.status}
                  disabled={orderStatusSaving}
                  onChange={(e) =>
                    handleOrderStatusUpdate(selectedOrder.id, e.target.value as Order["status"])
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2.5 border border-[#333] text-[12px] font-bold uppercase tracking-widest text-[#888] hover:border-[#555] transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setOrderToDelete(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="flex-1 py-2.5 bg-red-900/40 border border-red-800 text-red-400 text-[12px] font-bold uppercase tracking-widest hover:bg-red-900 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order delete confirm */}
      {orderToDelete && (
        <AlertDialog
          open={!!orderToDelete}
          onOpenChange={(open) => !open && setOrderToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete order?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes order &ldquo;{orderToDelete.id}&rdquo;. Cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOrderToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmDeleteOrder(orderToDelete)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

function EditModal({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product;
  categories: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: product.title,
    size: product.size,
    price: String(product.price),
    category: product.tag,
    condition: product.condition,
    description: product.description,
    images: product.images,
    uploading: false,
  });
  const [saving, setSaving] = useState(false);

  const uploadFiles = async (files: FileList | null): Promise<string[]> => {
    if (!files?.length) return [];
    return Promise.all(Array.from(files).map((f) => uploadToCloudinary(f)));
  };

  const save = async () => {
    if (!form.title || !form.price) {
      toast.error("Name and price required");
      return;
    }
    setSaving(true);
    try {
      await updateProductFn({
        data: {
          id: product.id,
          patch: {
            title: form.title,
            tag: form.category,
            condition: form.condition,
            description: form.description,
            price: parseInt(form.price, 10),
            size: form.size || "One Size",
            availability: product.availability,
            images: form.images,
          },
        },
      });
      toast.success("Updated");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 space-y-3">
      <input
        placeholder="Name *"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555] placeholder:text-[#444]"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="Size"
          value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
          className="bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555] placeholder:text-[#444]"
        />
        <input
          placeholder="Price (EGP)"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555] placeholder:text-[#444]"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555]"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={form.condition}
          onChange={(e) => setForm({ ...form, condition: e.target.value })}
          className="bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555]"
        >
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <textarea
        placeholder="Description (optional)"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={2}
        className="w-full bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555] placeholder:text-[#444] resize-none"
      />
      <div className="flex flex-wrap gap-2 items-center">
        {form.images.map((url, i) => (
          <div key={i} className="relative">
            <img src={url} className="h-14 w-14 object-cover" />
            <button
              type="button"
              onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
              className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px]"
            >
              ×
            </button>
          </div>
        ))}
        <label className="flex items-center gap-2 bg-[#222] border border-[#333] px-3 py-2 text-[12px] text-[#888] hover:border-[#555] cursor-pointer">
          <ImagePlus className="h-4 w-4" /> Add image
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={form.uploading}
            onChange={async (e) => {
              setForm((f) => ({ ...f, uploading: true }));
              try {
                const urls = await uploadFiles(e.target.files);
                setForm((f) => ({ ...f, images: [...f.images, ...urls], uploading: false }));
              } catch {
                toast.error("Upload failed");
                setForm((f) => ({ ...f, uploading: false }));
              }
            }}
          />
        </label>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 border border-[#333] text-[12px] font-bold uppercase tracking-widest text-[#888] hover:border-[#555] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex-1 py-2.5 bg-white text-[#111] text-[12px] font-bold uppercase tracking-widest hover:bg-[#eee] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
