import { WHATSAPP_URL } from "@/lib/contact";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5">
      <a href="#" aria-label="Viza Click" className="flex items-center gap-3">
        <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="var(--bg-elevated)" />
          <circle cx="32" cy="32" r="20" fill="none" stroke="var(--accent)" strokeWidth="4" />
          <circle cx="32" cy="32" r="7" fill="var(--accent)" />
        </svg>
      </a>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium border border-border rounded-full px-5 py-2 hover:border-accent hover:text-accent transition-colors"
      >
        Falar no WhatsApp
      </a>
    </header>
  );
}
