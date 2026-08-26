/**
 * Processo em quatro passos. Existe pra tirar o medo de projeto longo e
 * caro: o primeiro passo é só uma conversa. Nenhum prazo prometido aqui,
 * porque prazo depende do escopo.
 */
const PASSOS = [
  {
    numero: "01",
    titulo: "Diagnóstico",
    desc: "Conversa curta pra entender como seu processo funciona hoje e onde está o gargalo. Sem compromisso.",
  },
  {
    numero: "02",
    titulo: "Desenho",
    desc: "Definimos o que automatizar primeiro, o que fica pra depois e o que muda no seu dia a dia.",
  },
  {
    numero: "03",
    titulo: "Construção",
    desc: "Eu construo e coloco pra rodar dentro das ferramentas que sua empresa já usa.",
  },
  {
    numero: "04",
    titulo: "Ajuste",
    desc: "Acompanho o funcionamento no uso real e ajusto o que precisar depois que entra no ar.",
  },
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[110rem]">
        <h2
          className="type-xl max-w-[14ch]"
          data-animate-variant="slide"
          data-animate-on-scroll="true"
        >
          Do primeiro contato ao sistema rodando
        </h2>

        <div className="mt-16 grid gap-12 sm:grid-cols-2 md:mt-24 xl:grid-cols-4 xl:gap-8">
          {PASSOS.map((passo) => (
            <div
              key={passo.numero}
              className="border-t border-border pt-6 [container-type:inline-size]"
            >
              <span className="type-label text-accent">{passo.numero}</span>
              <h3
                className="type-step mt-6"
                data-animate-variant="slide"
                data-animate-on-scroll="true"
              >
                {passo.titulo}
              </h3>
              <p className="type-body mt-4 text-fg-muted">{passo.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
