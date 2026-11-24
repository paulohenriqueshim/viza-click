import BotaoChat from "./BotaoChat";
import BotaoWhatsApp from "./BotaoWhatsApp";
import VideoEscala from "./VideoEscala";

/**
 * "Como funciona" do sistema de escala, logo abaixo do hero (24/11/2026).
 *
 * Entrou no lugar do Manifesto ("Processo manual / Vira sistema / Que roda
 * sozinho"), seguindo a regra do Paulo de trocar bloco em vez de empilhar.
 * O motivo: os Reels da escala mandam muita gente pro site perguntando
 * "como funciona?", e a resposta mais rápida é o sistema real rodando.
 *
 * Os passos descrevem só o que o sistema já faz (ver a memória
 * sistema-escala-produto). Nunca prometer que ele garante a lei: quem valida
 * é o contador do cliente.
 *
 * Não é a seção "Como funciona" removida em 16/09/2026 (os quatro passos do
 * processo da agência). Aquela falava do método; esta mostra o produto.
 */
const PASSOS = [
  {
    titulo: "Você passa as regras uma vez",
    desc: "O horário de cada um, quantas pessoas precisa por dia, 6x1 ou 5x2 e o rodízio de domingo.",
  },
  {
    titulo: "Um toque e a semana sai pronta",
    desc: "O sistema monta a escala sozinho e já confere as regras antes de você publicar.",
  },
  {
    titulo: "A equipe vê tudo no celular",
    desc: "Cada um abre a própria escala por um link, sem senha e sem baixar nada. Precisa trocar a folga? Pede por ali e você aprova num toque.",
  },
];

export default function ComoFunciona() {
  return (
    <section
      id="como-funciona"
      className="border-t border-border px-6 py-24 md:px-10 md:py-40"
    >
      <div className="mx-auto grid max-w-[110rem] gap-12 md:grid-rows-[auto_1fr] md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] md:gap-x-16 md:gap-y-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-x-28">
        <div>
          <p
            className="type-label text-accent"
            data-animate-variant="slide"
            data-animate-on-scroll="true"
          >
            Como funciona · Sistema de escala
          </p>

          <h2
            className="type-lg mt-8 max-w-[14ch]"
            data-animate-variant="slide"
            data-animate-on-scroll="true"
          >
            Sua escala se monta sozinha
          </h2>

          <p
            className="type-body mt-8 max-w-xl text-fg-muted"
            data-animate-variant="slide"
            data-animate-on-scroll="true"
          >
            Chega de montar a escala na mão toda semana. Você conta as regras do
            seu negócio uma vez e o sistema faz o resto, do jeito que a sua
            equipe trabalha.
          </p>
        </div>

        <div className="md:col-start-2 md:row-span-2 md:row-start-1">
          <VideoEscala />
        </div>

        <div>
          <ol className="border-t border-border">
            {PASSOS.map((passo, i) => (
              <li
                key={passo.titulo}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-b border-border py-6 md:grid-cols-[4rem_minmax(0,1fr)] md:py-8"
              >
                <span className="type-label pt-1.5 text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="type-body font-medium text-fg">{passo.titulo}</p>
                  <p className="type-body mt-2 max-w-xl text-fg-muted">
                    {passo.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row md:mt-12">
            <BotaoWhatsApp assunto="escala">Quero na minha empresa</BotaoWhatsApp>
            <BotaoChat variante="contorno">Tirar dúvida com a Lia</BotaoChat>
          </div>

          <p className="type-body mt-8 max-w-xl text-fg-muted">
            Cada negócio tem as suas regras: turnos, almoço, folguista, mais de
            uma unidade. O sistema é montado com as suas.
          </p>
        </div>
      </div>
    </section>
  );
}
