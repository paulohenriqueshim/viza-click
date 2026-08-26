/**
 * A transformação contada como uma frase só, quebrada em três blocos de
 * tipo gigante que a pessoa lê enquanto rola: PROCESSO MANUAL / VIRA
 * SISTEMA / QUE RODA SOZINHO. Layout assimétrico de propósito, sem card
 * e sem grade regular.
 */
export default function Manifesto() {
  return (
    <section id="manifesto" className="px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[110rem]">
        <h2
          className="type-xl"
          data-animate-variant="slide"
          data-animate-on-scroll="true"
        >
          Processo manual
        </h2>

        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-2 md:items-end md:gap-20">
          <p
            className="type-body max-w-lg text-fg-muted"
            data-animate-variant="slide"
            data-animate-on-scroll="true"
          >
            Hoje a empresa só anda quando alguém lembra. Mensagem parada
            esperando resposta, orçamento que esfria sem retorno, dado copiado
            de um sistema pro outro, relatório montado na mão toda semana. Cada
            tarefa depende de uma pessoa disponível.
          </p>

          <h2
            className="type-xl text-right md:text-left"
            data-animate-variant="slide"
            data-animate-on-scroll="true"
          >
            Vira sistema
          </h2>
        </div>

        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-2 md:items-end md:gap-20">
          <h2
            className="type-xl text-accent"
            data-animate-variant="slide"
            data-animate-on-scroll="true"
          >
            Que roda sozinho
          </h2>

          <p
            className="type-body max-w-lg text-fg-muted md:justify-self-end"
            data-animate-variant="slide"
            data-animate-on-scroll="true"
          >
            A gente mapeia o que se repete, decide junto com você o que vale
            automatizar primeiro e constrói. O que era tarefa vira fluxo, e
            continua rodando fora do horário comercial. Você passa a acompanhar
            resultado em vez de executar etapa.
          </p>
        </div>
      </div>
    </section>
  );
}
