import Logo from "./Logo";
import { WHATSAPP_URL } from "@/lib/contact";

const NAV = [
  { label: "Soluções", href: "#solucoes" },
  { label: "Processo", href: "#como-funciona" },
  { label: "Clientes", href: "#clientes" },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 px-6 py-5 md:px-10">
      <a
        href="#"
        className="flex shrink-0 items-center gap-2.5 text-accent transition-opacity hover:opacity-70"
      >
        <Logo size={24} />
        <span className="type-label text-fg">Viza Click</span>
      </a>

      <nav className="hidden items-center gap-10 lg:flex">
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="type-label text-fg-muted transition-colors hover:text-accent"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="type-label shrink-0 bg-accent px-5 py-3 text-bg transition-opacity hover:opacity-90"
      >
        Falar agora
      </a>
    </header>
  );
}
