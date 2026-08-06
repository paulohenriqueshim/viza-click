import Fall from "./Fall";

export default function Sobre() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-4xl text-center">
        <Fall color="var(--fg)">
          <h2 className="font-display font-normal uppercase leading-[1.2] text-[9vw] md:text-[4.5vw] tracking-tight">
            Tecnologia de empresa grande. Acessível pra você.
          </h2>
        </Fall>

        <p className="font-body text-base md:text-lg text-fg-muted max-w-2xl mx-auto mt-8">
          Atendimento inteligente, automação de processos e conteúdo criado
          com IA. Ferramentas que antes só empresa grande tinha acesso, agora
          do tamanho do seu negócio.
        </p>
      </div>
    </section>
  );
}
