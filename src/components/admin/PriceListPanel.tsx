import { useCallback, useEffect, useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { formatRupees } from "@/lib/format";
import { cn } from "@/lib/utils";
import { btnDanger, btnGhost, btnGold, field, labelCls } from "./ui";

type Item = {
  id: string;
  category_id: string;
  name: string;
  price: number | null;
  display_order: number;
  is_published: boolean;
};

type Category = {
  id: string;
  title: string;
  starting_from: number | null;
  display_order: number;
  is_published: boolean;
  items: Item[];
};

const ITEM_COLUMNS = "id, category_id, name, price, display_order, is_published";

/** "" -> null (shown as "Enquire"); otherwise a whole, non-negative rupee amount. */
function parseRupees(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Math.round(Number(raw));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/**
 * Admin → Price list. The owner edits categories (Pedicure, Waxing …) and the
 * services inside them: name, price, "starting from", order, show/hide.
 * Edit any fields, then press "Save changes" on that category.
 */
export function PriceListPanel() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [dirtyCats, setDirtyCats] = useState<Set<string>>(new Set());
  const [dirtyItems, setDirtyItems] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    const [catRes, itemRes] = await Promise.all([
      supabase
        .from("price_categories")
        .select("id, title, starting_from, display_order, is_published")
        .order("display_order", { ascending: true }),
      supabase
        .from("price_items")
        .select(ITEM_COLUMNS)
        .order("display_order", { ascending: true }),
    ]);
    if (catRes.error) toast.error(`Could not load prices: ${catRes.error.message}`);
    if (itemRes.error) toast.error(`Could not load prices: ${itemRes.error.message}`);

    const items = (itemRes.data ?? []) as Item[];
    const loaded = (catRes.data ?? []).map((c) => ({
      ...c,
      items: items.filter((i) => i.category_id === c.id),
    }));
    setCats(loaded);
    const firstId = loaded[0]?.id;
    setOpenIds(firstId ? new Set([firstId]) : new Set());
    setDirtyCats(new Set());
    setDirtyItems(new Set());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /* ---------- local edits ---------- */

  function editCategory(id: string, patch: Partial<Omit<Category, "items">>) {
    setCats((cur) => cur.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    setDirtyCats((cur) => new Set(cur).add(id));
  }

  function editItem(catId: string, itemId: string, patch: Partial<Item>) {
    setCats((cur) =>
      cur.map((c) =>
        c.id === catId
          ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }
          : c,
      ),
    );
    setDirtyItems((cur) => new Set(cur).add(itemId));
  }

  function isCategoryDirty(cat: Category) {
    return dirtyCats.has(cat.id) || cat.items.some((i) => dirtyItems.has(i.id));
  }

  /* ---------- saving ---------- */

  async function saveCategory(cat: Category) {
    if (!cat.title.trim()) {
      toast.error("Please give the category a name");
      return;
    }
    const changedItems = cat.items.filter((i) => dirtyItems.has(i.id));
    if (changedItems.some((i) => !i.name.trim())) {
      toast.error("Every service needs a name");
      return;
    }

    setBusy(cat.id);
    try {
      if (dirtyCats.has(cat.id)) {
        const { error } = await supabase
          .from("price_categories")
          .update({
            title: cat.title.trim(),
            starting_from: cat.starting_from,
            is_published: cat.is_published,
          })
          .eq("id", cat.id);
        if (error) throw error;
      }

      const results = await Promise.all(
        changedItems.map((i) =>
          supabase
            .from("price_items")
            .update({ name: i.name.trim(), price: i.price, is_published: i.is_published })
            .eq("id", i.id),
        ),
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;

      setDirtyCats((cur) => {
        const next = new Set(cur);
        next.delete(cat.id);
        return next;
      });
      setDirtyItems((cur) => {
        const next = new Set(cur);
        for (const i of changedItems) next.delete(i.id);
        return next;
      });
      toast.success(`${cat.title.trim()} saved — live on the website`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(null);
    }
  }

  /* ---------- add / delete / reorder (saved immediately) ---------- */

  async function addCategory() {
    setBusy("new-category");
    try {
      const order = cats.reduce((m, c) => Math.max(m, c.display_order), 0) + 1;
      const { data, error } = await supabase
        .from("price_categories")
        .insert({ title: "New category", display_order: order })
        .select("id, title, starting_from, display_order, is_published")
        .single();
      if (error) throw error;
      setCats((cur) => [...cur, { ...data, items: [] }]);
      setOpenIds((cur) => new Set(cur).add(data.id));
      toast.success("Category added — give it a name and add services");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add category");
    } finally {
      setBusy(null);
    }
  }

  async function deleteCategory(cat: Category) {
    const extra = cat.items.length > 0 ? ` and its ${cat.items.length} services` : "";
    if (!confirm(`Delete “${cat.title}”${extra}? This cannot be undone.`)) return;
    setBusy(cat.id);
    try {
      const { error } = await supabase.from("price_categories").delete().eq("id", cat.id);
      if (error) throw error;
      setCats((cur) => cur.filter((c) => c.id !== cat.id));
      toast.success("Category deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setBusy(null);
    }
  }

  async function addItem(cat: Category) {
    setBusy(cat.id);
    try {
      const order = cat.items.reduce((m, i) => Math.max(m, i.display_order), 0) + 1;
      const { data, error } = await supabase
        .from("price_items")
        .insert({ category_id: cat.id, name: "New service", display_order: order })
        .select(ITEM_COLUMNS)
        .single();
      if (error) throw error;
      setCats((cur) =>
        cur.map((c) => (c.id === cat.id ? { ...c, items: [...c.items, data as Item] } : c)),
      );
      // A new row still has the placeholder name, so make the owner review it.
      setDirtyItems((cur) => new Set(cur).add(data.id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add service");
    } finally {
      setBusy(null);
    }
  }

  async function deleteItem(cat: Category, item: Item) {
    if (!confirm(`Delete “${item.name}”?`)) return;
    setBusy(cat.id);
    try {
      const { error } = await supabase.from("price_items").delete().eq("id", item.id);
      if (error) throw error;
      setCats((cur) =>
        cur.map((c) =>
          c.id === cat.id ? { ...c, items: c.items.filter((i) => i.id !== item.id) } : c,
        ),
      );
      setDirtyItems((cur) => {
        const next = new Set(cur);
        next.delete(item.id);
        return next;
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setBusy(null);
    }
  }

  async function moveCategory(index: number, dir: -1 | 1) {
    const a = cats[index];
    const b = cats[index + dir];
    if (!a || !b) return;
    const reordered = cats.slice();
    reordered[index] = b;
    reordered[index + dir] = a;
    setBusy(a.id);
    try {
      const results = await Promise.all(
        reordered.map((c, i) =>
          supabase.from("price_categories").update({ display_order: i + 1 }).eq("id", c.id),
        ),
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      setCats(reordered.map((c, i) => ({ ...c, display_order: i + 1 })));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reorder");
    } finally {
      setBusy(null);
    }
  }

  async function moveItem(cat: Category, index: number, dir: -1 | 1) {
    const a = cat.items[index];
    const b = cat.items[index + dir];
    if (!a || !b) return;
    const reordered = cat.items.slice();
    reordered[index] = b;
    reordered[index + dir] = a;
    setBusy(cat.id);
    try {
      const results = await Promise.all(
        reordered.map((i, n) =>
          supabase.from("price_items").update({ display_order: n + 1 }).eq("id", i.id),
        ),
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      setCats((cur) =>
        cur.map((c) =>
          c.id === cat.id
            ? { ...c, items: reordered.map((i, n) => ({ ...i, display_order: n + 1 })) }
            : c,
        ),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reorder");
    } finally {
      setBusy(null);
    }
  }

  function onToggle(id: string, e: SyntheticEvent<HTMLDetailsElement>) {
    const isOpen = e.currentTarget.open;
    setOpenIds((cur) => {
      const next = new Set(cur);
      if (isOpen) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ivory">Price list</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            This is the price list shown on the Home page. Open a category, change any name or
            price, then press <strong>Save changes</strong>. Leave a price empty to show
            “Enquire”. Uncheck <strong>Show</strong> to hide something without deleting it.
          </p>
        </div>
        <button
          type="button"
          disabled={busy !== null}
          onClick={addCategory}
          className={cn(btnGold, "inline-flex items-center gap-2")}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add category
        </button>
      </div>

      {cats.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No categories yet. Press “Add category” to start.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {cats.map((cat, ci) => {
            const dirty = isCategoryDirty(cat);
            const working = busy === cat.id;
            return (
              <li key={cat.id} className="rounded-sm border border-border bg-surface">
                <details open={openIds.has(cat.id)} onToggle={(e) => onToggle(cat.id, e)}>
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <span className="font-display text-xl text-ivory">
                      {cat.title || "Untitled"}
                      {!cat.is_published ? (
                        <span className="ml-3 text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                          Hidden
                        </span>
                      ) : null}
                    </span>
                    <span className="flex items-center gap-3 text-xs text-muted-foreground">
                      {cat.starting_from !== null
                        ? `From ${formatRupees(cat.starting_from)} · `
                        : ""}
                      {cat.items.length} services
                      {dirty ? <span className="text-gold">· unsaved changes</span> : null}
                    </span>
                  </summary>

                  <div className="border-t border-border px-5 py-5">
                    <div className="grid gap-4 sm:grid-cols-[1fr_11rem]">
                      <label className="block">
                        <span className={labelCls}>Category name</span>
                        <input
                          value={cat.title}
                          onChange={(e) => editCategory(cat.id, { title: e.target.value })}
                          maxLength={60}
                          className={field}
                        />
                      </label>
                      <label className="block">
                        <span className={labelCls}>“Starting from” (₹)</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step={1}
                          value={cat.starting_from ?? ""}
                          onChange={(e) =>
                            editCategory(cat.id, { starting_from: parseRupees(e.target.value) })
                          }
                          placeholder="Hidden"
                          className={field}
                        />
                      </label>
                    </div>
                    <label className="mt-4 flex items-center gap-2.5 text-sm text-ivory/85">
                      <input
                        type="checkbox"
                        checked={cat.is_published}
                        onChange={(e) => editCategory(cat.id, { is_published: e.target.checked })}
                        className="h-4 w-4 accent-[var(--gold)]"
                      />
                      Show this category on the website
                    </label>

                    <p className={cn(labelCls, "mt-7")}>Services</p>
                    {cat.items.length === 0 ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        No services yet. Press “Add service”.
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-3">
                        {cat.items.map((item, ii) => (
                          <li
                            key={item.id}
                            className="rounded-sm border border-border/70 p-3 sm:flex sm:items-center sm:gap-3"
                          >
                            <input
                              value={item.name}
                              onChange={(e) => editItem(cat.id, item.id, { name: e.target.value })}
                              maxLength={80}
                              aria-label="Service name"
                              className={cn(field, "mt-0 sm:flex-1")}
                            />
                            <div className="mt-3 flex flex-wrap items-center gap-3 sm:mt-0">
                              <div className="relative w-28">
                                <span
                                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                                  aria-hidden="true"
                                >
                                  ₹
                                </span>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min={0}
                                  step={1}
                                  value={item.price ?? ""}
                                  onChange={(e) =>
                                    editItem(cat.id, item.id, { price: parseRupees(e.target.value) })
                                  }
                                  placeholder="Enquire"
                                  aria-label={`Price for ${item.name}`}
                                  className={cn(field, "mt-0 pl-7")}
                                />
                              </div>
                              <label className="flex items-center gap-2 text-xs text-ivory/85">
                                <input
                                  type="checkbox"
                                  checked={item.is_published}
                                  onChange={(e) =>
                                    editItem(cat.id, item.id, { is_published: e.target.checked })
                                  }
                                  className="h-4 w-4 accent-[var(--gold)]"
                                />
                                Show
                              </label>
                              <div className="ml-auto flex gap-1.5">
                                <button
                                  type="button"
                                  disabled={busy !== null || ii === 0}
                                  onClick={() => moveItem(cat, ii, -1)}
                                  aria-label="Move up"
                                  className={cn(btnGhost, "px-2.5")}
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  disabled={busy !== null || ii === cat.items.length - 1}
                                  onClick={() => moveItem(cat, ii, 1)}
                                  aria-label="Move down"
                                  className={cn(btnGhost, "px-2.5")}
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  disabled={busy !== null}
                                  onClick={() => deleteItem(cat, item)}
                                  aria-label={`Delete ${item.name}`}
                                  className={cn(btnDanger, "px-2.5")}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={busy !== null || !dirty}
                        onClick={() => saveCategory(cat)}
                        className={cn(btnGold, "inline-flex items-center gap-2")}
                      >
                        {working ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Save changes
                      </button>
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => addItem(cat)}
                        className={cn(btnGhost, "inline-flex items-center gap-2")}
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Add service
                      </button>
                      <span className="ml-auto flex gap-1.5">
                        <button
                          type="button"
                          disabled={busy !== null || ci === 0}
                          onClick={() => moveCategory(ci, -1)}
                          aria-label="Move category up"
                          className={cn(btnGhost, "px-2.5")}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={busy !== null || ci === cats.length - 1}
                          onClick={() => moveCategory(ci, 1)}
                          aria-label="Move category down"
                          className={cn(btnGhost, "px-2.5")}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={busy !== null}
                          onClick={() => deleteCategory(cat)}
                          aria-label={`Delete ${cat.title}`}
                          className={cn(btnDanger, "px-2.5")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </span>
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
