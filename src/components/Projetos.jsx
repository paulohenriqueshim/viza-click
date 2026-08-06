const PROJETOS = [
  {
    titulo: "Este site",
    desc: "Construído com animação 3D e efeitos de scroll pela própria Viza Click. A prova está na tela em que você está agora.",
  },
  {
    titulo: "Bot de atendimento no WhatsApp",
    desc: "Conduz conversa consultiva com IA pra entender a necessidade do lead antes de qualquer venda. Em desenvolvimento.",
  },
];

export default function Projetos() {
  return (
    <section className="px-6 md:px-10 py-24 md:py-32 border-t border-border">
      <p className="font-body text-xs md:text-sm tracking-[0.3em] text-fg-muted uppercase mb-12 text-center">
        O que já construímos
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {PROJETOS.map((projeto) => (
          <div
            key={projeto.titulo}
            className="border border-border rounded-2xl p-8 md:p-10 bg-bg-elevated"
          >
            <h3 className="font-display font-normal uppercase text-xl md:text-2xl tracking-tight mb-3">
              {projeto.titulo}
            </h3>
            <p className="font-body text-fg-muted text-sm md:text-base">
              {projeto.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
