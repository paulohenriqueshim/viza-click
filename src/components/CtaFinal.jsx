import Fall from "./Fall";
import { WHATSAPP_URL } from "@/lib/contact";

export default function CtaFinal() {
  return (
    <section className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center border-t border-border">
      <Fall>
        <h2 className="font-display font-normal uppercase leading-[0.95] text-[13vw] md:text-[6vw] tracking-tight">
          Vamos conversar?
        </h2>
      </Fall>

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
