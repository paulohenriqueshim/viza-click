"use client";

import { useEffect } from "react";

/**
 * Cursor customizado, adaptado do projeto de referência. Um ponto limão
 * com mix-blend-mode difference: ele inverte o que estiver embaixo, então
 * funciona tanto sobre o carvão quanto sobre os blocos limão sem precisar
 * trocar de cor. Cresce ao passar por algo clicável.
 *
 * Só existe em ponteiro fino. Em touch o cursor nativo não existe e o
 * elemento nem chega a ser criado.
 */
const SELETOR_INTERATIVO = 'a, button, [role="button"], input, textarea';

export default function CustomCursor() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const el = document.createElement("div");
    el.id = "custom-cursor";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);

    let alvoX = -100;
    let alvoY = -100;
    let x = alvoX;
    let y = alvoY;
    let raf = null;
    const SUAVIDADE = 0.15;

    // Com o mouse parado o ponto já alcançou o alvo e o loop passava a
    // recalcular a mesma posição pra sempre. Como o cursor usa
    // mix-blend-mode, cada quadro desses custava uma recomposição da tela
    // inteira. Chegando ao destino, o loop se desliga e volta no próximo
    // movimento do ponteiro.
    const tick = () => {
      x += (alvoX - x) * SUAVIDADE;
      y += (alvoY - y) * SUAVIDADE;
      el.style.setProperty("--x", `${x}px`);
      el.style.setProperty("--y", `${y}px`);

      if (Math.abs(alvoX - x) < 0.1 && Math.abs(alvoY - y) < 0.1) {
        raf = null;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const mover = (e) => {
      alvoX = e.clientX;
      alvoY = e.clientY;
      el.classList.add("is-visible");
      if (raf === null) raf = requestAnimationFrame(tick);

      const sobreClicavel = e.target instanceof Element
        ? !!e.target.closest(SELETOR_INTERATIVO)
        : false;
      el.classList.toggle("is-hovering", sobreClicavel);
    };

    const sair = () => el.classList.remove("is-visible");

    window.addEventListener("pointermove", mover, { passive: true });
    document.addEventListener("mouseleave", sair);

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", mover);
      document.removeEventListener("mouseleave", sair);
      el.remove();
    };
  }, []);

  return null;
}
