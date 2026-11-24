import Logo from "./Logo";
import BotaoWhatsApp from "./BotaoWhatsApp";

const NAV = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Serviços", href: "#servicos" },
  { label: "A Lia", href: "#lia" },
  { label: "Clientes", href: "#clientes" },
];

/**
 * Header com o WhatsApp sempre à mão (24/11/2026).
 *
 * Histórico: o CTA "Falar agora" saiu daqui em 27/08/2026 porque competia
 * com o botão flutuante da Lia. Esse botão flutuante saiu em 09/09/2026, e
 * desde os Reels da escala chega muita gente do Instagram querendo falar
 * com o Paulo na hora. O header é fixo, então é o único lugar que fica
 * visível a página inteira sem acrescentar mais um elemento flutuante. No
 * celular, onde o menu some, o botão fica sozinho no canto e vira o atalho
 * principal.
 *
 * O fundo carvão sólido entrou junto: sem ele, o menu e o logo ficavam por
 * cima do texto das seções ao rolar. Com 95% ainda vazava um fantasma dos
 * títulos brancos gigantes, por isso é 100%. Sem blur de propósito, que
 * custa caro em PC fraco (faxina de performance de 15/09/2026). No topo da
 * página o fundo é da mesma cor da página, então não aparece.
 */
export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 bg-bg px-6 py-4 md:px-10 md:py-5">
      <a
        href="#"
        className="flex shrink-0 items-center gap-2.5 text-accent transition-opacity hover:opacity-70"
      >
        <Logo size={24} />
        <span className="type-label text-fg">Viza Click</span>
      </a>

      <div className="flex items-center gap-10">
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

        <BotaoWhatsApp tamanho="compacto" seta={false}>
          <span className="sm:hidden">WhatsApp</span>
          <span className="hidden sm:inline">Falar no WhatsApp</span>
        </BotaoWhatsApp>
      </div>
    </header>
  );
}
