import Logo from "./Logo";
import { INSTAGRAM_URL, EMAIL } from "@/lib/contact";

export default function Footer() {
  return (
    <footer className="flex flex-col justify-between gap-6 border-t border-border px-6 py-10 md:flex-row md:items-center md:px-10">
      <div className="flex items-center gap-3">
        <span className="text-accent">
          <Logo size={22} />
        </span>
        <p className="type-label text-fg-muted">Viza Click 2026</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="type-label text-fg-muted transition-colors hover:text-accent"
        >
          Instagram
        </a>
        <a
          href={`mailto:${EMAIL}`}
          className="type-label text-fg-muted transition-colors hover:text-accent"
        >
          {EMAIL}
        </a>
      </div>
    </footer>
  );
}
