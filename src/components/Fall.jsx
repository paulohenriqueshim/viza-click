"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Efeito "Fall" — cada palavra do texto nasce coberta por um bloco sólido;
 * ao rolar até a seção, os blocos caem com física (gravidade + rotação
 * aleatória) revelando o texto por baixo. 100% tipográfico, não depende
 * de nenhuma imagem — herdado da biblioteca de efeitos (pacote "Scroll
 * Animation", efeito #56), adaptado pra cor de marca da Viza Click.
 *
 * Diferente do original, aqui a timeline é amarrada ao scroll nos dois
 * sentidos: descendo os blocos caem, subindo eles voltam pro lugar.
 */
export default function Fall({ children, delay = 0, color = "var(--accent)" }) {
  const elementRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current || !textRef.current) return;

    const element = elementRef.current;
    const originalText = textRef.current;

    const ctx = gsap.context(() => {
      const split = new SplitText(originalText, { type: "words" });
      const words = split.words;

      const colorBoxes = words.map((word) => {
        gsap.set(word, { display: "inline-block", position: "relative" });

        const wordRect = word.getBoundingClientRect();
        const colorBox = document.createElement("div");
        colorBox.style.position = "absolute";
        // O bloco cobre só a caixa da palavra em si. Antes ele começava no
        // topo do elemento e comia os acentos das maiúsculas (Ê, Ç, Á);
        // agora ele fica alinhado embaixo, deixando a acentuação livre.
        colorBox.style.bottom = "0.08em";
        colorBox.style.left = "50%";
        colorBox.style.transform = "translateX(-50%)";
        colorBox.style.zIndex = "10";
        colorBox.style.width = `${wordRect.width * 1.06}px`;
        colorBox.style.height = "0.78em";
        colorBox.style.background = color;
        colorBox.style.borderRadius = "0.06em";
        colorBox.style.pointerEvents = "none";

        word.appendChild(colorBox);
        return colorBox;
      });

      // Guarda um alvo aleatório fixo por bloco pra animação ficar idêntica
      // ao reverter (senão cada replay sorteia valores novos e treme).
      const targets = colorBoxes.map(() => ({
        y: gsap.utils.random(1200, 1600),
        x: gsap.utils.random(-150, 150),
        rotation: gsap.utils.random(-360, 360),
      }));

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          end: "bottom 30%",
          toggleActions: "play none none reverse",
        },
        delay,
      });

      colorBoxes.forEach((box, i) => {
        tl.to(
          box,
          {
            y: targets[i].y,
            x: targets[i].x,
            rotation: targets[i].rotation,
            duration: 1,
            ease: "power2.in",
          },
          i * 0.02
        );
        // Some no fim da queda pra não ficar pairando por cima das seções
        // seguintes. Como está na mesma timeline, ao reverter ele reaparece.
        tl.to(
          box,
          { autoAlpha: 0, duration: 0.2, ease: "none" },
          i * 0.02 + 0.8
        );
      });
    }, elementRef);

    return () => ctx.revert();
  }, [delay, color]);

  return (
    <div ref={elementRef}>
      <div ref={textRef}>{children}</div>
    </div>
  );
}
