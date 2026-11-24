import BotaoChat from "./BotaoChat";
import BotaoWhatsApp from "./BotaoWhatsApp";
import { EMAIL } from "@/lib/contact";

/**
 * Fechamento da página. Desde 24/11/2026 o WhatsApp é o botão principal (a
 * maioria das visitas vem do Instagram querendo falar com o Paulo) e a Lia
 * fica ao lado pra quem quer tirar dúvida antes. O e-mail, que era botão,
 * virou linha discreta embaixo: quase ninguém do Instagram escolhe e-mail.
 */
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
          <div className="max-w-xl">
            <p
              className="type-body text-fg-muted"
              data-animate-variant="slide"
              data-animate-on-scroll="true"
            >
              Me conta como seu processo funciona hoje e eu te digo o que dá pra
              automatizar primeiro. Conversa de diagnóstico, sem compromisso.
            </p>
            <p className="type-body mt-4 text-fg-muted">
              Prefere e-mail?{" "}
              <a
                href={`mailto:${EMAIL}`}
                className="text-fg underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                {EMAIL}
              </a>
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <BotaoWhatsApp>Chamar no WhatsApp</BotaoWhatsApp>
            <BotaoChat variante="contorno">Falar com a Lia</BotaoChat>
          </div>
        </div>
      </div>
    </section>
  );
}
