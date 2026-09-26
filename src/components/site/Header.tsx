import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUSINESS, whatsappLink } from "@/config/site";
import { WhatsAppIcon } from "./WhatsAppButton";
import kaarasLogo from "@/assets/kaaras-logo.png";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/bridal", label: "Bridal" },
  { to: "/jewellery", label: "Jewellery" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || open
          ? "bg-background/92 backdrop-blur-md border-b border-border"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-20 md:px-8">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3"
          aria-label={`${BUSINESS.shortName} home`}
        >
          <img
            src={kaarasLogo}
            alt="Kaara's Makeover & Salon"
            className="h-9 w-auto rounded-sm bg-white object-contain md:h-10"
            width={1365}
            height={1024}
            decoding="async"
          />
          <span className="font-display text-xl tracking-[0.18em] text-ivory md:text-2xl">
            {BUSINESS.shortName.toUpperCase()}
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-gold" }}
              inactiveProps={{ className: "text-ivory/75 hover:text-gold" }}
              className="text-[0.72rem] uppercase tracking-[0.26em] transition-colors duration-300"
            >
              {item.label}
            </Link>
          ))}
          <Link to="/book" className="rounded-sm bg-gold px-5 py-2.5 text-[0.7rem] uppercase tracking-[0.22em] text-primary-foreground transition-colors hover:bg-gold-soft">Book</Link>
          <a
            href={whatsappLink("general")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm border border-gold/50 px-5 py-2.5 text-[0.7rem] uppercase tracking-[0.22em] text-gold transition-colors duration-300 hover:bg-gold hover:text-primary-foreground"
          >
            <WhatsAppIcon />
            Contact
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 p-2 text-gold md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-border bg-background/98 backdrop-blur-md md:hidden"
      >
        <nav className="flex flex-col px-5 py-6" aria-label="Mobile">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-gold" }}
              inactiveProps={{ className: "text-ivory/85" }}
              className="border-b border-border/60 py-4 font-display text-2xl tracking-wide"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/book"
            onClick={() => setOpen(false)}
            className="mt-6 inline-flex items-center justify-center rounded-sm bg-gold px-6 py-4 text-[0.75rem] uppercase tracking-[0.2em] text-primary-foreground"
          >
            Book an Appointment
          </Link>
          <a
            href={whatsappLink("general")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-6 inline-flex items-center justify-center gap-2.5 rounded-sm bg-whatsapp px-6 py-4 text-[0.75rem] uppercase tracking-[0.2em] text-whatsapp-foreground"
          >
            <WhatsAppIcon />
            Contact on WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}
