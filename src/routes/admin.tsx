import {
  createFileRoute,
  redirect,
  useNavigate,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Trash2, LogOut, Search, X, Plus, ImagePlus } from "lucide-react";

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
} from "@/lib/functions/products";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Product, Availability } from "@/lib/products";

const PER_PAGE = 24;

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
        stats: { total: 0, available: 0, sold: 0, oneLeft: 0, revenue: 0, topBrands: [], recentRevenue: 0, averagePrice: 0 },
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

const CATEGORIES = ["TEE", "SHIRT", "JEANS", "PANTS", "SHORTS", "OTHER"];
const CONDITIONS = ["Excellent", "Good", "Fair"];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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
}

const emptySingle: SingleForm = {
  title: "", size: "", price: "", category: "TEE", condition: "Good",
  description: "", images: [], uploading: false,
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
}

function newRow(): BulkRow {
  return { key: Math.random().toString(36).slice(2), title: "", size: "", price: "", category: "TEE", condition: "Good", description: "", images: [], uploading: false };
}

function AdminDashboard() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const initial = Route.useLoaderData();
  const [data, setData] = useState(initial.products);
  const [stats, setStats] = useState(initial.stats);
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

  if (pathname === "/admin/login") return <Outlet />;

  const reload = async () => {
    const [products, s] = await Promise.all([
      listProductsFn({ data: { page: 1, perPage: PER_PAGE } }),
      dashboardStatsFn(),
    ]);
    setData(products);
    setStats(s);
    setSearchActive(false);
    setSearchQuery("");
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchActive(false); setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await searchProductsFn({ data: { query: searchQuery.trim() } });
        setSearchResults(r); setSearchActive(true);
      } catch { toast.error("Search failed"); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const logout = async () => {
    try { await logoutFn(); } catch { /* ignore */ }
    window.location.href = "/admin/login";
  };

  const uploadFiles = async (files: FileList | null): Promise<string[]> => {
    if (!files?.length) return [];
    return Promise.all(Array.from(files).map((f) => uploadToCloudinary(f)));
  };

  const submitSingle = async () => {
    if (!single.title || !single.price) { toast.error("Name and price are required"); return; }
    setSaving(true);
    try {
      const id = slugify(single.title) || `product-${Date.now()}`;
      await createProductFn({
        data: {
          id, title: single.title, brand: single.category, era: single.condition,
          price: parseInt(single.price, 10), size: single.size || "One Size",
          availability: "available", images: single.images,
          productId: single.description ? [single.description] : [],
          measurements: [],
        },
      });
      toast.success("Product added");
      setSingle(emptySingle);
      await reload();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  };

  const submitBulk = async () => {
    const ready = bulkRows.filter((r) => r.title && r.price);
    if (!ready.length) { toast.error("Add at least one item with name and price"); return; }
    setSaving(true);
    try {
      await createProductsBulkFn({
        data: {
          items: ready.map((r) => ({
            id: slugify(r.title) + "-" + Math.random().toString(36).slice(2, 6),
            title: r.title, brand: r.category, era: r.condition,
            price: parseInt(r.price, 10), size: r.size || "One Size",
            availability: "available" as Availability, images: r.images,
            productId: r.description ? [r.description] : [], measurements: [],
          })),
        },
      });
      toast.success(`Published ${ready.length} item${ready.length > 1 ? "s" : ""}`);
      setBulkRows([newRow()]);
      await reload();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  };

  const toggle = async (p: Product) => {
    try {
      await toggleSoldFn({ data: { id: p.id } });
      toast.success(p.availability === "sold" ? "Marked available" : "Marked sold");
      await reload();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const confirmDelete = async (p: Product) => {
    try {
      await deleteProductFn({ data: { id: p.id } });
      toast.success("Deleted");
      setDeleteTarget(null);
      await reload();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const bulkSold = async () => {
    const available = data.items.filter((p) => p.availability !== "sold");
    for (const p of available) { try { await toggleSoldFn({ data: { id: p.id } }); } catch { /* skip */ } }
    toast.success(`Marked ${available.length} items sold`);
    await reload();
  };

  const displayedProducts = searchActive ? searchResults : data.items;
  const availableCount = data.items.filter((p) => p.availability !== "sold").length;
  const readyCount = bulkRows.filter((r) => r.title && r.price).length;

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
        <span className="font-bold text-[16px] uppercase tracking-widest">Admin</span>
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-[#888]">Preloved Finds</span>
          <button onClick={logout} className="flex items-center gap-1.5 text-[12px] text-[#888] hover:text-white transition-colors">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-5 border-b border-[#2a2a2a]">
        {[
          { label: "TOTAL REVENUE", value: `${stats.revenue.toLocaleString()} EGP` },
          { label: "AVG ORDER", value: `${stats.averagePrice.toLocaleString()} EGP (${stats.sold})` },
          { label: "AVAILABLE", value: stats.available },
          { label: "SOLD", value: stats.sold },
        ].map((s) => (
          <div key={s.label} className="bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#555] mb-1">{s.label}</p>
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
              activeTab === tab ? "border-white text-white" : "border-transparent text-[#555] hover:text-[#aaa]"
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
                <p className="text-[12px] font-bold uppercase tracking-widest text-white">Add Product</p>
                <div className="flex gap-1">
                  {(["single", "bulk"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setAddMode(m)}
                      className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest border transition-colors ${
                        addMode === m ? "bg-white text-[#111] border-white" : "bg-transparent text-[#888] border-[#333] hover:border-[#555]"
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
                    <input placeholder="Size (e.g. L, XL, OS)" value={single.size} onChange={(e) => setSingle({ ...single, size: e.target.value })} className="bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555] placeholder:text-[#444]" />
                    <input placeholder="Price (EGP)" type="number" value={single.price} onChange={(e) => setSingle({ ...single, price: e.target.value })} className="bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555] placeholder:text-[#444]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select value={single.category} onChange={(e) => setSingle({ ...single, category: e.target.value })} className="bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555]">
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={single.condition} onChange={(e) => setSingle({ ...single, condition: e.target.value })} className="bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555]">
                      {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <textarea placeholder="Description (optional)" value={single.description} onChange={(e) => setSingle({ ...single, description: e.target.value })} rows={2} className="w-full bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555] placeholder:text-[#444] resize-none" />
                  {/* Images */}
                  <div className="flex flex-wrap gap-2 items-center">
                    {single.images.map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} className="h-14 w-14 object-cover" />
                        <button type="button" onClick={() => setSingle({ ...single, images: single.images.filter((_, j) => j !== i) })} className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px]">×</button>
                      </div>
                    ))}
                    <label className="flex items-center gap-2 bg-[#222] border border-[#333] px-3 py-2 text-[12px] text-[#888] hover:border-[#555] cursor-pointer">
                      <ImagePlus className="h-4 w-4" />
                      {single.images.length === 0 ? "Upload main image" : "+ Add extra images"}
                      <input type="file" accept="image/*" multiple className="hidden" disabled={single.uploading}
                        onChange={async (e) => {
                          setSingle((s) => ({ ...s, uploading: true }));
                          try { const urls = await uploadFiles(e.target.files); setSingle((s) => ({ ...s, images: [...s.images, ...urls], uploading: false })); }
                          catch { toast.error("Upload failed"); setSingle((s) => ({ ...s, uploading: false })); }
                        }} />
                    </label>
                    {single.uploading && <span className="text-[11px] text-[#888]">Uploading…</span>}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={submitSingle} disabled={saving} className="bg-white text-[#111] px-5 py-2 text-[12px] font-bold uppercase tracking-widest hover:bg-[#eee] transition-colors disabled:opacity-50">
                      {saving ? "Adding…" : "+ ADD PRODUCT"}
                    </button>
                  </div>
                </div>
              )}

              {/* Bulk drop form */}
              {addMode === "bulk" && (
                <div className="space-y-2">
                  {bulkRows.map((row, idx) => (
                    <div key={row.key} className="flex flex-wrap items-center gap-2 bg-[#111] border border-[#2a2a2a] p-2">
                      {/* Image slots */}
                      <div className="flex gap-1">
                        {row.images.slice(0, 2).map((url, i) => (
                          <div key={i} className="relative">
                            <img src={url} className="h-9 w-9 object-cover" />
                            <button type="button" onClick={() => setBulkRows((prev) => prev.map((r) => r.key === row.key ? { ...r, images: r.images.filter((_, j) => j !== i) } : r))} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-3.5 w-3.5 flex items-center justify-center text-[8px]">×</button>
                          </div>
                        ))}
                        {row.images.length < 2 && (
                          <label className="h-9 w-9 flex items-center justify-center bg-[#1a1a1a] border border-[#333] cursor-pointer hover:border-[#555]">
                            <Plus className="h-3.5 w-3.5 text-[#555]" />
                            <input type="file" accept="image/*" multiple className="hidden"
                              onChange={async (e) => {
                                setBulkRows((prev) => prev.map((r) => r.key === row.key ? { ...r, uploading: true } : r));
                                try {
                                  const urls = await uploadFiles(e.target.files);
                                  setBulkRows((prev) => prev.map((r) => r.key === row.key ? { ...r, images: [...r.images, ...urls].slice(0, 4), uploading: false } : r));
                                } catch { toast.error("Upload failed"); setBulkRows((prev) => prev.map((r) => r.key === row.key ? { ...r, uploading: false } : r)); }
                              }} />
                          </label>
                        )}
                      </div>
                      <input placeholder="Size" value={row.size} onChange={(e) => setBulkRows((prev) => prev.map((r) => r.key === row.key ? { ...r, size: e.target.value } : r))} className="w-20 bg-[#1a1a1a] border border-[#333] text-white text-[12px] px-2 py-1.5 outline-none focus:border-[#555] placeholder:text-[#444]" />
                      <input placeholder="Price" type="number" value={row.price} onChange={(e) => setBulkRows((prev) => prev.map((r) => r.key === row.key ? { ...r, price: e.target.value } : r))} className="w-24 bg-[#1a1a1a] border border-[#333] text-white text-[12px] px-2 py-1.5 outline-none focus:border-[#555] placeholder:text-[#444]" />
                      <select value={row.category} onChange={(e) => setBulkRows((prev) => prev.map((r) => r.key === row.key ? { ...r, category: e.target.value } : r))} className="bg-[#1a1a1a] border border-[#333] text-white text-[12px] px-2 py-1.5 outline-none focus:border-[#555]">
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select value={row.condition} onChange={(e) => setBulkRows((prev) => prev.map((r) => r.key === row.key ? { ...r, condition: e.target.value } : r))} className="bg-[#1a1a1a] border border-[#333] text-white text-[12px] px-2 py-1.5 outline-none focus:border-[#555]">
                        {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input placeholder="Name *" value={row.title} onChange={(e) => setBulkRows((prev) => prev.map((r) => r.key === row.key ? { ...r, title: e.target.value } : r))} className="flex-1 min-w-[120px] bg-[#1a1a1a] border border-[#333] text-white text-[12px] px-2 py-1.5 outline-none focus:border-[#555] placeholder:text-[#444]" />
                      <input placeholder="Description (optional)" value={row.description} onChange={(e) => setBulkRows((prev) => prev.map((r) => r.key === row.key ? { ...r, description: e.target.value } : r))} className="flex-1 min-w-[120px] bg-[#1a1a1a] border border-[#333] text-white text-[12px] px-2 py-1.5 outline-none focus:border-[#555] placeholder:text-[#444]" />
                      {bulkRows.length > 1 && (
                        <button type="button" onClick={() => setBulkRows((prev) => prev.filter((r) => r.key !== row.key))} className="text-[#555] hover:text-red-400 transition-colors"><X className="h-4 w-4" /></button>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <button type="button" onClick={() => setBulkRows((prev) => [...prev, newRow()])} className="flex items-center gap-1.5 text-[12px] text-[#888] hover:text-white border border-[#333] px-3 py-2 hover:border-[#555] transition-colors">
                      <Plus className="h-3.5 w-3.5" /> ADD ANOTHER ITEM
                    </button>
                    <button onClick={submitBulk} disabled={saving || readyCount === 0} className="flex items-center gap-2 bg-white text-[#111] px-5 py-2 text-[12px] font-bold uppercase tracking-widest hover:bg-[#eee] transition-colors disabled:opacity-40">
                      {saving ? "Publishing…" : `Publish Drop (${readyCount} Item${readyCount !== 1 ? "s" : ""}) ✓`}
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
              {searching && <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-[#555] border-t-white" />}
            </div>

            {/* List header */}
            <div className="flex items-center gap-3 mb-3">
              <p className="text-[12px] font-bold uppercase tracking-widest text-white">
                Available ({availableCount})
              </p>
              <button onClick={bulkSold} className="px-3 py-1 bg-[#2a2a2a] text-[11px] font-semibold uppercase tracking-widest text-[#aaa] hover:text-white border border-[#333] hover:border-[#555] transition-colors">
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
                <div key={p.id} className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2.5 hover:border-[#333] transition-colors">
                  {p.images[0] ? (
                    <img src={p.images[0]} alt={p.title} className="h-10 w-10 object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-10 w-10 bg-[#2a2a2a] flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white truncate">{p.title}</p>
                    <p className="text-[11px] text-[#555]">
                      {p.era} {p.brand} · LE {p.price.toLocaleString()} · {p.size}
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#555] mb-2">Orders</p>
            <p className="text-[13px] text-[#444]">Order management coming soon.</p>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6 max-w-md">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#888]">Settings</p>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#555]">Danger Zone</p>
              <p className="text-[12px] text-[#666]">Permanently delete all sold items from the catalog.</p>
              <button
                onClick={async () => {
                  if (!confirm("Delete all sold items? This cannot be undone.")) return;
                  const sold = data.items.filter((p) => p.availability === "sold");
                  for (const p of sold) { try { await deleteProductFn({ data: { id: p.id } }); } catch { /* skip */ } }
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
      {editTarget && (
        <EditModal
          product={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={async () => { setEditTarget(null); await reload(); }}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 max-w-sm w-full mx-4">
            <p className="text-[14px] font-bold text-white mb-2">Delete product?</p>
            <p className="text-[13px] text-[#888] mb-5">
              This permanently removes &ldquo;{deleteTarget.title}&rdquo;. Cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 border border-[#333] text-[12px] font-bold uppercase tracking-widest text-[#888] hover:border-[#555] transition-colors">Cancel</button>
              <button onClick={() => confirmDelete(deleteTarget)} className="flex-1 py-2 bg-red-700 text-white text-[12px] font-bold uppercase tracking-widest hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditModal({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: product.title,
    size: product.size,
    price: String(product.price),
    category: product.brand,
    condition: product.era,
    description: product.productId.join("\n"),
    images: product.images,
    uploading: false,
  });
  const [saving, setSaving] = useState(false);

  const uploadFiles = async (files: FileList | null): Promise<string[]> => {
    if (!files?.length) return [];
    return Promise.all(Array.from(files).map((f) => uploadToCloudinary(f)));
  };

  const save = async () => {
    if (!form.title || !form.price) { toast.error("Name and price required"); return; }
    setSaving(true);
    try {
      await updateProductFn({
        data: {
          id: product.id,
          patch: {
            title: form.title, brand: form.category, era: form.condition,
            price: parseInt(form.price, 10), size: form.size || "One Size",
            availability: product.availability, images: form.images,
            productId: form.description.split("\n").map((s) => s.trim()).filter(Boolean),
            measurements: product.measurements,
          },
        },
      });
      toast.success("Updated");
      onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <p className="text-[13px] font-bold uppercase tracking-widest text-white">Edit Product</p>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <input placeholder="Name *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555] placeholder:text-[#444]" />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555] placeholder:text-[#444]" />
            <input placeholder="Price (EGP)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555] placeholder:text-[#444]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555]">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555]">
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-[#111] border border-[#333] text-white text-[13px] px-3 py-2.5 outline-none focus:border-[#555] placeholder:text-[#444] resize-none" />
          <div className="flex flex-wrap gap-2 items-center">
            {form.images.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} className="h-14 w-14 object-cover" />
                <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px]">×</button>
              </div>
            ))}
            <label className="flex items-center gap-2 bg-[#222] border border-[#333] px-3 py-2 text-[12px] text-[#888] hover:border-[#555] cursor-pointer">
              <ImagePlus className="h-4 w-4" /> Add image
              <input type="file" accept="image/*" multiple className="hidden" disabled={form.uploading}
                onChange={async (e) => {
                  setForm((f) => ({ ...f, uploading: true }));
                  try { const urls = await uploadFiles(e.target.files); setForm((f) => ({ ...f, images: [...f.images, ...urls], uploading: false })); }
                  catch { toast.error("Upload failed"); setForm((f) => ({ ...f, uploading: false })); }
                }} />
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 border border-[#333] text-[12px] font-bold uppercase tracking-widest text-[#888] hover:border-[#555] transition-colors">Cancel</button>
            <button onClick={save} disabled={saving} className="flex-1 py-2.5 bg-white text-[#111] text-[12px] font-bold uppercase tracking-widest hover:bg-[#eee] transition-colors disabled:opacity-50">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
