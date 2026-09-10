import BotaoChat from "./BotaoChat";

/**
 * A prova de que o serviço existe: a própria Lia atendendo neste site.
 *
 * Era um bloco no fim de Serviços até 09/09/2026, quando virou seção
 * própria e subiu pra logo depois do Manifesto. O motivo: a promessa de
 * "roda sozinho" pede demonstração imediata, não uma lista de funções
 * antes. Quem acabou de ler que o processo roda sozinho consegue testar
 * isso na linha seguinte, em vez de rolar a página inteira até achar.
 */
export default function Lia() {
  return (
    <section
      id="lia"
      className="border-t border-border px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-[110rem]">
        <p
          className="type-label text-accent"
          data-animate-variant="slide"
          data-animate-on-scroll="true"
        >
          Rodando agora
        </p>

        <h2
          className="type-lg mt-8 max-w-[20ch]"
          data-animate-variant="slide"
          data-animate-on-scroll="true"
        >
          A Lia é um funcionário digital da Viza
        </h2>

        <div className="mt-12 flex flex-col gap-10 md:mt-16 md:flex-row md:items-end md:justify-between">
          <p
            className="type-body max-w-xl text-fg-muted"
            data-animate-variant="slide"
            data-animate-on-scroll="true"
          >
            Ela atende quem chega neste site, entende o caso e me passa a
            conversa quando faz sentido. É o mesmo tipo de atendimento que
            entra na sua empresa. Fala com ela e vê funcionando antes de
            decidir qualquer coisa.
          </p>

          <BotaoChat variante="contorno" className="shrink-0">
            Falar com a Lia
          </BotaoChat>
        </div>
      </div>
    </section>
  );
}
