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
        colorBox.style.top = "0";
        colorBox.style.left = "50%";
        colorBox.style.transform = "translateX(-50%)";
        colorBox.style.zIndex = "10";
        colorBox.style.width = `${wordRect.width * 1.1}px`;
        colorBox.style.height = `${wordRect.height * 0.9}px`;
        colorBox.style.background = color;
        colorBox.style.borderRadius = "0.25vw";
        colorBox.style.pointerEvents = "none";

        word.appendChild(colorBox);
        return colorBox;
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          end: "bottom 30%",
        },
        delay,
        onComplete: () => {
          colorBoxes.forEach((box) => {
            box.style.display = "none";
          });
        },
      });

      tl.to(colorBoxes, {
        y: () => gsap.utils.random(1200, 1600),
        x: () => gsap.utils.random(-150, 150),
        rotation: () => gsap.utils.random(-360, 360),
        duration: 1,
        ease: "power2.in",
        stagger: 0.02,
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
