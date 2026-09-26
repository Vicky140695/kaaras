import { Reveal } from "./Reveal";
import { WhatsAppCta } from "./WhatsAppButton";
import type { WhatsAppIntent } from "@/config/site";

export function ServiceCard({
  image,
  alt,
  title,
  description,
  items,
  price,
  intent = "services",
  extra,
  delay = 0,
}: {
  image: string;
  alt: string;
  title: string;
  description: string;
  items: string[];
  price?: string | null | undefined;
  intent?: WhatsAppIntent | undefined;
  extra?: string | undefined;
  delay?: number | undefined;
}) {
  return (
    <Reveal
      as="article"
      delay={delay}
      className="group surface-panel overflow-hidden rounded-sm"
    >
      <div className="relative aspect-4/5 overflow-hidden">
        <img
          src={image}
          alt={alt}
          loading="lazy"
          width={900}
          height={1100}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
      </div>
      <div className="p-6 md:p-7">
        <h3 className="text-2xl text-ivory">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <ul className="mt-5 space-y-2 text-[0.78rem] uppercase tracking-[0.16em] text-ivory/70">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className="mt-2 h-px w-4 shrink-0 bg-gold" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        {price ? <p className="mt-5 text-sm text-gold">{price}</p> : null}
        <WhatsAppCta
          intent={intent}
          extra={extra}
          label="Enquire"
          variant="outline"
          className="mt-7 w-full"
        />
      </div>
    </Reveal>
  );
}
