import Logo from "./Logo";

const NAV = [
  { label: "Funções", href: "#funcionarios" },
  { label: "Processo", href: "#como-funciona" },
  { label: "Clientes", href: "#clientes" },
];

/**
 * Header sem CTA próprio (decisão de 27/08/2026): o botão "Falar agora" no
 * canto superior competia visualmente com o botão flutuante da Lia, que já
 * fica fixo na tela inteira e faz o mesmo trabalho. A entrada pro chat
 * continua no botão flutuante (ChatWidget) e nos CTAs de Serviços e do
 * fechamento da página.
 *
 * O WhatsApp não some do funil: o ChatWidget oferece o link depois do
 * handoff, quando a Lia já levantou nome, negócio e dor e o Paulo já
 * recebeu o e-mail de resumo.
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
    </header>
  );
}
