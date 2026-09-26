import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { SITE_MEDIA_BUCKET } from "@/config/storage";
import { GALLERY_PAGES, type GalleryPage } from "@/config/site-images";
import { publicImageUrl, removeImage, uploadImage } from "@/lib/image-upload";
import { cn } from "@/lib/utils";
import { btnDanger, btnGhost, btnGold, field, labelCls } from "./ui";

type Photo = {
  id: string;
  page: string;
  image_url: string;
  image_alt: string;
  caption: string;
  display_order: number;
  is_published: boolean;
};

/**
 * Admin → Gallery. The owner adds, describes, reorders, hides and deletes the
 * photos shown in the Home and Bridal galleries.
 */
export function GalleryPanel() {
  const [page, setPage] = useState<GalleryPage>("home");
  const [rows, setRows] = useState<Photo[]>([]);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery_images")
      .select("id, page, image_url, image_alt, caption, display_order, is_published")
      .eq("page", page)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) toast.error(`Could not load gallery: ${error.message}`);
    setRows((data ?? []) as Photo[]);
    setDirty(new Set());
    setLoading(false);
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  function edit(id: string, patch: Partial<Photo>) {
    setRows((current) => current.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setDirty((current) => new Set(current).add(id));
  }

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    let order = rows.reduce((max, r) => Math.max(max, r.display_order), 0);
    let added = 0;

    for (const [i, file] of list.entries()) {
      setProgress(`Uploading photo ${i + 1} of ${list.length}…`);
      try {
        const path = await uploadImage(SITE_MEDIA_BUCKET, `gallery/${page}`, file);
        order += 1;
        const { error } = await supabase.from("gallery_images").insert({
          page,
          image_url: path,
          image_alt: "",
          caption: "",
          display_order: order,
          is_published: true,
        });
        if (error) {
          await removeImage(SITE_MEDIA_BUCKET, path);
          throw error;
        }
        added += 1;
      } catch (err) {
        toast.error(
          `${file.name}: ${err instanceof Error ? err.message : "could not upload"}`,
        );
      }
    }

    setProgress(null);
    if (added > 0) {
      toast.success(
        added === 1
          ? "Photo added — add a short description below"
          : `${added} photos added — add a short description to each`,
      );
    }
    await load();
  }

  async function save(row: Photo) {
    setBusyId(row.id);
    try {
      const { error } = await supabase
        .from("gallery_images")
        .update({
          image_alt: row.image_alt.trim(),
          caption: row.caption.trim(),
          is_published: row.is_published,
        })
        .eq("id", row.id);
      if (error) throw error;
      toast.success("Saved");
      setDirty((current) => {
        const next = new Set(current);
        next.delete(row.id);
        return next;
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(row: Photo) {
    if (!confirm("Delete this photo from the gallery? This cannot be undone.")) return;
    setBusyId(row.id);
    try {
      const { error } = await supabase.from("gallery_images").delete().eq("id", row.id);
      if (error) throw error;
      await removeImage(SITE_MEDIA_BUCKET, row.image_url);
      toast.success("Photo deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setBusyId(null);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    const a = rows[index];
    const b = rows[target];
    if (!a || !b) return;

    // Re-number the whole list 1..n so order is always clean and unambiguous.
    const reordered = rows.slice();
    reordered[index] = b;
    reordered[target] = a;
    setBusyId(a.id);
    try {
      const results = await Promise.all(
        reordered.map((r, i) =>
          supabase.from("gallery_images").update({ display_order: i + 1 }).eq("id", r.id),
        ),
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      setRows(reordered.map((r, i) => ({ ...r, display_order: i + 1 })));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reorder");
    } finally {
      setBusyId(null);
    }
  }

  const publishedCount = rows.filter((r) => r.is_published).length;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ivory">Gallery</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Add photos of your work. Tap <strong>Add photos</strong>, pick one or many pictures,
            then give each a short description. Use the arrows to change the order. Photos are
            resized automatically.
          </p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              const files = e.target.files;
              void addFiles(files).finally(() => {
                if (fileRef.current) fileRef.current.value = "";
              });
            }}
          />
          <button
            type="button"
            disabled={progress !== null}
            onClick={() => fileRef.current?.click()}
            className={cn(btnGold, "inline-flex items-center gap-2")}
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            Add photos
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Choose gallery">
        {GALLERY_PAGES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPage(p.id)}
            aria-pressed={page === p.id}
            className={cn(
              "rounded-sm border px-4 py-2 text-[0.66rem] uppercase tracking-[0.18em] transition-colors",
              page === p.id
                ? "border-gold bg-gold text-primary-foreground"
                : "border-gold/35 text-ivory/80 hover:border-gold hover:text-gold",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {publishedCount === 0 ? (
        <p className="mt-5 rounded-sm border border-border px-4 py-3 text-sm text-muted-foreground">
          You have no published photos here yet, so the website is showing built-in SAMPLE
          pictures (not photos of Kaaras). As soon as you publish one photo, the samples
          disappear and only your photos show.
        </p>
      ) : null}

      {progress ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-gold">
          <Loader2 className="h-4 w-4 animate-spin" /> {progress}
        </p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No photos added yet.</p>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row, i) => (
            <li
              key={row.id}
              className="flex flex-col overflow-hidden rounded-sm border border-border bg-surface"
            >
              <div className="relative aspect-3/4 bg-surface-raised">
                <img
                  src={publicImageUrl(SITE_MEDIA_BUCKET, row.image_url)}
                  alt={row.image_alt || "Gallery photo"}
                  loading="lazy"
                  className={cn(
                    "h-full w-full object-cover",
                    !row.is_published && "opacity-40",
                  )}
                />
                <span className="absolute left-3 top-3 rounded-sm bg-background/85 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.2em] text-ivory">
                  #{i + 1} · {row.is_published ? "Shown" : "Hidden"}
                </span>
                {busyId === row.id ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <Loader2 className="h-6 w-6 animate-spin text-gold" />
                  </div>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col gap-4 p-4">
                <label className="block">
                  <span className={labelCls}>Description (for Google &amp; screen readers)</span>
                  <input
                    value={row.image_alt}
                    onChange={(e) => edit(row.id, { image_alt: e.target.value })}
                    maxLength={160}
                    placeholder="e.g. Bride with jasmine braid and gold jewellery"
                    className={field}
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Caption on the photo (optional)</span>
                  <input
                    value={row.caption}
                    onChange={(e) => edit(row.id, { caption: e.target.value })}
                    maxLength={100}
                    className={field}
                  />
                </label>
                <label className="flex items-center gap-2.5 text-sm text-ivory/85">
                  <input
                    type="checkbox"
                    checked={row.is_published}
                    onChange={(e) => edit(row.id, { is_published: e.target.checked })}
                    className="h-4 w-4 accent-[var(--gold)]"
                  />
                  Show on website
                </label>

                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busyId !== null || !dirty.has(row.id)}
                    onClick={() => save(row)}
                    className={btnGold}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    disabled={busyId !== null || i === 0}
                    onClick={() => move(i, -1)}
                    aria-label="Move earlier"
                    className={btnGhost}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={busyId !== null || i === rows.length - 1}
                    onClick={() => move(i, 1)}
                    aria-label="Move later"
                    className={btnGhost}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => remove(row)}
                    aria-label="Delete photo"
                    className={cn(btnDanger, "ml-auto")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
