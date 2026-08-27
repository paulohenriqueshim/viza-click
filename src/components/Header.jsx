import Logo from "./Logo";
import BotaoChat from "./BotaoChat";

const NAV = [
  { label: "Funções", href: "#funcionarios" },
  { label: "Processo", href: "#como-funciona" },
  { label: "Clientes", href: "#clientes" },
];

/**
 * O CTA fixo abre a Lia, não o WhatsApp direto (decisão de 26/08/2026).
 * O bot de WhatsApp está pausado desde 21/08 em favor deste widget, então
 * o wa.me cai no número pessoal do Paulo, respondido na mão: era o botão
 * mais visível de um site que promete atendimento que não dorme apontando
 * pro único canal que dorme.
 *
 * O WhatsApp não some do funil, só muda de lugar: o ChatWidget oferece o
 * link depois do handoff, quando a Lia já levantou nome, negócio e dor e
 * o Paulo já recebeu o e-mail de resumo.
 */
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

      <BotaoChat className="type-label shrink-0 border border-border px-5 py-3 text-fg transition-colors hover:border-accent hover:text-accent">
        Falar agora
      </BotaoChat>
    </header>
  );
}
