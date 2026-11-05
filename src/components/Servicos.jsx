import BotaoChat from "./BotaoChat";

/**
 * Os cinco serviços da casa. A lista nasceu em 15/09/2026, junto com a
 * ampliação do posicionamento para presença digital, e foi refeita pelo
 * Paulo em 05/11/2026:
 *
 * - "Criação de conteúdo com IA" saiu: não vendia.
 * - O cartão passou a se chamar "Cartão Viza Click" (era "Cartão NFC") e
 *   foi pro topo.
 * - O cartão que abre a avaliação no Google virou serviço próprio, logo
 *   abaixo do atendimento com IA (antes era uma frase na descrição do
 *   cartão). O nome "Cartão de Avaliação" foi escolha minha; trocar aqui e
 *   no prompt da Lia se o Paulo quiser outro.
 * - O atendimento com IA passou a ser só no site. O WhatsApp saiu da
 *   descrição porque a Viza deixou de vender atendimento por lá.
 * - Automações ganhou "e sistemas" no nome.
 *
 * Cada item tem uma promessa curta antes da descrição, porque é a promessa
 * que a pessoa lê ao passar o olho pela lista. A ordem é comercial e foi
 * definida pelo Paulo. O cartão já teve um selo "Novo" ao lado do título;
 * saiu no mesmo dia, a pedido dele: a posição na lista já dá o destaque.
 */
const SERVICOS = [
  {
    numero: "01",
    titulo: "Cartão Viza Click",
    promessa: "Apresente seu negócio com um toque.",
    desc: "Cartão de visita que abre sua página na hora, sem app e sem ninguém digitar nada. Encoste no celular da pessoa e ela vê seu trabalho, seus contatos e salva você na agenda. Pode vir só com seus contatos ou com uma IA que atende quem chegou pela página. Preto, branco ou com a sua logo.",
  },
  {
    numero: "02",
    titulo: "Atendimento com IA",
    promessa: "Nenhum visitante do seu site fica sem resposta.",
    desc: "Uma IA treinada no seu negócio atende quem chega no seu site: responde na hora, tira dúvida, entende o que a pessoa procura e te entrega o contato já qualificado. Pode até marcar horário na sua agenda. Atende de madrugada, no fim de semana e enquanto você está ocupado com outro cliente.",
  },
  {
    numero: "03",
    titulo: "Cartão de Avaliação",
    promessa: "Mais avaliações no Google, com um toque.",
    desc: "Cartão que abre direto a página de avaliação do seu negócio no Google. O cliente satisfeito encosta o celular e avalia na hora, sem precisar procurar seu perfil. Deixa no balcão ou entrega junto com o serviço.",
  },
  {
    numero: "04",
    titulo: "Sites e landing pages",
    promessa: "Um site que vende, não só um site bonito.",
    desc: "Site profissional, loja virtual ou landing page, rápido e com animação de verdade, construído pra transformar visitante em cliente. Funciona igual no computador e no celular, abre sem fazer ninguém esperar e é feito pra ser achado no Google.",
  },
  {
    numero: "05",
    titulo: "Automações e sistemas sob medida",
    promessa: "O trabalho repetido deixa de ser seu.",
    desc: "Orçamento, cobrança, planilha, relatório, cadastro. A gente mapeia o que se repete no seu dia e coloca pra rodar sozinho, dentro das ferramentas que sua empresa já usa ou num sistema feito do jeito que ela trabalha.",
  },
];

export default function Servicos() {
  return (
    <section
      id="servicos"
      className="border-t border-border px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-[110rem]">
        <p
          className="type-label text-fg-muted"
          data-animate-variant="slide"
          data-animate-on-scroll="true"
        >
          Serviços
        </p>

        <h2
          className="type-xl mt-8 max-w-[13ch]"
          data-animate-variant="slide"
          data-animate-on-scroll="true"
        >
          Tudo que faz seu digital rodar
        </h2>

        <p
          className="type-body mt-8 max-w-xl text-fg-muted"
          data-animate-variant="slide"
          data-animate-on-scroll="true"
        >
          Do cartão na sua mão ao site, de ponta a ponta. Você pode começar por
          um e ir somando: cada peça funciona sozinha e funciona melhor junto
          com as outras.
        </p>

        <div className="mt-14 md:mt-20">
          {SERVICOS.map((servico) => (
            <article
              key={servico.numero}
              className="group grid gap-6 border-t border-border py-10 last:border-b md:grid-cols-[6rem_minmax(0,1.1fr)_minmax(0,1fr)] md:items-start md:gap-12 md:py-14"
            >
              <span className="type-label text-accent">{servico.numero}</span>

              <h3
                className="type-lg transition-colors duration-300 group-hover:text-accent"
                data-animate-variant="slide"
                data-animate-on-scroll="true"
              >
                {servico.titulo}
              </h3>

              <div>
                <p className="type-body font-medium text-fg">
                  {servico.promessa}
                </p>
                <p
                  className="type-body mt-4 max-w-xl text-fg-muted"
                  data-animate-variant="slide"
                  data-animate-on-scroll="true"
                >
                  {servico.desc}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-8 md:mt-20 md:flex-row md:items-end md:justify-between">
          <p className="type-body max-w-xl text-fg-muted">
            Não sabe por onde começar? Me conta como seu negócio funciona hoje e
            eu te digo o que resolve mais rápido.
          </p>

          <BotaoChat className="shrink-0">Descobrir o meu caso</BotaoChat>
        </div>
      </div>
    </section>
  );
}
