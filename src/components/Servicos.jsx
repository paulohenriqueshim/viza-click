const SERVICOS = [
  {
    titulo: "Chatbot com IA",
    desc: "Atendimento automático e inteligente pros seus clientes, a qualquer hora.",
  },
  {
    titulo: "Automações",
    desc: "Processos repetitivos rodando sozinhos, sem depender de você o dia inteiro.",
  },
  {
    titulo: "Landing Pages",
    desc: "Sites rápidos e certeiros, feitos pra converter visita em cliente.",
  },
  {
    titulo: "Conteúdo para Instagram",
    desc: "Imagens, vídeos e carrosséis criados com IA pra manter seu perfil sempre ativo.",
  },
];

export default function Servicos() {
  return (
    <section className="px-6 md:px-10 py-24 md:py-32">
      <p className="font-body text-xs md:text-sm tracking-[0.3em] text-fg-muted uppercase mb-12 text-center">
        O que fazemos
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border max-w-5xl mx-auto border border-border rounded-2xl overflow-hidden">
        {SERVICOS.map((servico) => (
          <div
            key={servico.titulo}
            className="bg-bg p-8 md:p-12 hover:bg-bg-elevated transition-colors"
          >
            <h3 className="font-display font-normal uppercase text-2xl md:text-3xl tracking-tight mb-3">
              {servico.titulo}
            </h3>
            <p className="font-body text-fg-muted text-sm md:text-base">
              {servico.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
