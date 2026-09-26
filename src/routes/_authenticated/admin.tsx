import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload, Download, Check, X, Star, RefreshCw } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { BUSINESS, JEWELLERY_CATEGORIES } from "@/config/site";
import { cn } from "@/lib/utils";
import { uploadImage, removeImage } from "@/lib/image-upload";
import { SiteImagesPanel } from "@/components/admin/SiteImagesPanel";
import { GalleryPanel } from "@/components/admin/GalleryPanel";
import { PriceListPanel } from "@/components/admin/PriceListPanel";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Catalogue Dashboard | Kaara's Beauty Saloon & Makeover" },
      {
        name: "description",
        content:
          "Private dashboard to manage the Kaara's jewellery catalogue, site photos, gallery, salon services and anniversary offers.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const BUCKET = "jewellery";

type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number | null;
  image_url: string | null;
  image_alt: string | null;
  in_stock: boolean;
  is_published: boolean;
  display_order: number;
};

type Service = {
  id: string;
  page: string;
  title: string;
  description: string;
  items: string[];
  price: string | null;
  image_key: string | null;
  display_order: number;
  is_published: boolean;
};

type Offer = {
  id: string;
  tag: string;
  title: string;
  body: string;
  cta_label: string;
  intent: string;
  display_order: number;
  is_published: boolean;
};

const TABS = [
  { id: "products", label: "Jewellery" },
  { id: "photos", label: "Site photos" },
  { id: "gallery", label: "Gallery" },
  { id: "prices", label: "Price list" },
  { id: "services", label: "Service cards" },
  { id: "offers", label: "Offers & discounts" },
  { id: "bookings", label: "Bookings" },
  { id: "reviews", label: "Reviews" },
  { id: "coupons", label: "Coupons" },
  { id: "returns", label: "Returns" },
  { id: "tools", label: "Tools" },
] as const;
type TabId = (typeof TABS)[number]["id"];

/* ---------- shared field styles ---------- */
const field =
  "mt-2 w-full rounded-sm border border-input bg-background px-3.5 py-2.5 text-sm text-ivory outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelCls =
  "text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground";
const btnGold =
  "rounded-sm bg-gold px-5 py-2.5 text-[0.7rem] uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-gold-soft disabled:opacity-60";
const btnGhost =
  "rounded-sm border border-gold/40 px-4 py-2 text-[0.65rem] uppercase tracking-[0.18em] text-ivory transition-colors hover:border-gold hover:bg-gold/10";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("products");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { setIsAdmin(false); return; }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (isAdmin === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center">
        <div className="max-w-sm">
          <h1 className="font-display text-3xl text-ivory">No access</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This account is not the {BUSINESS.shortName} owner account.
          </p>
          <button type="button" onClick={signOut} className={cn(btnGhost, "mt-6")}>
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-24 pt-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground">
              {BUSINESS.shortName} dashboard
            </p>
            <h1 className="mt-2 font-display text-3xl text-ivory md:text-4xl">
              Manage your website
            </h1>
          </div>
          <div className="flex gap-3">
            <Link to="/" className={btnGhost}>
              View site
            </Link>
            <button type="button" onClick={signOut} className={btnGhost}>
              Sign out
            </button>
          </div>
        </header>

        <nav className="mt-8 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={cn(
                "rounded-sm border px-4 py-2 text-[0.66rem] uppercase tracking-[0.18em] transition-colors",
                tab === t.id
                  ? "border-gold bg-gold text-primary-foreground"
                  : "border-gold/35 text-ivory/80 hover:border-gold hover:text-gold",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="mt-8">
          {tab === "products" ? <ProductsPanel /> : null}
          {tab === "photos" ? <SiteImagesPanel /> : null}
          {tab === "gallery" ? <GalleryPanel /> : null}
          {tab === "prices" ? <PriceListPanel /> : null}
          {tab === "services" ? <ServicesPanel /> : null}
          {tab === "offers" ? <OffersPanel /> : null}
          {tab === "bookings" ? <BookingsPanel /> : null}
          {tab === "reviews" ? <ReviewsPanel /> : null}
          {tab === "coupons" ? <CouponsPanel /> : null}
          {tab === "returns" ? <ReturnsPanel /> : null}
          {tab === "tools" ? <ToolsPanel /> : null}
        </div>
      </div>
    </main>
  );
}

/* =======================  JEWELLERY  ======================= */

const emptyProduct = {
  name: "",
  category: JEWELLERY_CATEGORIES[0] as string,
  description: "",
  price: "",
  image_alt: "",
  in_stock: true,
  is_published: true,
  display_order: 0,
};

function ProductsPanel() {
  const [rows, setRows] = useState<Product[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jewellery_products")
      .select(
        "id, name, category, description, price, image_url, image_alt, in_stock, is_published, display_order",
      )
      .order("display_order", { ascending: true });
    if (error) toast.error(error.message);
    const list = (data ?? []) as Product[];
    setRows(list);

    const paths = list
      .map((r) => r.image_url)
      .filter((v): v is string => !!v && !v.startsWith("http"));
    if (paths.length) {
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrls(paths, 3600);
      const map: Record<string, string> = {};
      for (const s of signed ?? []) {
        if (s.path && s.signedUrl) map[s.path] = s.signedUrl;
      }
      setPreviews(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(row: Product) {
    if (!confirm(`Delete "${row.name}"? This cannot be undone.`)) return;
    const { error } = await supabase
      .from("jewellery_products")
      .delete()
      .eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    if (row.image_url && !row.image_url.startsWith("http")) {
      await supabase.storage.from(BUCKET).remove([row.image_url]);
    }
    toast.success("Product deleted");
    void load();
  }

  async function togglePublish(row: Product) {
    const { error } = await supabase
      .from("jewellery_products")
      .update({ is_published: !row.is_published })
      .eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    void load();
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ivory">Jewellery products</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Add product → upload photo → enter details → publish.
          </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={btnGhost} onClick={() => exportProducts(rows)}><Download className="mr-2 inline h-4 w-4"/>Export CSV</button>
          <label className={cn(btnGhost, "cursor-pointer")}><Upload className="mr-2 inline h-4 w-4"/>Import CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={async e => { const file=e.target.files?.[0]; if(file){ await importProducts(file); void load(); } e.currentTarget.value=""; }}/></label>
          <button type="button" className={btnGhost} onClick={async()=>{const {error}=await supabase.from("jewellery_products").update({is_published:true}).neq("id",""); if(error)toast.error(error.message); else {toast.success("All products published");void load();}}}><Check className="mr-2 inline h-4 w-4"/>Publish all</button>
          <button type="button" className={btnGhost} onClick={async()=>{const {error}=await supabase.from("jewellery_products").update({is_published:false}).neq("id",""); if(error)toast.error(error.message); else {toast.success("All products hidden");void load();}}}><X className="mr-2 inline h-4 w-4"/>Hide all</button>
        </div>
        </div>
        <button
          type="button"
          className={cn(btnGold, "flex items-center gap-2")}
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      {creating || editing ? (
        <ProductForm
          product={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            void load();
          }}
        />
      ) : null}

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No products yet. Tap “Add product” to create your first piece.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-4 rounded-sm border border-border bg-surface p-4 sm:flex-row sm:items-center"
            >
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-surface-raised">
                {row.image_url ? (
                  <img
                    src={previews[row.image_url] ?? row.image_url}
                    alt={row.image_alt || row.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                    No photo
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
                  {row.category} · #{row.display_order}
                </p>
                <h3 className="mt-1 font-display text-xl text-ivory">{row.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {row.price != null
                    ? `₹${Number(row.price).toLocaleString("en-IN")}`
                    : "Price on enquiry"}
                  {" · "}
                  {row.in_stock ? "Available" : "Enquire for availability"}
                  {" · "}
                  <span className={row.is_published ? "text-gold" : ""}>
                    {row.is_published ? "Published" : "Hidden"}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={btnGhost} onClick={() => setEditing(row)}>
                  Edit
                </button>
                <button type="button" className={btnGhost} onClick={() => togglePublish(row)}>
                  {row.is_published ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  className={cn(btnGhost, "border-destructive/50 text-destructive")}
                  onClick={() => remove(row)}
                  aria-label={`Delete ${row.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ProductForm({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(() =>
    product
      ? {
          name: product.name,
          category: product.category,
          description: product.description,
          price: product.price != null ? String(product.price) : "",
          image_alt: product.image_alt ?? "",
          in_stock: product.in_stock,
          is_published: product.is_published,
          display_order: product.display_order,
        }
      : { ...emptyProduct },
  );
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File | null) {
    setFile(f);
    setLocalPreview(f ? URL.createObjectURL(f) : null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      let imagePath = product?.image_url ?? null;

      const previousPath = imagePath;
      let uploadedPath: string | null = null;
      if (file) {
        // Resized + compressed in the browser before upload.
        uploadedPath = await uploadImage(BUCKET, "products", file);
        imagePath = uploadedPath;
      }

      const payload = {
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        price: form.price.trim() === "" ? null : Number(form.price),
        image_url: imagePath,
        image_alt: form.image_alt.trim() || form.name.trim(),
        in_stock: form.in_stock,
        is_published: form.is_published,
        display_order: Number(form.display_order) || 0,
      };

      const { error } = product
        ? await supabase.from("jewellery_products").update(payload).eq("id", product.id)
        : await supabase.from("jewellery_products").insert(payload);
      if (error) {
        // Do not leave an orphaned upload behind if saving failed.
        await removeImage(BUCKET, uploadedPath);
        throw error;
      }
      // The old photo is only removed once the new one is safely saved.
      if (uploadedPath && previousPath) await removeImage(BUCKET, previousPath);

      toast.success(product ? "Product updated" : "Product added");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save product");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={save}
      className="mt-6 space-y-5 rounded-sm border border-gold/30 bg-surface p-5 md:p-7"
    >
      <h3 className="font-display text-2xl text-ivory">
        {product ? "Edit product" : "New product"}
      </h3>

      <div>
        <span className={labelCls}>Photo</span>
        <div className="mt-2 flex items-center gap-4">
          <div className="h-24 w-24 overflow-hidden rounded-sm border border-border bg-surface-raised">
            {localPreview ? (
              <img src={localPreview} alt="Selected" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
                {product?.image_url ? "Current photo kept" : "No photo"}
              </span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            className={cn(btnGhost, "flex items-center gap-2")}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4" /> Upload photo
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Product name">
          <input
            required
            className={field}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Category">
          <select
            className={field}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {JEWELLERY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Description">
        <textarea
          rows={3}
          className={field}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Price in ₹ (leave blank for “on enquiry”)">
          <input
            type="number"
            min={0}
            className={field}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </Field>
        <Field label="Display order">
          <input
            type="number"
            className={field}
            value={form.display_order}
            onChange={(e) =>
              setForm({ ...form, display_order: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Photo description (for accessibility)">
          <input
            className={field}
            value={form.image_alt}
            onChange={(e) => setForm({ ...form, image_alt: e.target.value })}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2.5 text-sm text-ivory">
          <input
            type="checkbox"
            checked={form.in_stock}
            onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
          />
          Available now
        </label>
        <label className="flex items-center gap-2.5 text-sm text-ivory">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
          />
          Show on website
        </label>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={busy} className={btnGold}>
          {busy ? "Saving…" : product ? "Save changes" : "Add product"}
        </button>
        <button type="button" className={btnGhost} onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/* =======================  SERVICES  ======================= */

function ServicesPanel() {
  const [rows, setRows] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_services")
      .select(
        "id, page, title, description, items, price, image_key, display_order, is_published",
      )
      .order("display_order", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Service[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveRow(row: Service) {
    const { error } = await supabase
      .from("site_services")
      .update({
        title: row.title,
        description: row.description,
        price: row.price?.trim() ? row.price.trim() : null,
        items: row.items,
        display_order: row.display_order,
        is_published: row.is_published,
      })
      .eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Service saved");
  }

  async function addRow() {
    const { error } = await supabase.from("site_services").insert({
      page: "home",
      title: "New service",
      description: "",
      items: [],
      display_order: rows.length + 1,
      is_published: false,
      image_key: "makeover",
    });
    if (error) { toast.error(error.message); return; }
    void load();
  }

  async function removeRow(row: Service) {
    if (!confirm(`Delete "${row.title}"?`)) return;
    const { error } = await supabase.from("site_services").delete().eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    void load();
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ivory">Services & prices</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Edit what each service says and the price shown on the home page.
          </p>
        </div>
        <button type="button" className={cn(btnGold, "flex items-center gap-2")} onClick={addRow}>
          <Plus className="h-4 w-4" /> Add service
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <ul className="mt-8 space-y-5">
          {rows.map((row, idx) => (
            <li key={row.id} className="rounded-sm border border-border bg-surface p-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Service name">
                  <input
                    className={field}
                    value={row.title}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, title: e.target.value };
                      setRows(next);
                    }}
                  />
                </Field>
                <Field label="Price text (e.g. From ₹1,500)">
                  <input
                    className={field}
                    value={row.price ?? ""}
                    placeholder="Leave blank to hide the price"
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, price: e.target.value };
                      setRows(next);
                    }}
                  />
                </Field>
              </div>
              <div className="mt-5">
                <Field label="Description">
                  <textarea
                    rows={2}
                    className={field}
                    value={row.description}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, description: e.target.value };
                      setRows(next);
                    }}
                  />
                </Field>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Bullet points (one per line)">
                  <textarea
                    rows={3}
                    className={field}
                    value={row.items.join("\n")}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = {
                        ...row,
                        items: e.target.value.split("\n").filter((v) => v.trim() !== ""),
                      };
                      setRows(next);
                    }}
                  />
                </Field>
                <Field label="Display order">
                  <input
                    type="number"
                    className={field}
                    value={row.display_order}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, display_order: Number(e.target.value) };
                      setRows(next);
                    }}
                  />
                </Field>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2.5 text-sm text-ivory">
                  <input
                    type="checkbox"
                    checked={row.is_published}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, is_published: e.target.checked };
                      setRows(next);
                    }}
                  />
                  Show on website
                </label>
                <button type="button" className={btnGold} onClick={() => saveRow(rows[idx]!)}>
                  Save
                </button>
                <button
                  type="button"
                  className={cn(btnGhost, "border-destructive/50 text-destructive")}
                  onClick={() => removeRow(row)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* =======================  OFFERS  ======================= */

const INTENT_OPTIONS = [
  { value: "freeTrial", label: "Free trial message" },
  { value: "offer500", label: "₹500 OFF message" },
  { value: "offerRupee1", label: "₹1 special message" },
  { value: "bridal", label: "Bridal enquiry message" },
  { value: "services", label: "Services enquiry message" },
  { value: "general", label: "General booking message" },
];

function OffersPanel() {
  const [rows, setRows] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_offers")
      .select("id, tag, title, body, cta_label, intent, display_order, is_published")
      .order("display_order", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Offer[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const count = useMemo(() => rows.length, [rows]);

  async function saveRow(row: Offer) {
    const { error } = await supabase
      .from("site_offers")
      .update({
        tag: row.tag,
        title: row.title,
        body: row.body,
        cta_label: row.cta_label,
        intent: row.intent,
        display_order: row.display_order,
        is_published: row.is_published,
      })
      .eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Offer saved");
  }

  async function addRow() {
    const { error } = await supabase.from("site_offers").insert({
      tag: `Offer 0${count + 1}`,
      title: "New offer",
      body: "",
      cta_label: "Enquire on WhatsApp",
      intent: "general",
      display_order: count + 1,
      is_published: false,
    });
    if (error) { toast.error(error.message); return; }
    void load();
  }

  async function removeRow(row: Offer) {
    if (!confirm(`Delete "${row.title}"?`)) return;
    const { error } = await supabase.from("site_offers").delete().eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    void load();
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ivory">Offers & discounts</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            These are the anniversary cards on the home page.
          </p>
        </div>
        <button type="button" className={cn(btnGold, "flex items-center gap-2")} onClick={addRow}>
          <Plus className="h-4 w-4" /> Add offer
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <ul className="mt-8 space-y-5">
          {rows.map((row, idx) => (
            <li key={row.id} className="rounded-sm border border-border bg-surface p-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Small label">
                  <input
                    className={field}
                    value={row.tag}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, tag: e.target.value };
                      setRows(next);
                    }}
                  />
                </Field>
                <Field label="Offer title">
                  <input
                    className={field}
                    value={row.title}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, title: e.target.value };
                      setRows(next);
                    }}
                  />
                </Field>
              </div>
              <div className="mt-5">
                <Field label="Offer details">
                  <textarea
                    rows={3}
                    className={field}
                    value={row.body}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, body: e.target.value };
                      setRows(next);
                    }}
                  />
                </Field>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-3">
                <Field label="Button text">
                  <input
                    className={field}
                    value={row.cta_label}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, cta_label: e.target.value };
                      setRows(next);
                    }}
                  />
                </Field>
                <Field label="WhatsApp message">
                  <select
                    className={field}
                    value={row.intent}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, intent: e.target.value };
                      setRows(next);
                    }}
                  >
                    {INTENT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Display order">
                  <input
                    type="number"
                    className={field}
                    value={row.display_order}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, display_order: Number(e.target.value) };
                      setRows(next);
                    }}
                  />
                </Field>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2.5 text-sm text-ivory">
                  <input
                    type="checkbox"
                    checked={row.is_published}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, is_published: e.target.checked };
                      setRows(next);
                    }}
                  />
                  Show on website
                </label>
                <button type="button" className={btnGold} onClick={() => saveRow(rows[idx]!)}>
                  Save
                </button>
                <button
                  type="button"
                  className={cn(btnGhost, "border-destructive/50 text-destructive")}
                  onClick={() => removeRow(row)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}


function csvEscape(value: unknown) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
function exportProducts(rows: Product[]) {
  const header=['name','category','description','price','image_alt','in_stock','is_published','display_order'];
  const body=rows.map(r=>[r.name,r.category,r.description,r.price??'',r.image_alt??'',r.in_stock,r.is_published,r.display_order].map(csvEscape).join(','));
  const blob=new Blob([[header.join(','),...body].join('\n')],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='kaaras-jewellery-products.csv'; a.click(); URL.revokeObjectURL(url);
}
async function importProducts(file: File) {
  const text=await file.text(); const lines=text.split(/\r?\n/).filter(Boolean); if(lines.length<2){toast.error('CSV is empty');return;}
  const parse=(line:string)=>{const out:string[]=[];let cur='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q;}else if(c===','&&!q){out.push(cur);cur='';}else cur+=c;}out.push(cur);return out;};
  const headers=parse(lines[0]!).map(h=>h.trim()); const rows=lines.slice(1).map(parse); const payload=rows.map(v=>{const x=(name:string)=>v[headers.indexOf(name)]??'';return{name:x('name'),category:x('category')||'Bridal Sets',description:x('description'),price:x('price')?Number(x('price')):null,image_alt:x('image_alt'),in_stock:x('in_stock')!=='false',is_published:x('is_published')!=='false',display_order:Number(x('display_order')||0)}}).filter(x=>x.name);
  if(!payload.length){toast.error('No valid product rows found');return;} const {error}=await supabase.from('jewellery_products').insert(payload); if(error)toast.error(error.message);else toast.success(`${payload.length} products imported`);
}

function BookingsPanel(){
 const [rows,setRows]=useState<any[]>([]); const [loading,setLoading]=useState(true);
 const load=useCallback(async()=>{setLoading(true);const {data,error}=await supabase.from('bookings').select('*').order('appointment_date',{ascending:true}).order('appointment_time',{ascending:true});if(error)toast.error(error.message);setRows(data??[]);setLoading(false)},[]);useEffect(()=>{void load()},[load]);
 async function status(id:string,status:string){const {error}=await supabase.from('bookings').update({status}).eq('id',id);if(error)toast.error(error.message);else void load()}
 return <section><div className="flex items-center justify-between"><div><h2 className="font-display text-2xl text-ivory">Appointment bookings</h2><p className="mt-1 text-xs text-muted-foreground">Review, confirm and complete customer requests.</p></div><button className={btnGhost} onClick={()=>void load()}><RefreshCw className="mr-2 inline h-4 w-4"/>Refresh</button></div>{loading?<p className="mt-8 text-sm text-muted-foreground">Loading…</p>:<div className="mt-8 space-y-3">{rows.length?rows.map(r=><article key={r.id} className="surface-panel rounded-sm p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[.18em] text-gold">{r.booking_code}</p><h3 className="mt-1 text-xl text-ivory">{r.customer_name} · {r.service_name}</h3><p className="mt-2 text-sm text-muted-foreground">{r.appointment_date} · {String(r.appointment_time).slice(0,5)} · {r.phone}</p>{r.notes&&<p className="mt-2 text-sm text-ivory/70">{r.notes}</p>}</div><select value={r.status} onChange={e=>void status(r.id,e.target.value)} className={field+" mt-0 w-auto"}>{['pending','confirmed','completed','cancelled','no_show'].map(x=><option key={x}>{x}</option>)}</select></div></article>):<p className="text-sm text-muted-foreground">No bookings yet.</p>}</div>}</section>
}

function ReviewsPanel(){
 const [rows,setRows]=useState<any[]>([]); const load=useCallback(async()=>{const {data,error}=await supabase.from('reviews').select('*').order('created_at',{ascending:false});if(error)toast.error(error.message);setRows(data??[])},[]);useEffect(()=>{void load()},[load]);
 async function toggle(r:any){const {error}=await supabase.from('reviews').update({is_published:!r.is_published}).eq('id',r.id);if(error)toast.error(error.message);else void load()}
 async function remove(r:any){if(!confirm('Delete this review?'))return;const {error}=await supabase.from('reviews').delete().eq('id',r.id);if(error)toast.error(error.message);else void load()}
 return <section><h2 className="font-display text-2xl text-ivory">Reviews moderation</h2><p className="mt-1 text-xs text-muted-foreground">Approve genuine customer feedback before it appears publicly.</p><div className="mt-8 space-y-3">{rows.length?rows.map(r=><article key={r.id} className="surface-panel rounded-sm p-5"><div className="flex flex-wrap justify-between gap-4"><div><div className="flex gap-1">{Array.from({length:5},(_,i)=><Star key={i} className={`h-4 w-4 ${i<r.rating?'fill-gold text-gold':'text-muted-foreground'}`}/>)}</div><p className="mt-3 text-sm text-ivory">{r.review}</p><p className="mt-2 text-xs uppercase tracking-[.16em] text-muted-foreground">{r.customer_name}{r.service_name?` · ${r.service_name}`:''}</p></div><div className="flex gap-2"><button className={btnGold} onClick={()=>void toggle(r)}>{r.is_published?'Hide':'Approve'}</button><button className={cn(btnGhost,'text-destructive border-destructive/40')} onClick={()=>void remove(r)}>Delete</button></div></div></article>):<p className="text-sm text-muted-foreground">No reviews yet.</p>}</div></section>
}

function CouponsPanel(){
 const [rows,setRows]=useState<any[]>([]); const [code,setCode]=useState(''); const [value,setValue]=useState('500'); const [minimum,setMinimum]=useState('1500');
 const load=useCallback(async()=>{const {data,error}=await supabase.from('coupons').select('*').order('created_at',{ascending:false});if(error)toast.error(error.message);setRows(data??[])},[]);useEffect(()=>{void load()},[load]);
 async function add(){const {error}=await supabase.from('coupons').insert({code:code.trim().toUpperCase(),description:`Kaaras promotion — ₹${value} off`,discount_type:'fixed',discount_value:Number(value),minimum_amount:Number(minimum)});if(error)toast.error(error.message);else{toast.success('Coupon created');setCode('');void load()}}
 async function toggle(r:any){const {error}=await supabase.from('coupons').update({is_active:!r.is_active}).eq('id',r.id);if(error)toast.error(error.message);else void load()}
 return <section><h2 className="font-display text-2xl text-ivory">Coupons</h2><div className="mt-6 grid gap-3 md:grid-cols-[1fr_140px_140px_auto]"><input placeholder="CODE" value={code} onChange={e=>setCode(e.target.value)} className={field}/><input type="number" placeholder="Discount" value={value} onChange={e=>setValue(e.target.value)} className={field}/><input type="number" placeholder="Minimum" value={minimum} onChange={e=>setMinimum(e.target.value)} className={field}/><button className={btnGold} onClick={()=>void add()}>Add</button></div><div className="mt-8 space-y-3">{rows.map(r=><div key={r.id} className="surface-panel flex flex-wrap items-center justify-between gap-4 rounded-sm p-5"><div><p className="text-lg text-gold">{r.code}</p><p className="text-xs text-muted-foreground">₹{r.discount_value} off · minimum ₹{r.minimum_amount} · used {r.used_count}</p></div><button className={btnGhost} onClick={()=>void toggle(r)}>{r.is_active?'Disable':'Enable'}</button></div>)}</div></section>
}

function ReturnsPanel(){
 const [rows,setRows]=useState<any[]>([]);const load=useCallback(async()=>{const {data,error}=await supabase.from('return_requests').select('*').order('created_at',{ascending:false});if(error)toast.error(error.message);setRows(data??[])},[]);useEffect(()=>{void load()},[load]);
 async function status(id:string,status:string){const {error}=await supabase.from('return_requests').update({status}).eq('id',id);if(error)toast.error(error.message);else void load()}
 return <section><h2 className="font-display text-2xl text-ivory">Return requests</h2><p className="mt-1 text-xs text-muted-foreground">Track jewellery/product return cases manually until the ecommerce order system is connected.</p><div className="mt-8 space-y-3">{rows.length?rows.map(r=><article key={r.id} className="surface-panel rounded-sm p-5"><div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs uppercase tracking-[.18em] text-gold">{r.request_code} · {r.order_reference}</p><h3 className="mt-1 text-lg text-ivory">{r.product_name}</h3><p className="mt-2 text-sm text-muted-foreground">{r.customer_name} · {r.phone}</p><p className="mt-2 text-sm text-ivory/70">{r.reason}</p></div><select value={r.status} onChange={e=>void status(r.id,e.target.value)} className={field+" mt-0 w-auto"}>{['requested','approved','rejected','received','refunded','closed'].map(x=><option key={x}>{x}</option>)}</select></div></article>):<p className="text-sm text-muted-foreground">No return requests yet.</p>}</div></section>
}

function ToolsPanel(){
 const [pin,setPin]=useState('');const [area,setArea]=useState('');const [pins,setPins]=useState<any[]>([]);
 const load=useCallback(async()=>{const {data,error}=await supabase.from('serviceable_pincodes').select('*').order('pincode');if(error)toast.error(error.message);setPins(data??[])},[]);useEffect(()=>{void load()},[load]);
 async function add(){const {error}=await supabase.from('serviceable_pincodes').insert({pincode:pin,area});if(error)toast.error(error.message);else{toast.success('Pincode added');setPin('');setArea('');void load()}}
 async function remove(p:string){const {error}=await supabase.from('serviceable_pincodes').delete().eq('pincode',p);if(error)toast.error(error.message);else void load()}
 return <section><h2 className="font-display text-2xl text-ivory">Site tools</h2><p className="mt-1 text-xs text-muted-foreground">Manage serviceable pincodes and operational utilities.</p><div className="mt-6 grid gap-3 md:grid-cols-[180px_1fr_auto]"><input maxLength={6} placeholder="641652" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,''))} className={field}/><input placeholder="Area" value={area} onChange={e=>setArea(e.target.value)} className={field}/><button className={btnGold} onClick={()=>void add()}>Add pincode</button></div><div className="mt-6 flex flex-wrap gap-2">{pins.map(p=><button key={p.pincode} onClick={()=>void remove(p.pincode)} className="rounded-sm border border-gold/30 px-3 py-2 text-xs text-ivory">{p.pincode}{p.area?` · ${p.area}`:''} ×</button>)}</div><div className="mt-10 rounded-sm border border-border p-5"><p className="text-sm text-ivory">Email notifications</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">The booking flow is already email-ready. Add <code>RESEND_API_KEY</code>, <code>KAARAS_NOTIFICATION_EMAIL</code> and optionally <code>KAARAS_FROM_EMAIL</code> to the production server environment to send owner notifications. No secret is exposed to the browser.</p></div></section>
}
