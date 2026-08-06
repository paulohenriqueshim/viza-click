"use client";

import { useRef, useEffect } from "react";
import Core from "smooothy";

/**
 * Carrossel de clientes entregues — herdado da biblioteca de efeitos
 * (efeito #21, "overlapping swiper"): os cards se empilham e giram
 * conforme você arrasta pro lado, com inércia. Adaptado pra paleta da
 * marca (só limão, off-white e carvão, sem as cores variadas do original)
 * e pra abrir o site do cliente ao clicar.
 *
 * Ordem pensada pra venda: começa pelos projetos de maior autoridade
 * técnica e empresas mais estabelecidas, e vai abrindo pro público de
 * profissional liberal, mostrando que atende os dois portes.
 */
const CLIENTES = [
  {
    nome: "Engetab",
    segmento: "Engenharia HVAC",
    desc: "Testes e certificação de sistemas de ar condicionado para hospitais, indústria e farmacêutico.",
    url: "https://humberto.viza.click/",
    tema: "lima",
  },
  {
    nome: "M2 Pisos Vinílicos",
    segmento: "Importação e distribuição",
    desc: "Representante de pisos vinílicos LG Chem no Brasil, atuando desde 1998.",
    url: "https://m2pisos.viza.click/",
    tema: "claro",
  },
  {
    nome: "Bruna Mendes Advocacia",
    segmento: "Advocacia",
    desc: "Escritório com atuação em direito civil, empresarial, trabalhista e de família.",
    url: "https://mendeslimaadv.viza.click/",
    tema: "escuro",
  },
  {
    nome: "Instrutor Godoy",
    segmento: "Treinamento de tiro",
    desc: "Instrução de tiro do básico ao avançado, com aulas em clubes a céu aberto.",
    url: "https://instrutorgodoy.viza.click/",
    tema: "lima",
  },
  {
    nome: "Yago Riffs",
    segmento: "Aulas de guitarra",
    desc: "Aulas particulares de guitarra online, com acompanhamento durante a semana.",
    url: "https://yagoriffs.viza.click/",
    tema: "claro",
  },
];

const TEMAS = {
  lima: { bg: "#c8ff3d", fg: "#0b0c0e", muted: "rgba(11,12,14,0.65)" },
  claro: { bg: "#f5f4f0", fg: "#0b0c0e", muted: "rgba(11,12,14,0.6)" },
  escuro: { bg: "#1c1d20", fg: "#f5f4f0", muted: "rgba(245,244,240,0.6)" },
};

export default function Projetos() {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const slides = [...wrapper.children];

    const preventSelect = (e) => e.preventDefault();
    wrapper.addEventListener("selectstart", preventSelect);
    wrapper.style.userSelect = "none";
    wrapper.style.touchAction = "pan-y";

    const slider = new Core(wrapper, {
      infinite: false,
      snap: false,
      variableWidth: true,
      lerpFactor: 0.02,
      speedDecay: 0.97,
      bounceLimit: 0,
      setOffset: ({ itemWidth, totalWidth }) => {
        const gap = window.innerWidth * 0.02;
        const lastSlideOffset = (CLIENTES.length - 1) * (itemWidth + gap);
        return totalWidth - lastSlideOffset;
      },
      onUpdate: (instance) => {
        const vwOffset = window.innerWidth * 0.1;

        slides.forEach((slide, i) => {
          const slideWidth = slide.offsetWidth;
          const slideLeft = slide.offsetLeft + instance.current;
          const isLast = i === CLIENTES.length - 1;

          if (slideLeft < 0 && !isLast) {
            const ratio = Math.min(1, Math.abs(slideLeft) / slideWidth);
            slide.style.transformOrigin = "left 80%";
            slide.style.transform = `translateX(${
              instance.current + Math.abs(slideLeft) + ratio * vwOffset
            }px) rotate(${-15 * ratio}deg) scale(${1 - ratio * 0.4})`;
            slide.style.position = "relative";
          } else {
            slide.style.transformOrigin = "";
            slide.style.transform = `translateX(${instance.current}px)`;
          }
          slide.style.zIndex = String(i + 1);
        });
      },
    });

    let animId;
    let wasDragging = false;
    let momentum = 0;
    const MOMENTUM_MULTIPLIER = 10;
    const MOMENTUM_DECAY = 0.96;

    function animate() {
      slider.update();

      if (slider.isDragging) {
        wasDragging = true;
        momentum = 0;
      } else if (wasDragging) {
        momentum = slider.speed * MOMENTUM_MULTIPLIER;
        wasDragging = false;
      }
      if (Math.abs(momentum) > 0.5) {
        slider.target += momentum;
        momentum *= MOMENTUM_DECAY;
        slider.target = Math.max(slider.maxScroll, Math.min(0, slider.target));
      }

      animId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      wrapper.removeEventListener("selectstart", preventSelect);
      slider.destroy();
    };
  }, []);

  return (
    <section className="py-24 md:py-32 overflow-clip">
      <div className="px-6 md:px-10 mb-12 md:mb-16">
        <p className="font-body text-xs md:text-sm tracking-[0.3em] text-fg-muted uppercase mb-4">
          Meus clientes
        </p>
        <h2 className="font-display font-normal uppercase text-[10vw] md:text-[4.5vw] leading-[1.2] tracking-tight max-w-3xl">
          Negócios que já contam com a gente
        </h2>
        <p className="font-body text-fg-muted text-sm md:text-base mt-4">
          Arraste para o lado.
        </p>
      </div>

      <div className="relative">
        <div
          ref={wrapperRef}
          className="flex items-center will-change-transform cursor-grab active:cursor-grabbing pl-6 md:pl-10"
        >
          {CLIENTES.map((cliente, index) => {
            const tema = TEMAS[cliente.tema];
            return (
              <a
                key={cliente.nome}
                href={cliente.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`shrink-0 w-[72vw] md:w-[27vw] h-[72vw] md:h-[22vw] rounded-[1.25rem] flex flex-col justify-between p-6 md:p-8 no-underline ${
                  index < CLIENTES.length - 1 ? "mr-[4vw] md:mr-[2vw]" : ""
                }`}
                style={{
                  backgroundColor: tema.bg,
                  color: tema.fg,
                  border: "1px solid rgba(0,0,0,0.25)",
                }}
              >
                <div>
                  <p
                    className="font-body text-[10px] md:text-xs tracking-[0.25em] uppercase mb-4"
                    style={{ color: tema.muted }}
                  >
                    {cliente.segmento}
                  </p>
                  <h3 className="font-display font-normal uppercase text-[6.5vw] md:text-[2.1vw] leading-[1.15] tracking-tight">
                    {cliente.nome}
                  </h3>
                </div>

                <div>
                  <p
                    className="font-body text-sm md:text-base leading-snug mb-5"
                    style={{ color: tema.muted }}
                  >
                    {cliente.desc}
                  </p>
                  <span className="font-body text-sm md:text-base font-medium">
                    Ver site
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
