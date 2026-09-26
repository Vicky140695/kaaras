import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { GalleryItem } from "@/config/site-images";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

/** Photo grid with a full-size viewer. Photos are managed from Admin → Gallery. */
export function GallerySection({
  id,
  eyebrow = "Gallery",
  title,
  intro,
  items,
}: {
  id?: string | undefined;
  eyebrow?: string | undefined;
  title: string;
  intro?: string | undefined;
  items: GalleryItem[];
}) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;
  const count = items.length;

  const step = useCallback(
    (dir: 1 | -1) => {
      setIndex((current) =>
        current === null || count === 0 ? current : (current + dir + count) % count,
      );
    },
    [count],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  if (count === 0) return null;
  const active = index !== null ? items[index] : undefined;

  return (
    <section id={id} className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />

        <ul className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {items.map((item, i) => (
            <Reveal
              as="li"
              key={item.id}
              delay={(i % 3) * 100}
              className="group relative aspect-3/4 overflow-hidden rounded-sm border border-border/60"
            >
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Open photo ${i + 1} of ${count}: ${item.alt}`}
                className="block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                />
              </button>
              {item.caption ? (
                <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-background/90 to-transparent px-4 pb-3 pt-10 text-xs text-ivory/85">
                  {item.caption}
                </p>
              ) : null}
            </Reveal>
          ))}
        </ul>
      </div>

      <Dialog open={open} onOpenChange={(o) => !o && setIndex(null)}>
        <DialogContent className="max-w-4xl border-border bg-surface p-2 sm:p-3">
          <DialogTitle className="sr-only">
            {active?.caption || active?.alt || "Gallery photo"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Photo {index !== null ? index + 1 : 0} of {count}. Use the arrow buttons to
            move between photos.
          </DialogDescription>
          {active ? (
            <div className="relative">
              <img
                src={active.src}
                alt={active.alt}
                className="mx-auto max-h-[80vh] w-auto max-w-full rounded-sm object-contain"
              />
              {active.caption ? (
                <p className="mt-3 text-center text-sm text-muted-foreground">
                  {active.caption}
                </p>
              ) : null}
              {count > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous photo"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-gold transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next photo"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-gold transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
