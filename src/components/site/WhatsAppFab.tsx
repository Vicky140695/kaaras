import { whatsappLink } from "@/config/site";
import { WhatsAppIcon } from "./WhatsAppButton";

/** Persistent floating WhatsApp button, mobile and desktop. */
export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink("general")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Kaaras on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-[0_18px_40px_-14px_oklch(0.72_0.16_148/0.7)] transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:bottom-8 md:right-8 md:h-16 md:w-16"
    >
      <WhatsAppIcon className="h-7 w-7 md:h-8 md:w-8" />
    </a>
  );
}
