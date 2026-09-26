import { Link } from "@tanstack/react-router";
import { Clock, Instagram, MapPin, Phone } from "lucide-react";
import { BUSINESS, whatsappLink } from "@/config/site";
import { WhatsAppIcon } from "./WhatsAppButton";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="font-display text-3xl tracking-[0.3em] gold-text">
              KAARAS
            </p>
            <p className="mt-2 text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
              Beauty Saloon &amp; Makeover
            </p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {BUSINESS.anniversaryYears} years of bridal artistry, salon care
              and handpicked jewellery in {BUSINESS.city}.
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="eyebrow">Explore</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link to="/" className="text-ivory/80 transition-colors hover:text-gold">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/bridal" className="text-ivory/80 transition-colors hover:text-gold">
                  Bridal
                </Link>
              </li>
              <li>
                <Link to="/jewellery" className="text-ivory/80 transition-colors hover:text-gold">
                  Jewellery
                </Link>
              </li>
              <li>
                <Link to="/book" className="text-ivory/80 transition-colors hover:text-gold">
                  Book an appointment
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-ivory/80 transition-colors hover:text-gold">
                  Returns &amp; support
                </Link>
              </li>
              <li>
                <a href="/#prices" className="text-ivory/80 transition-colors hover:text-gold">
                  Price list
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink("general")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ivory/80 transition-colors hover:text-gold"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <p className="eyebrow">Visit &amp; book</p>
            <a
              href={BUSINESS.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-start gap-3 text-sm text-muted-foreground transition-colors hover:text-gold"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <span>{BUSINESS.addressLine}</span>
            </a>
            <p className="mt-4 flex items-start gap-3 text-sm text-muted-foreground">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <span>{BUSINESS.hours}</span>
            </p>
            <a
              href={BUSINESS.phoneHref}
              className="mt-4 flex items-start gap-3 text-sm text-muted-foreground transition-colors hover:text-gold"
            >
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <span>{BUSINESS.phone}</span>
            </a>
            <a
              href={BUSINESS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-start gap-3 text-sm text-muted-foreground transition-colors hover:text-gold"
            >
              <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <span>{BUSINESS.instagramHandle}</span>
            </a>
            <a
              href={whatsappLink("general")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2.5 rounded-sm border border-gold/45 px-5 py-3 text-[0.7rem] uppercase tracking-[0.22em] text-gold transition-colors hover:bg-gold hover:text-primary-foreground"
            >
              <WhatsAppIcon />
              Message us
            </a>
          </div>

        </div>

        <div className="mt-14 gold-rule" />
        <div className="mt-6 flex flex-col gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {BUSINESS.name}
          </p>
          <p>{BUSINESS.city} · {BUSINESS.region}</p>
        </div>
      </div>
    </footer>
  );
}
