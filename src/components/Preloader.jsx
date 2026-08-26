"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import {
  PRELOADER_DONE_EVENT,
  PRELOADER_START_DELAY_S,
} from "@/lib/preloader";

gsap.registerPlugin(CustomEase, SplitText);

/**
 * Preloader de cortina, adaptado do projeto de referência que o Paulo
 * mandou (Lemon Bureau, 25/08/2026).
 *
 * Como funciona: duas camadas idênticas empilhadas ("preloader" e
 * "split-overlay"). O nome sobe letra por letra de dentro de caixas com
 * overflow hidden, três etiquetas entram e saem pelos cantos, e no fim
 * cada camada recebe um clip-path (uma fica com a metade de cima, a
 * outra com a de baixo) e desliza pro seu lado. A tela abre ao meio e
 * revela o site.
 *
 * Roda em toda atualização da página, não uma vez por sessão. O markup é
 * renderizado no servidor pra cobrir a página desde a primeira pintura,
 * sem flash de conteúdo por baixo.
 */
const TAGS = ["Automação", "Agentes de IA", "Sistemas sob medida"];

export default function Preloader() {
  useEffect(() => {
    const preloader = document.querySelector(".preloader");
    const splitOverlay = document.querySelector(".split-overlay");
    const tagsOverlay = document.querySelector(".tags-overlay");
    if (!preloader || !splitOverlay || !tagsOverlay) return;

    const esconder = () => {
      [preloader, splitOverlay, tagsOverlay].forEach((el) => {
        el.style.display = "none";
      });
    };

    const finalizar = () => {
      document.documentElement.style.overflow = "";
      esconder();
      window.dispatchEvent(new Event(PRELOADER_DONE_EVENT));
    };

    CustomEase.create("hop", ".8, 0, .3, 1");
    document.documentElement.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      const titulos = document.querySelectorAll(
        ".preloader h1, .split-overlay h1, .tags-overlay p"
      );
      gsap.set(titulos, { opacity: 0 });

      const splits = [];

      // Cada letra vira <div class="char"><span>L</span></div>: a div
      // corta, o span desliza por dentro.
      document.querySelectorAll(".intro-title h1").forEach((el) => {
        const split = new SplitText(el, {
          type: "words,chars",
          wordsClass: "word",
          charsClass: "char",
        });
        split.chars.forEach((char) => {
          char.innerHTML = `<span>${char.textContent}</span>`;
        });
        splits.push(split);
      });

      document.querySelectorAll(".tag p").forEach((el) => {
        splits.push(new SplitText(el, { type: "words", wordsClass: "word" }));
      });

      // A camada de baixo já entra com o texto no lugar: ela é o que
      // aparece atrás quando a de cima começa a se partir.
      gsap.set(".split-overlay .intro-title .char span", { y: "0%" });

      const tl = gsap.timeline({
        defaults: { ease: "hop" },
        delay: PRELOADER_START_DELAY_S,
        onComplete: finalizar,
      });

      const revelar = () => gsap.set(titulos, { opacity: 1 });
      const fontes = document.fonts?.ready;
      if (fontes?.then) fontes.then(revelar).catch(revelar);
      else revelar();

      const tags = gsap.utils.toArray(".tag");

      tags.forEach((tag, i) => {
        tl.to(
          tag.querySelectorAll("p .word"),
          { y: "0%", duration: 0.75 },
          0.5 + i * 0.1
        );
      });

      tl.to(
        ".preloader .intro-title .char span",
        { y: "0%", duration: 0.75, stagger: 0.05 },
        0.5
      ).to(
        ".split-overlay .intro-title .char span",
        { y: "0%", duration: 0.75, stagger: 0.05 },
        0.5
      );

      tags.forEach((tag, i) => {
        tl.to(
          tag.querySelectorAll("p .word"),
          { y: "110%", duration: 0.75 },
          2 + i * 0.1
        );
      });

      // A cortina: clip-path define a metade de cada camada, o y leva
      // cada uma pro seu lado.
      tl.set(
        [".preloader", ".split-overlay"],
        {
          clipPath: (i) =>
            i === 0
              ? "polygon(0 0, 100% 0, 100% 50%, 0 50%)"
              : "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
        },
        2.4
      ).to(
        [".preloader", ".split-overlay"],
        { y: (i) => (i === 0 ? "-50%" : "50%"), duration: 0.9 },
        2.4
      );

      return () => splits.forEach((s) => s.revert());
    });

    return () => {
      ctx.revert();
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <>
      <div className="preloader" aria-hidden="true">
        <div className="intro-title">
          <h1 className="type-display">Viza Click</h1>
        </div>
      </div>

      <div className="split-overlay" aria-hidden="true">
        <div className="intro-title">
          <h1 className="type-display">Viza Click</h1>
        </div>
      </div>

      <div className="tags-overlay" aria-hidden="true">
        {TAGS.map((tag, i) => (
          <div key={tag} className={`tag tag-${i + 1}`}>
            <p className="type-label">{tag}</p>
          </div>
        ))}
      </div>
    </>
  );
}
