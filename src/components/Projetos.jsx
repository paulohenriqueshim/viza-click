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
 * Ordem definida pelo Paulo em 15/09/2026. O rótulo do link é por cliente
 * (campo `acao`), porque nem toda entrega é site: a da Engetab é cartão de
 * visitas, e chamar de "ver site" entregava a coisa errada.
 *
 * A cor NÃO é escolhida cliente por cliente: ela sai da posição na fila,
 * girando claro > limão > escuro. Quando era campo manual, reordenar a
 * lista deixou dois cards limão colados e ficou feio. Com o ciclo, duas
 * cores iguais nunca encostam, não importa quem entre ou saia, e o limão
 * (que é o acento da marca, forte demais pra repetir) volta só de três em
 * três. Cliente novo entra sem ninguém precisar pensar em cor.
 */
const CICLO_DE_CORES = ["claro", "lima", "escuro"];

const CLIENTES = [
  {
    nome: "M2 Pisos Vinílicos",
    segmento: "Importação e distribuição",
    desc: "Representante de pisos vinílicos LG Chem no Brasil, atuando desde 1998.",
    url: "https://m2pisos.viza.click/",
    acao: "Ver site",
  },
  {
    nome: "Bruna Mendes Advocacia",
    segmento: "Advocacia",
    desc: "Escritório com atuação em direito civil, empresarial, trabalhista e de família.",
    url: "https://mendeslimaadv.viza.click/",
    acao: "Ver site",
  },
  {
    nome: "Instrutor Godoy",
    segmento: "Treinamento de tiro",
    desc: "Instrução de tiro do básico ao avançado, com aulas em clubes a céu aberto.",
    url: "https://instrutorgodoy.viza.click/",
    acao: "Ver site",
  },
  {
    nome: "Engetab",
    segmento: "Engenharia HVAC",
    desc: "Testes e certificação de sistemas de ar condicionado para hospitais, indústria e farmacêutico.",
    url: "https://humberto.viza.click/",
    acao: "Ver cartão de visitas",
  },
  {
    nome: "Yago Riffs",
    segmento: "Aulas de guitarra",
    desc: "Aulas particulares de guitarra online, com acompanhamento durante a semana.",
    url: "https://yagoriffs.viza.click/",
    acao: "Ver site",
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

    // Largura e posição de cada card, medidas uma vez. Ler offsetWidth e
    // offsetLeft obriga o navegador a recalcular o layout na hora, e isso
    // acontecia dez vezes por quadro, sessenta vezes por segundo, no meio
    // de um loop que também escrevia transform nos mesmos elementos: o
    // clássico layout thrashing. Como a medida só muda quando a janela
    // muda de tamanho, ela é tirada do loop e refeita no resize.
    let metricas = [];
    let vwOffset = 0;
    const medir = () => {
      metricas = slides.map((slide) => ({
        largura: slide.offsetWidth,
        esquerda: slide.offsetLeft,
      }));
      vwOffset = window.innerWidth * 0.1;
    };
    medir();

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
        slides.forEach((slide, i) => {
          const { largura, esquerda } = metricas[i];
          const slideLeft = esquerda + instance.current;
          const isLast = i === CLIENTES.length - 1;

          if (slideLeft < 0 && !isLast) {
            const ratio = Math.min(1, Math.abs(slideLeft) / largura);
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

    let animId = null;
    let wasDragging = false;
    let momentum = 0;
    let visivel = false;
    const MOMENTUM_MULTIPLIER = 10;
    const MOMENTUM_DECAY = 0.96;

    // O loop parava de existir só ao desmontar, ou seja: nunca. Ele rodava
    // com o carrossel fora da tela e com o carrossel parado, gastando um
    // quadro inteiro pra recalcular a mesma posição. Agora ele só roda
    // quando a seção está na tela E ainda tem movimento pra resolver.
    const parado = () =>
      !slider.isDragging &&
      Math.abs(momentum) <= 0.5 &&
      Math.abs(slider.target - slider.current) < 0.05;

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

      if (parado()) {
        animId = null;
        return;
      }
      animId = requestAnimationFrame(animate);
    }

    // Acordar é sempre mais barato que ficar acordado: qualquer gesto que
    // possa mexer no carrossel religa o loop, que se desliga sozinho de
    // novo quando a inércia acaba.
    const acordar = () => {
      if (animId === null && visivel) animId = requestAnimationFrame(animate);
    };
    const gestos = ["pointerdown", "pointermove", "wheel", "touchstart", "touchmove"];
    gestos.forEach((evt) =>
      wrapper.addEventListener(evt, acordar, { passive: true })
    );

    const observador = new IntersectionObserver(
      ([entrada]) => {
        visivel = entrada.isIntersecting;
        if (visivel) acordar();
        else if (animId !== null) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      },
      { rootMargin: "200px" }
    );
    observador.observe(wrapper);

    const aoRedimensionar = () => {
      medir();
      acordar();
    };
    window.addEventListener("resize", aoRedimensionar);

    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
      observador.disconnect();
      window.removeEventListener("resize", aoRedimensionar);
      gestos.forEach((evt) => wrapper.removeEventListener(evt, acordar));
      wrapper.removeEventListener("selectstart", preventSelect);
      slider.destroy();
    };
  }, []);

  return (
    <section id="clientes" className="overflow-clip py-28 md:py-40">
      <div className="mx-auto mb-14 max-w-[110rem] px-6 md:mb-20 md:px-10">
        <p
          className="type-label text-fg-muted"
          data-animate-variant="slide"
          data-animate-on-scroll="true"
        >
          Clientes
        </p>
        <h2
          className="type-xl mt-8 max-w-[16ch]"
          data-animate-variant="slide"
          data-animate-on-scroll="true"
        >
          Negócios que já contam com a gente
        </h2>
        <p className="type-body mt-8 max-w-xl text-fg-muted">
          Sites, páginas comerciais e cartões entregues pela Viza Click. Arraste
          para o lado para abrir cada projeto.
        </p>
      </div>

      <div className="relative">
        <div
          ref={wrapperRef}
          className="flex items-center will-change-transform cursor-grab active:cursor-grabbing pl-6 md:pl-10"
        >
          {CLIENTES.map((cliente, index) => {
            const tema = TEMAS[CICLO_DE_CORES[index % CICLO_DE_CORES.length]];
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
                    {cliente.acao}
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
