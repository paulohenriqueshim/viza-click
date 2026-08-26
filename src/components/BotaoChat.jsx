"use client";

import { abrirChat } from "@/lib/chat-ui";

/**
 * CTA que abre o chat da Lia. Existe como componente cliente separado pra
 * que as seções que o usam (CtaFinal, por exemplo) possam continuar sendo
 * componentes de servidor.
 */
export default function BotaoChat({ children, className }) {
  return (
    <button type="button" onClick={abrirChat} className={className}>
      {children}
    </button>
  );
}
