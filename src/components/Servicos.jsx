import BotaoChat from "./BotaoChat";

/**
 * Os cinco serviços da casa, escritos em 15/09/2026 junto com a ampliação
 * do posicionamento para presença digital.
 *
 * Substitui a lista anterior de "funcionários digitais" (vendedor,
 * marketing, administrativo, secretária), que estava fora da página desde
 * 09/09/2026. Aqueles nomes descreviam bem o atendimento por IA, mas não
 * davam lugar a site, cartão e conteúdo, que hoje são serviço vendido e
 * não apoio.
 *
 * Cada item tem uma promessa curta antes da descrição, porque é a promessa
 * que a pessoa lê ao passar o olho pela lista. A ordem é comercial e foi
 * definida pelo Paulo: começa pelo que todo mundo já sabe que precisa
 * (site), emenda no cartão, e só depois entra no que exige explicação.
 *
 * O cartão chegou a ter um selo "Novo" ao lado do título. Saiu no mesmo
 * dia, a pedido dele: a posição na lista já dá o destaque.
 */
const SERVICOS = [
  {
    numero: "01",
    titulo: "Sites e landing pages",
    promessa: "Um site que vende, não só um site bonito.",
    desc: "Site profissional, rápido e com animação de verdade, construído pra transformar visitante em cliente. Funciona igual no computador e no celular, abre sem fazer ninguém esperar e é feito pra ser achado no Google.",
  },
  {
    numero: "02",
    titulo: "Cartão NFC",
    promessa: "Apresente seu negócio com um toque.",
    desc: "Cartão de visita que abre sua página na hora, sem app e sem ninguém digitar nada. Encoste no celular da pessoa e ela vê seu trabalho, seus contatos e salva você na agenda. A página pode ter IA atendendo ou levar direto pra sua avaliação no Google.",
  },
  {
    numero: "03",
    titulo: "Atendimento com IA",
    promessa: "Nenhum cliente fica sem resposta, no site ou no WhatsApp.",
    desc: "Uma IA treinada no seu negócio responde na hora, tira dúvida, entende o que a pessoa procura e te entrega o contato já qualificado. Atende de madrugada, no fim de semana e enquanto você está ocupado com outro cliente.",
  },
  {
    numero: "04",
    titulo: "Criação de conteúdo com IA",
    promessa: "Seu perfil para de ficar parado.",
    desc: "Imagem, vídeo curto e carrossel criados com IA dentro da identidade da sua marca. Material pronto pra publicar, sem sessão de foto, sem banco de imagem genérico e sem esperar semanas por uma arte.",
  },
  {
    numero: "05",
    titulo: "Automações sob medida",
    promessa: "O trabalho repetido deixa de ser seu.",
    desc: "Orçamento, cobrança, planilha, relatório, cadastro. A gente mapeia o que se repete no seu dia, constrói o fluxo que faz isso sozinho e coloca pra rodar dentro das ferramentas que sua empresa já usa.",
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
          Do site ao cartão na sua mão, de ponta a ponta. Você pode começar por
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
