import BotaoChat from "./BotaoChat";

/**
 * As frentes de trabalho apresentadas como funções de um funcionário, não
 * como tecnologia. A decisão veio de uma leitura externa do site (26/08/2026):
 * "agente de IA" fala com departamento de TI, "vendedor que não perde lead"
 * fala com o dono da empresa. Cada item tem uma promessa curta em cima da
 * descrição, porque é a promessa que a pessoa lê ao passar o olho.
 *
 * Os cargos são os que a empresa já contrata (01/09/2026): vendedor, marketing,
 * administrativo e secretária. Antes eram nomes criados por nós ("recuperador de
 * leads", "operação nos bastidores"). Descreviam bem o serviço, mas o dono
 * precisava parar pra entender o que eram e não tinha referência de preço na
 * cabeça pra comparar. Com cargo conhecido, ele já sabe quanto custa a versão
 * humana. A recuperação de lead virou atribuição do vendedor.
 *
 * A ordem é a de valor percebido: primeiro quem traz dinheiro, depois quem traz
 * gente, e por último quem sustenta a operação.
 */
const FUNCOES = [
  {
    numero: "01",
    titulo: "Vendedor",
    promessa: "Nenhum lead fica sem resposta.",
    desc: "Responde todo lead novo na hora, no WhatsApp e no site, apresenta seu serviço e entende o que a pessoa precisa. Separa quem tem interesse real e volta a falar com quem pediu orçamento e sumiu.",
  },
  {
    numero: "02",
    titulo: "Marketing",
    promessa: "Você para de postar no escuro.",
    desc: "Identifica que tipo de conteúdo traz cliente de verdade, cria e acompanha campanha e anúncio, e lê o comportamento de quem chega pra saber o que atrai mais gente parecida.",
  },
  {
    numero: "03",
    titulo: "Administrativo",
    promessa: "O trabalho que ninguém vê, mas alguém faz.",
    desc: "Automatiza processo interno, organiza documento, acompanha indicador e monta relatório. Quando o processo é específico demais pra caber em ferramenta pronta, a gente constrói o sistema em volta dele.",
  },
  {
    numero: "04",
    titulo: "Secretária",
    promessa: "Sua agenda enche sem parar o seu dia.",
    desc: "Agenda compromisso, responde a dúvida repetida, manda lembrete e organiza a informação do cliente. Você fica com o atendimento que exige você de verdade.",
  },
];

export default function Servicos() {
  return (
    <section id="funcionarios" className="px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[110rem]">
        <p
          className="type-label text-fg-muted"
          data-animate-variant="slide"
          data-animate-on-scroll="true"
        >
          Funcionário digital
        </p>

        <h2
          className="type-xl mt-8 max-w-[14ch]"
          data-animate-variant="slide"
          data-animate-on-scroll="true"
        >
          Escolha o que ele vai assumir
        </h2>

        <div className="mt-14 md:mt-20">
          {FUNCOES.map((funcao) => (
            <article
              key={funcao.numero}
              className="group grid gap-6 border-t border-border py-10 last:border-b md:grid-cols-[6rem_minmax(0,1.1fr)_minmax(0,1fr)] md:items-start md:gap-12 md:py-14"
            >
              <span className="type-label text-accent">{funcao.numero}</span>

              <h3
                className="type-lg transition-colors duration-300 group-hover:text-accent"
                data-animate-variant="slide"
                data-animate-on-scroll="true"
              >
                {funcao.titulo}
              </h3>

              <div>
                <p className="type-body font-medium text-fg">
                  {funcao.promessa}
                </p>
                <p
                  className="type-body mt-4 max-w-xl text-fg-muted"
                  data-animate-variant="slide"
                  data-animate-on-scroll="true"
                >
                  {funcao.desc}
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="type-label mt-10 max-w-2xl text-fg-muted">
          Sites, páginas comerciais e conteúdo com IA entram como apoio da
          operação, não como o centro dela.
        </p>

        <div className="mt-20 border-t border-border pt-10 md:mt-28 md:pt-14">
          <p className="type-label text-accent">Rodando agora</p>
          <h3
            className="type-lg mt-8 max-w-[20ch]"
            data-animate-variant="slide"
            data-animate-on-scroll="true"
          >
            A Lia é um funcionário digital da Viza
          </h3>

          <div className="mt-8 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <p className="type-body max-w-xl text-fg-muted">
              Ela atende quem chega neste site, entende o caso e me passa a
              conversa quando faz sentido. É o mesmo tipo de funcionário que
              entra no atendimento da sua empresa. Fala com ela e vê
              funcionando antes de decidir qualquer coisa.
            </p>

            <BotaoChat className="type-label inline-flex shrink-0 items-center justify-center border border-accent px-8 py-5 text-accent transition-colors hover:bg-accent hover:text-bg">
              Falar com a Lia
            </BotaoChat>
          </div>
        </div>
      </div>
    </section>
  );
}
