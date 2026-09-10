"use client";

import { abrirChat } from "@/lib/chat-ui";

/**
 * CTA que abre o chat da Lia. Existe como componente cliente separado pra
 * que as seções que o usam (CtaFinal, por exemplo) possam continuar sendo
 * componentes de servidor.
 *
 * A seta é o único movimento do botão: ela anda pra frente no hover e o
 * espaço entre texto e seta abre junto. É o que dá acabamento sem colocar
 * sombra, gradiente ou canto arredondado, que quebrariam a linguagem dura
 * do resto da página.
 */
const VARIANTES = {
  solido: "bg-accent text-bg hover:opacity-90",
  contorno: "border border-accent text-accent hover:bg-accent hover:text-bg",
};

export default function BotaoChat({
  children,
  variante = "solido",
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={abrirChat}
      className={`group type-label inline-flex items-center justify-center gap-3 px-10 py-5 transition-all duration-300 hover:gap-5 ${VARIANTES[variante]} ${className}`}
    >
      {children}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
      >
        <path
          d="M1 7h11M7.5 2.5 12 7l-4.5 4.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </button>
  );
}
