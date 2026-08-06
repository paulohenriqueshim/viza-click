import Fall from "./Fall";
import { WHATSAPP_URL } from "@/lib/contact";

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

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-10 inline-flex items-center justify-center bg-accent text-bg font-medium rounded-full px-8 py-4 text-sm md:text-base hover:opacity-90 transition-opacity"
      >
        Falar no WhatsApp
      </a>
    </section>
  );
}
