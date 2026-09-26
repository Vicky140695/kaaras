import type { PriceCategory } from "@/lib/content.functions";
import { formatRupees } from "@/lib/format";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { WhatsAppCta } from "./WhatsAppButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/** Salon services & price list. Edited from Admin → Price list. */
export function PriceList({ categories }: { categories: PriceCategory[] }) {
  if (categories.length === 0) return null;
  const first = categories[0]?.id;

  return (
    <section id="prices" className="scroll-mt-20 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Price list"
          title="Salon services & prices"
          intro="Tap a category to see its services. Message us on WhatsApp to book."
        />

        <Reveal className="mt-12">
          <Accordion
            type="multiple"
            {...(first ? { defaultValue: [first] } : {})}
            className="space-y-3"
          >
            {categories.map((category) => (
              <AccordionItem
                key={category.id}
                value={category.id}
                className="surface-panel rounded-sm border border-border/70 px-5 md:px-7"
              >
                <AccordionTrigger className="py-5 hover:no-underline">
                  <span className="flex flex-col items-start gap-1 pr-4 sm:flex-row sm:items-baseline sm:gap-4">
                    <span className="font-display text-2xl text-ivory md:text-3xl">
                      {category.title}
                    </span>
                    {category.starting_from !== null ? (
                      <span className="text-[0.68rem] uppercase tracking-[0.2em] text-gold">
                        Starting from {formatRupees(category.starting_from)}
                      </span>
                    ) : null}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="divide-y divide-border/60">
                    {category.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-baseline justify-between gap-6 py-3 text-sm md:text-base"
                      >
                        <span className="text-ivory/85">{item.name}</span>
                        <span className="shrink-0 tabular-nums text-gold">
                          {item.price !== null ? formatRupees(item.price) : "Enquire"}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <WhatsAppCta
                    intent="services"
                    extra={`Interested in: ${category.title}`}
                    label={`Book ${category.title}`}
                    variant="outline"
                    className="mt-5 w-full sm:w-auto"
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
