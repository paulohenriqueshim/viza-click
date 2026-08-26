/**
 * Serviços como lista tipográfica, não como grade de cards. A ordem é a
 * ordem de importância comercial: atendimento primeiro, presença digital
 * por último, marcada como complementar.
 */
const FRENTES = [
  {
    numero: "01",
    titulo: "Atendimento que não dorme",
    desc: "Agentes de IA que respondem seu cliente na hora, entendem o pedido, separam quem tem interesse real e cobram o retorno que ficou parado. No WhatsApp e no site.",
  },
  {
    numero: "02",
    titulo: "Operação no automático",
    desc: "Fluxos que assumem o trabalho repetitivo do administrativo e fazem as ferramentas que você já usa conversarem entre si, sem ninguém digitando no meio.",
  },
  {
    numero: "03",
    titulo: "Sistema sob medida",
    desc: "Quando o seu processo é específico demais pra caber em ferramenta pronta, a gente constrói o sistema em volta dele em vez de te obrigar a mudar como você trabalha.",
  },
  {
    numero: "04",
    titulo: "Presença digital",
    desc: "Sites e páginas comerciais rápidas, pra quem chega entender o que você faz e falar com você. Entra como porta de entrada da operação, não como o centro dela.",
    complementar: true,
  },
];

export default function Servicos() {
  return (
    <section id="solucoes" className="px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[110rem]">
        <p
          className="type-label text-fg-muted"
          data-animate-variant="slide"
          data-animate-on-scroll="true"
        >
          O que a gente constrói
        </p>

        <div className="mt-14 md:mt-20">
          {FRENTES.map((frente) => (
            <article
              key={frente.numero}
              className="group grid gap-6 border-t border-border py-10 last:border-b md:grid-cols-[6rem_minmax(0,1.1fr)_minmax(0,1fr)] md:items-start md:gap-12 md:py-14"
            >
              <span className="type-label text-accent">{frente.numero}</span>

              <h3
                className="type-lg transition-colors duration-300 group-hover:text-accent"
                data-animate-variant="slide"
                data-animate-on-scroll="true"
              >
                {frente.titulo}
              </h3>

              <div>
                <p
                  className="type-body max-w-xl text-fg-muted"
                  data-animate-variant="slide"
                  data-animate-on-scroll="true"
                >
                  {frente.desc}
                </p>
                {frente.complementar ? (
                  <p className="type-label mt-5 text-fg-muted">
                    Serviço complementar
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        <p className="type-label mt-10 max-w-2xl text-fg-muted">
          Também produzimos conteúdo com IA para redes sociais dentro de
          projetos já em andamento.
        </p>
      </div>
    </section>
  );
}
