import Logo from "./Logo";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-5">
      {/* O fundo sólido no pill mantém a marca legível quando o texto das
          seções passa por baixo do header fixo, principalmente no mobile. */}
      <a
        href="#"
        className="inline-flex items-center gap-2.5 text-accent bg-bg/85 backdrop-blur-sm border border-border rounded-full pl-3 pr-4 py-2 hover:border-accent transition-colors"
      >
        <Logo size={24} />
        <span className="text-fg font-body font-semibold text-sm md:text-base tracking-tight">
          Viza Click
        </span>
      </a>
    </header>
  );
}
