"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import BotaoWhatsApp from "./BotaoWhatsApp";

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
 * Reaberta em 24/11/2026, a pedido do Paulo: com os Reels da escala, a
 * maioria das visitas vem do Instagram querendo falar com ele ou ver o
 * sistema funcionando. Entraram o selo da escala, o WhatsApp como botão
 * principal e o "Ver como funciona". O título continua sozinho no centro.
 *
 * O atributo data-hero marca a seção pro AnimatedCopy saber quais textos
 * precisam esperar a abertura do preloader revelar o site.
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
      className="hero relative flex min-h-svh flex-col items-center justify-center overflow-x-clip px-6 pt-24 pb-14 text-center md:px-10 md:pt-36 md:pb-16"
      style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
    >
      {/* Selo pra quem chegou pelos Reels da escala: confirma na primeira
          olhada que é aqui mesmo e leva direto pro vídeo do sistema. Sem
          pulso nem brilho em loop (o Paulo recusa movimento ambiente). */}
      <a
        href="#como-funciona"
        className="group type-label mb-8 inline-flex max-w-full items-center gap-3 border border-border px-4 py-3 text-fg-muted transition-colors hover:border-accent hover:text-fg md:mb-12"
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
        <span className="truncate">
          Sistema de escala pra 5x2
          <span className="hidden sm:inline"> · Veja como funciona</span>
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          className="shrink-0 text-accent transition-transform duration-300 group-hover:translate-y-0.5"
        >
          <path d="M7 1v11M2.5 7.5 7 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </a>

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
        className="type-body mx-auto mt-8 max-w-xl text-fg-muted md:mt-12"
        data-animate-variant="slide"
        data-animate-on-scroll="false"
        data-animate-delay="0.5"
      >
        Site, atendimento e processos funcionando juntos, sem depender de
        alguém estar disponível. Você entra só quando precisa entrar.
      </p>

      {/* Dois caminhos, um pra cada tipo de visita que chega do Instagram:
          quem já quer fechar (WhatsApp direto com o Paulo) e quem ainda quer
          entender (desce pro vídeo do sistema). Até 24/11/2026 o hero tinha
          um botão só, que abria a Lia; ela continua na seção dela e no
          fechamento da página. */}
      <div className="mt-10 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center md:mt-14">
        <BotaoWhatsApp>Chamar no WhatsApp</BotaoWhatsApp>
        <a
          href="#como-funciona"
          className="group type-label inline-flex items-center justify-center gap-3 border border-border px-8 py-5 text-fg transition-all duration-300 hover:gap-5 hover:border-accent hover:text-accent sm:px-10"
        >
          Ver como funciona
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            className="shrink-0 transition-transform duration-300 group-hover:translate-y-0.5"
          >
            <path d="M7 1v11M2.5 7.5 7 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </a>
      </div>

      <p className="type-label mt-6 text-fg-muted">
        Quem responde é o Paulo, fundador
      </p>
    </section>
  );
}
