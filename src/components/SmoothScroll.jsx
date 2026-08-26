"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useEffect, useRef } from "react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { PRELOADER_DONE_EVENT } from "@/lib/preloader";

gsap.registerPlugin(ScrollTrigger);

// Altura do header fixo, pra âncora não parar com o título escondido atrás.
const HEADER_OFFSET = -90;

export default function SmoothScroll() {
  const lenisRef = useRef(null);

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    ScrollTrigger.refresh();

    return () => gsap.ticker.remove(update);
  }, []);

  // Trava o scroll enquanto a cortina do preloader está na tela. Sem
  // isso dá pra rolar a página por trás dela e o hero já aparece no meio
  // quando a cortina abre.
  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;

    lenis.stop();

    const liberar = () => lenis.start();
    window.addEventListener(PRELOADER_DONE_EVENT, liberar);

    return () => {
      window.removeEventListener(PRELOADER_DONE_EVENT, liberar);
      lenis.start();
    };
  }, []);

  // O Lenis assume o scroll da página e desliga o scroll suave nativo, então
  // link de âncora (menu do header, "Ver soluções") daria um salto seco.
  // Este listener delega o clique pro próprio Lenis, mantendo o movimento
  // com a mesma inércia do resto do site.
  useEffect(() => {
    function handleClick(event) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      const lenis = lenisRef.current?.lenis;

      if (href === "#") {
        event.preventDefault();
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo(0, 0);
        return;
      }

      const destino = document.querySelector(href);
      if (!destino) return;

      event.preventDefault();
      if (lenis) lenis.scrollTo(destino, { offset: HEADER_OFFSET });
      else destino.scrollIntoView();
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <ReactLenis
      root
      options={{ autoRaf: false, duration: 1.2, touchMultiplier: 2, smoothTouch: true }}
      ref={lenisRef}
    />
  );
}
