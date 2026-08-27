"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { abrirChat } from "@/lib/chat-ui";

/**
 * Hero de tela cheia com o tipo como protagonista. O título inclina em 3D
 * seguindo o mouse (adaptado do home-hero.js do projeto de referência):
 * perspectiva de 1000px, rotação máxima de 20 graus, lerp de 0.05 pra o
 * movimento chegar atrasado e pesado em vez de grudar no ponteiro.
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
      className="hero relative flex min-h-svh flex-col justify-center overflow-x-clip px-6 pt-28 pb-10 md:px-10 md:pt-36"
      style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
    >
      <div ref={tituloRef} className="will-change-transform">
        <h1
          className="type-hero max-w-[16ch]"
          data-animate-variant="slide"
          data-animate-on-scroll="false"
          data-animate-delay="0.1"
          data-animate-stagger="0.08"
        >
          Seu próximo funcionário não dorme
        </h1>
      </div>

      <div className="mt-8 flex flex-col gap-8 md:mt-14 md:flex-row md:items-end md:justify-between">
        <p
          className="type-body max-w-xl text-fg-muted"
          data-animate-variant="slide"
          data-animate-on-scroll="false"
          data-animate-delay="0.5"
        >
          Ele atende no WhatsApp e no site, responde na hora, separa quem tem
          interesse real, agenda e cobra o retorno que ficou parado. Você entra
          só quando precisa entrar.
        </p>

        <div className="flex shrink-0 flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
          <button
            type="button"
            onClick={abrirChat}
            className="type-label inline-flex items-center justify-center bg-accent px-8 py-5 text-bg transition-opacity hover:opacity-90"
          >
            Descobrir o que automatizar
          </button>
          <a
            href="#funcionarios"
            className="type-label border-b border-border pb-1 text-fg-muted transition-colors hover:border-accent hover:text-accent"
          >
            Ver as funções
          </a>
        </div>
      </div>

      <div className="hero-rodape mt-12 flex flex-col justify-between gap-4 border-t border-border pt-6 md:mt-20 md:flex-row">
        <p
          className="type-label text-fg-muted"
          data-animate-variant="slide"
          data-animate-on-scroll="false"
          data-animate-delay="0.7"
        >
          Atendimento, vendas, agendamento e processos internos
        </p>
        <p
          className="type-label text-accent"
          data-animate-variant="slide"
          data-animate-on-scroll="false"
          data-animate-delay="0.8"
        >
          Você fala direto com quem constrói
        </p>
      </div>
    </section>
  );
}
