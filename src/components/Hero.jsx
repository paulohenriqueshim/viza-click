import Fall from "./Fall";

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-clip">
      <p className="font-body text-xs md:text-sm tracking-[0.3em] text-fg-muted uppercase mb-6">
        Agência de Inteligência Artificial
      </p>

      <Fall>
        <h1 className="font-display font-normal uppercase leading-[1.2] text-[12vw] md:text-[7vw] tracking-tight max-w-5xl">
          IA que trabalha enquanto você dorme
        </h1>
      </Fall>

      <p className="font-body text-base md:text-lg text-fg-muted max-w-xl mt-8">
        Chatbots, automações e presença digital construídos com IA para quem
        não pode parar de vender.
      </p>
    </section>
  );
}
