import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { whatsappLink, type WhatsAppIntent } from "@/config/site";

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={cn("h-[1.1em] w-[1.1em]", className)}
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.35c0-4.54 3.7-8.23 8.24-8.23a8.23 8.23 0 0 1 0 16.44Zm4.52-6.16c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.04-.38-1.99-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.48c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

type Variant = "primary" | "outline" | "whatsapp" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-sm px-6 py-3.5 text-[0.78rem] font-normal uppercase tracking-[0.2em] transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const variants: Record<Variant, string> = {
  primary:
    "bg-gold text-primary-foreground hover:bg-gold-soft shadow-[var(--shadow-gold)]",
  outline:
    "border border-gold/45 text-ivory hover:border-gold hover:bg-gold/10",
  whatsapp:
    "bg-whatsapp text-whatsapp-foreground hover:brightness-110 shadow-[0_16px_40px_-22px_oklch(0.72_0.16_148/0.8)]",
  ghost: "text-gold hover:text-gold-soft",
};

export function LinkButton({
  href,
  children,
  variant = "primary",
  className,
  external,
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant | undefined;
  className?: string | undefined;
  external?: boolean | undefined;
  ariaLabel?: string | undefined;
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className={cn(base, variants[variant], className)}
    >
      {children}
    </a>
  );
}

/** WhatsApp CTA with an intent-specific prefilled message. */
export function WhatsAppCta({
  intent = "general",
  label = "Book on WhatsApp",
  extra,
  variant = "whatsapp",
  className,
}: {
  intent?: WhatsAppIntent | undefined;
  label?: string | undefined;
  extra?: string | undefined;
  variant?: Variant | undefined;
  className?: string | undefined;
}) {
  return (
    <LinkButton
      href={whatsappLink(intent, extra)}
      external
      variant={variant}
      className={className}
      ariaLabel={`${label} — opens WhatsApp`}
    >
      <WhatsAppIcon />
      {label}
    </LinkButton>
  );
}
