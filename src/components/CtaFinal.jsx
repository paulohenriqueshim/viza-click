import BotaoChat from "./BotaoChat";
import { EMAIL } from "@/lib/contact";

export default function CtaFinal() {
  return (
    <section
      id="contato"
      className="border-t border-border px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-[110rem]">
        <p
          className="type-label text-fg-muted"
          data-animate-variant="slide"
          data-animate-on-scroll="true"
        >
          Próximo passo
        </p>

        <h2
          className="type-display mt-8"
          data-animate-variant="slide"
          data-animate-on-scroll="true"
          data-animate-stagger="0.08"
        >
          Vamos construir
        </h2>

        <div className="mt-14 flex flex-col gap-10 md:mt-20 md:flex-row md:items-end md:justify-between">
          <p
            className="type-body max-w-xl text-fg-muted"
            data-animate-variant="slide"
            data-animate-on-scroll="true"
          >
            Me conta como seu processo funciona hoje e eu te digo o que dá pra
            automatizar primeiro. Conversa de diagnóstico, sem compromisso.
          </p>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <BotaoChat className="type-label inline-flex items-center justify-center bg-accent px-8 py-5 text-bg transition-opacity hover:opacity-90">
              Quero automatizar meu negócio
            </BotaoChat>
            <a
              href={`mailto:${EMAIL}`}
              className="type-label inline-flex items-center justify-center border border-border px-8 py-5 text-fg transition-colors hover:border-accent hover:text-accent"
            >
              Falar por e-mail
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
