import Image from "next/image";
import foto from "@/assets/paulo-shim.png";

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

        <div className="mt-14 grid items-center gap-10 md:mt-20 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:gap-16 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
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
              Sou o Paulo, fundador da Viza Click. Depois de ver empresas
              perdendo clientes por falta de presença digital e tempo em
              processos que poderiam ser automatizados, decidi criar soluções
              que simplificam seu negócio.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
