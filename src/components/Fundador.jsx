import Image from "next/image";
import foto from "@/assets/paulo-shim.png";
import { WHATSAPP_URL } from "@/lib/contact";

/**
 * O diferencial que a Viza Click de fato tem hoje e que agência grande
 * não tem: não existe camada entre quem entende o problema e quem
 * escreve o sistema.
 *
 * A foto fica em primeiro plano ao lado do texto, nítida e sem overlay
 * por cima (regra de foto do projeto). O fundo cinza escuro da foto já
 * conversa com o carvão da página, então ela não precisa de tratamento.
 */
export default function Fundador() {
  return (
    <section id="fundador" className="px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[110rem]">
        <h2
          className="type-xl max-w-[13ch]"
          data-animate-variant="slide"
          data-animate-on-scroll="true"
        >
          Você fala direto com quem constrói
        </h2>

        <div className="mt-14 grid items-start gap-10 md:mt-20 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:gap-16 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <figure className="m-0">
            <Image
              src={foto}
              alt="Paulo Shim, fundador da Viza Click"
              sizes="(max-width: 768px) 65vw, 22rem"
              placeholder="blur"
              className="w-[65%] max-w-[22rem] border border-border object-cover md:w-full"
              priority={false}
            />
            <figcaption className="type-label mt-5 text-fg-muted">
              Paulo Shim, fundador
            </figcaption>
          </figure>

          <div className="max-w-xl">
            <p
              className="type-body text-fg-muted"
              data-animate-variant="slide"
              data-animate-on-scroll="true"
            >
              A Viza Click é pequena de propósito. Não tem camada de
              atendimento repassando recado, não tem terceirização, não tem
              reunião pra alinhar com alguém que nunca viu o seu processo. Quem
              escuta o seu problema é quem escreve o sistema.
            </p>

            <p
              className="type-body mt-8 text-fg-muted"
              data-animate-variant="slide"
              data-animate-on-scroll="true"
            >
              Empresa pequena tem uma vantagem que empresa grande não tem:
              velocidade. Menos gente entre o seu problema e a pessoa que vai
              resolver ele.
            </p>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="type-label mt-10 inline-flex border-b border-accent pb-2 text-accent transition-opacity hover:opacity-70"
            >
              Falar comigo agora
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
