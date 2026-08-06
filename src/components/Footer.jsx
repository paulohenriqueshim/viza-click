import { INSTAGRAM_URL, EMAIL } from "@/lib/contact";

export default function Footer() {
  return (
    <footer className="px-6 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-border text-sm text-fg-muted">
      <p>© 2026 Viza Click</p>
      <div className="flex items-center gap-6">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent transition-colors"
        >
          Instagram
        </a>
        <a href={`mailto:${EMAIL}`} className="hover:text-accent transition-colors">
          {EMAIL}
        </a>
      </div>
    </footer>
  );
}
