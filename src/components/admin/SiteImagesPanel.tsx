import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, RotateCcw } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { SITE_MEDIA_BUCKET } from "@/config/storage";
import {
  IMAGE_SLOTS,
  SLOT_GROUPS,
  SLOT_KEYS,
  type SlotKey,
} from "@/config/site-images";
import { publicImageUrl, removeImage, uploadImage } from "@/lib/image-upload";
import { cn } from "@/lib/utils";
import { btnGhost, btnGold, field, labelCls } from "./ui";

type Override = { image_url: string; image_alt: string | null };

/**
 * Admin → Site photos. Lists every replaceable photo on the website with its
 * current picture. "Change photo" uploads the owner's own; "Use sample" goes back.
 */
export function SiteImagesPanel() {
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<SlotKey | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("site_images")
      .select("key, image_url, image_alt");
    if (error) {
      toast.error(`Could not load photos: ${error.message}`);
    } else {
      const next: Record<string, Override> = {};
      for (const row of data ?? []) {
        next[row.key] = { image_url: row.image_url, image_alt: row.image_alt };
      }
      setOverrides(next);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function replace(key: SlotKey, file: File) {
    setBusyKey(key);
    try {
      const existing = overrides[key];
      const path = await uploadImage(SITE_MEDIA_BUCKET, "site", file);
      const { error } = await supabase.from("site_images").upsert(
        { key, image_url: path, image_alt: existing?.image_alt ?? null },
        { onConflict: "key" },
      );
      if (error) {
        await removeImage(SITE_MEDIA_BUCKET, path);
        throw error;
      }
      if (existing) await removeImage(SITE_MEDIA_BUCKET, existing.image_url);
      toast.success("Photo updated — it is live on the website now");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload the photo");
    } finally {
      setBusyKey(null);
    }
  }

  async function saveAlt(key: SlotKey, alt: string) {
    const existing = overrides[key];
    if (!existing) return;
    setBusyKey(key);
    try {
      const { error } = await supabase.from("site_images").upsert(
        { key, image_url: existing.image_url, image_alt: alt.trim() || null },
        { onConflict: "key" },
      );
      if (error) throw error;
      toast.success("Description saved");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusyKey(null);
    }
  }

  async function reset(key: SlotKey) {
    const existing = overrides[key];
    if (!existing) return;
    if (!confirm("Go back to the built-in sample photo for this spot?")) return;
    setBusyKey(key);
    try {
      const { error } = await supabase.from("site_images").delete().eq("key", key);
      if (error) throw error;
      await removeImage(SITE_MEDIA_BUCKET, existing.image_url);
      toast.success("Sample photo restored");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset");
    } finally {
      setBusyKey(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  const total = SLOT_KEYS.length;
  const replaced = SLOT_KEYS.filter((k) => overrides[k]).length;

  return (
    <div>
      <h2 className="font-display text-2xl text-ivory">Site photos</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Every photo on your website is listed here. Tap <strong>Change photo</strong>, choose a
        picture from your phone or computer, and it goes live straight away. Photos are resized
        automatically — you do not need to edit them first.
      </p>
      <p
        className={cn(
          "mt-4 rounded-sm border px-4 py-3 text-sm",
          replaced === total
            ? "border-gold/40 text-gold"
            : "border-border text-muted-foreground",
        )}
      >
        {replaced === total
          ? "All photos are your own."
          : `${total - replaced} of ${total} photos are still built-in SAMPLE pictures, not photos of Kaaras. Replace them before promoting the website.`}
      </p>

      {SLOT_GROUPS.map((group) => {
        const keys = SLOT_KEYS.filter((k) => IMAGE_SLOTS[k].group === group);
        if (keys.length === 0) return null;
        return (
          <section key={group} className="mt-10">
            <h3 className="text-[0.7rem] uppercase tracking-[0.28em] text-gold">{group}</h3>
            <ul className="mt-4 grid gap-5 sm:grid-cols-2">
              {keys.map((key) => (
                <SlotCard
                  key={key}
                  slotKey={key}
                  override={overrides[key]}
                  busy={busyKey === key}
                  onReplace={(file) => replace(key, file)}
                  onSaveAlt={(alt) => saveAlt(key, alt)}
                  onReset={() => reset(key)}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function SlotCard({
  slotKey,
  override,
  busy,
  onReplace,
  onSaveAlt,
  onReset,
}: {
  slotKey: SlotKey;
  override: Override | undefined;
  busy: boolean;
  onReplace: (file: File) => void;
  onSaveAlt: (alt: string) => void;
  onReset: () => void;
}) {
  const slot = IMAGE_SLOTS[slotKey];
  const fileRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState(override?.image_alt ?? "");

  useEffect(() => {
    setAlt(override?.image_alt ?? "");
  }, [override?.image_alt, override?.image_url]);

  const preview = override
    ? publicImageUrl(SITE_MEDIA_BUCKET, override.image_url)
    : slot.src;
  const altChanged = (override?.image_alt ?? "") !== alt.trim();

  return (
    <li className="flex flex-col overflow-hidden rounded-sm border border-border bg-surface">
      <div className="relative aspect-16/10 bg-surface-raised">
        <img
          src={preview}
          alt={override?.image_alt || slot.alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span
          className={cn(
            "absolute left-3 top-3 rounded-sm px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.2em]",
            override ? "bg-gold text-primary-foreground" : "bg-background/85 text-ivory",
          )}
        >
          {override ? "Your photo" : "Sample photo"}
        </span>
        {busy ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="font-display text-xl text-ivory">{slot.label}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{slot.hint}</p>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) onReplace(file);
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className={cn(btnGold, "inline-flex items-center gap-2")}
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            Change photo
          </button>
          {override ? (
            <button
              type="button"
              disabled={busy}
              onClick={onReset}
              className={cn(btnGhost, "inline-flex items-center gap-2")}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Use sample
            </button>
          ) : null}
        </div>

        {override ? (
          <label className="mt-5 block">
            <span className={labelCls}>Describe this photo (for Google &amp; screen readers)</span>
            <div className="mt-2 flex gap-2">
              <input
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                maxLength={160}
                placeholder="e.g. Bride with gold jewellery and jasmine flowers"
                className={cn(field, "mt-0 flex-1")}
              />
              <button
                type="button"
                disabled={busy || !altChanged}
                onClick={() => onSaveAlt(alt)}
                className={btnGhost}
              >
                Save
              </button>
            </div>
          </label>
        ) : null}
      </div>
    </li>
  );
}
