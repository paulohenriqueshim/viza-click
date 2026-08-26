"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { PRELOADER_HERO_DELAY_S } from "@/lib/preloader";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Sistema declarativo de reveal de texto, adaptado do projeto de
 * referência (Lemon Bureau). Em vez de escrever animação componente por
 * componente, qualquer elemento da página ganha o efeito só marcando o
 * atributo:
 *
 *   data-animate-variant="slide"        divide em linhas (padrão)
 *   data-animate-variant="slide-words"  divide em palavras
 *   data-animate-on-scroll="true"       dispara ao entrar na viewport
 *   data-animate-delay="0.8"            atraso em segundos
 *   data-animate-stagger="0.1"          intervalo entre linhas/palavras
 *   data-animate-start="top 70%"        ponto de disparo do ScrollTrigger
 *
 * O texto começa deslocado pra baixo dentro de uma máscara com overflow
 * hidden e sobe pro lugar.
 */
function tipoDeSplit(el) {
  const variante = (el.getAttribute("data-animate-variant") || "").trim();
  if (variante === "slide-words") return "words";
  if (variante === "slide-lines") return "lines";
  return (el.getAttribute("data-animate-split") || "").trim() === "words"
    ? "words"
    : "lines";
}

function animar(el, { preloaderVisivel, hero }) {
  const noScroll = el.getAttribute("data-animate-on-scroll") === "true";

  let delay = parseFloat(el.getAttribute("data-animate-delay")) || 0;

  // O atraso do preloader só vale pro hero, e só enquanto a cortina
  // estiver rodando. Sem isso o texto do hero animaria escondido atrás
  // dela e a pessoa só veria o resultado, nunca o movimento.
  if (preloaderVisivel && !noScroll && hero?.contains(el)) {
    delay += PRELOADER_HERO_DELAY_S;
  }

  const duration = parseFloat(el.getAttribute("data-animate-duration")) || 0.75;
  const stagger = parseFloat(el.getAttribute("data-animate-stagger")) || 0.1;
  const start = (el.getAttribute("data-animate-start") || "top 70%").trim();
  const tipo = tipoDeSplit(el);

  return SplitText.create(el, {
    type: tipo,
    mask: tipo,
    autoSplit: true,
    linesClass: "line",
    wordsClass: "word",
    onSplit(self) {
      const alvos = tipo === "words" ? self.words : self.lines;
      gsap.set(alvos, { yPercent: 100 });

      // Devolver a tween é o que permite o GSAP limpar sozinho quando o
      // autoSplit refaz a divisão no resize.
      return gsap.to(alvos, {
        yPercent: 0,
        duration,
        ease: "power3.out",
        delay,
        stagger,
        scrollTrigger: noScroll
          ? { trigger: el, start, toggleActions: "play none none none" }
          : undefined,
      });
    },
  });
}

export default function AnimatedCopy() {
  useEffect(() => {
    const preloaderVisivel = !!document.querySelector(".preloader");
    const hero = document.querySelector("[data-hero]");
    const splits = [];

    const iniciar = () => {
      document.querySelectorAll("[data-animate-variant]").forEach((el) => {
        const v = el.getAttribute("data-animate-variant");
        if (v !== "slide" && v !== "slide-lines" && v !== "slide-words") return;
        splits.push(animar(el, { preloaderVisivel, hero }));
      });
      ScrollTrigger.refresh();
    };

    // Espera a fonte pra não medir linha com a métrica da fonte de
    // fallback: se medir errado, o SplitText quebra o texto no lugar
    // errado e a máscara corta letra no meio.
    const fontes = document.fonts?.ready;
    if (fontes?.then) fontes.then(iniciar).catch(iniciar);
    else iniciar();

    return () => splits.forEach((s) => s?.revert());
  }, []);

  return null;
}
