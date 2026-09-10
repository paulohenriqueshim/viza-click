"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import BotaoChat from "./BotaoChat";

/**
 * Hero de tela cheia com o tipo como protagonista, centralizado. O título
 * inclina em 3D seguindo o mouse (adaptado do home-hero.js do projeto de
 * referência): perspectiva de 1000px, rotação máxima de 20 graus, lerp de
 * 0.05 pra o movimento chegar atrasado e pesado em vez de grudar no
 * ponteiro.
 *
 * Composição enxugada em 09/09/2026: um CTA só, sem rótulos de rodapé e
 * sem link secundário. Tudo que competia com o título saiu, porque numa
 * dobra centralizada cada elemento a mais divide a atenção em vez de somar.
 *
 * O atributo data-hero marca a seção pro AnimatedCopy saber quais textos
 * precisam esperar a cortina do preloader abrir.
 */
function useTilt(containerRef, targetRef) {
  useEffect(() => {
    const container = containerRef.current;
    const target = targetRef.current;
    if (!container || !target) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const LERP = 0.05;
    const MAX = 20;
    let alvoX = 0;
    let alvoY = 0;
    let x = 0;
    let y = 0;
    let raf = null;
    let dentro = false;

    const render = () => {
      x += (alvoX - x) * LERP;
      y += (alvoY - y) * LERP;

      gsap.set(target, {
        rotateX: y,
        rotateY: x,
        transformPerspective: 1000,
        transformOrigin: "center center",
        force3D: true,
      });

      const parado =
        Math.abs(x - alvoX) < 0.01 && Math.abs(y - alvoY) < 0.01;
      if (parado && !dentro) {
        raf = null;
        return;
      }
      raf = requestAnimationFrame(render);
    };

    const garantirLoop = () => {
      if (raf === null) raf = requestAnimationFrame(render);
    };

    const mover = (e) => {
      const rect = container.getBoundingClientRect();
      alvoX = ((e.clientX - rect.left) / rect.width - 0.5) * MAX;
      alvoY = -((e.clientY - rect.top) / rect.height - 0.5) * MAX;
      dentro = true;
      garantirLoop();
    };

    const sair = () => {
      alvoX = 0;
      alvoY = 0;
      dentro = false;
      garantirLoop();
    };

    container.addEventListener("mousemove", mover);
    container.addEventListener("mouseleave", sair);

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      container.removeEventListener("mousemove", mover);
      container.removeEventListener("mouseleave", sair);
    };
  }, [containerRef, targetRef]);
}

export default function Hero() {
  const secaoRef = useRef(null);
  const tituloRef = useRef(null);
  useTilt(secaoRef, tituloRef);

  return (
    <section
      ref={secaoRef}
      data-hero
      className="hero relative flex min-h-svh flex-col items-center justify-center overflow-x-clip px-6 pt-28 pb-16 text-center md:px-10 md:pt-36"
      style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
    >
      <div ref={tituloRef} className="will-change-transform">
        <h1
          className="type-hero mx-auto max-w-[15ch]"
          data-animate-variant="slide"
          data-animate-on-scroll="false"
          data-animate-delay="0.1"
          data-animate-stagger="0.08"
        >
          Sua presença digital rodando sozinha
        </h1>
      </div>

      <p
        className="type-body mx-auto mt-10 max-w-xl text-fg-muted md:mt-12"
        data-animate-variant="slide"
        data-animate-on-scroll="false"
        data-animate-delay="0.5"
      >
        Site, atendimento e processos funcionando juntos, sem depender de
        alguém estar disponível. Você entra só quando precisa entrar.
      </p>

      <div className="mt-12 md:mt-14">
        <BotaoChat>Ver funcionando</BotaoChat>
      </div>
    </section>
  );
}
