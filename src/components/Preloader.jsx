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
 * Abertura "o clique", aprovada pelo Paulo em 24/11/2026 ("que abertura
 * bonita!"). Ele tinha pedido uma abertura mais bonita sem aumentar a
 * espera, então o tempo total é o mesmo da cortina antiga (~3,9s, contando
 * o respiro inicial).
 *
 * Como funciona: o logo se monta (anéis girando em sentidos opostos até
 * travar, miolo saltando), o nome sobe letra por letra embaixo dele e fica
 * parado pra ser lido, as etiquetas entram e saem pelos cantos, e o logo
 * "clica" (afunda e solta). No soltar, os anéis se soltam pra fora e o site
 * abre num círculo que nasce do miolo do logo, com uma onda limão na
 * borda. É o clique da Viza Click abrindo o site (e o círculo lê como a
 * lente do "Viza").
 *
 * A anterior era a cortina (duas camadas que se partiam ao meio, adaptada
 * do Lemon Bureau, de 25/08/2026). Saiu no mesmo dia da aprovação; está no
 * histórico do Git se um dia precisar.
 *
 * Roda em toda atualização da página, não uma vez por sessão. O markup é
 * renderizado no servidor pra cobrir a página desde a primeira pintura,
 * sem flash de conteúdo por baixo. Não pula por prefers-reduced-motion
 * (regra do Paulo: a abertura é o produto).
 */
const TAGS = ["Sites", "Atendimento com IA", "Automações"];

export default function Preloader() {
  useEffect(() => {
    const preloader = document.querySelector(".preloader");
    const tagsOverlay = document.querySelector(".tags-overlay");
    if (!preloader || !tagsOverlay) return;

    const finalizar = () => {
      document.documentElement.style.overflow = "";
      preloader.style.display = "none";
      tagsOverlay.style.display = "none";
      window.dispatchEvent(new Event(PRELOADER_DONE_EVENT));
    };

    // Aba aberta em segundo plano (ctrl+clique, link restaurado na sessão)
    // não recebe requestAnimationFrame, e o GSAP anda por ele: a timeline
    // ficaria parada no primeiro frame e a pessoa encontraria a tela preta
    // com a página travada ao voltar. Ninguém está vendo a abertura mesmo,
    // então ela é pulada por inteiro.
    if (document.hidden) {
      finalizar();
      return;
    }

    CustomEase.create("hop", ".8, 0, .3, 1");
    document.documentElement.style.overflow = "hidden";

    const logo = preloader.querySelector(".intro-logo");
    const onda = tagsOverlay.querySelector(".intro-onda");

    const ctx = gsap.context(() => {
      const titulos = document.querySelectorAll(
        ".preloader h1, .tags-overlay p, .intro-logo"
      );
      gsap.set(titulos, { opacity: 0 });

      const splits = [];

      // Cada letra vira <div class="char"><span>L</span></div>: a div
      // corta, o span desliza por dentro.
      const split = new SplitText(".preloader .intro-title h1", {
        type: "words,chars",
        wordsClass: "word",
        charsClass: "char",
      });
      split.chars.forEach((char) => {
        char.innerHTML = `<span>${char.textContent}</span>`;
      });
      splits.push(split);

      document.querySelectorAll(".tag p").forEach((el) => {
        splits.push(new SplitText(el, { type: "words", wordsClass: "word" }));
      });

      const tl = gsap.timeline({
        defaults: { ease: "hop" },
        delay: PRELOADER_START_DELAY_S,
        onComplete: finalizar,
      });

      const revelar = () => gsap.set(titulos, { opacity: 1 });
      const fontes = document.fonts?.ready;
      if (fontes?.then) fontes.then(revelar).catch(revelar);
      else revelar();

      // Etiquetas nos cantos: entram junto com o nome e saem antes do clique.
      const tags = gsap.utils.toArray(".tag");
      tags.forEach((tag, i) => {
        tl.to(
          tag.querySelectorAll("p .word"),
          { y: "0%", duration: 0.75 },
          0.5 + i * 0.1
        );
        tl.to(
          tag.querySelectorAll("p .word"),
          { y: "110%", duration: 0.75 },
          2 + i * 0.1
        );
      });

      // O nome sobe letra por letra e fica parado até a tela abrir. Numa
      // primeira tentativa ele saía antes e o logo descia pro centro
      // passando por cima dele: a marca ficava legível por um instante só.
      tl.to(
        ".preloader .intro-title .char span",
        { y: "0%", duration: 0.75, stagger: 0.05 },
        0.5
      );

      montarClique(tl, { preloader, logo, onda });

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
          <div className="intro-logo">
            <LogoAbertura />
          </div>
          <h1 className="type-display">Viza Click</h1>
        </div>
      </div>

      <div className="tags-overlay" aria-hidden="true">
        {TAGS.map((tag, i) => (
          <div key={tag} className={`tag tag-${i + 1}`}>
            <p className="type-label">{tag}</p>
          </div>
        ))}
        <div className="intro-onda" />
      </div>
    </>
  );
}

/**
 * O logo e o clique. A tela começa a abrir em 2,4s de timeline (3,0s
 * absolutos, que é quando o texto do hero entra, ver
 * PRELOADER_HERO_DELAY_S) e termina em 3,3s. Esses tempos vieram da
 * cortina antiga e não devem crescer: o Paulo pediu "sem aumentar o tempo
 * de espera".
 */
function montarClique(tl, { preloader, logo, onda }) {
  if (!logo) return;
  const svg = logo.querySelector("svg");
  const aneis = logo.querySelectorAll(".anel");
  const miolo = logo.querySelector(".miolo");

  gsap.set(aneis, {
    rotate: (i) => (i === 0 ? -150 : 150),
    scale: 0.4,
    opacity: 0,
    svgOrigin: "32 32",
  });
  gsap.set(miolo, { scale: 0, svgOrigin: "32 32" });

  // 1. O logo se monta: anéis girando em sentidos opostos até travar no
  //    lugar e o miolo saltando no meio.
  tl.to(aneis, { rotate: 0, scale: 1, opacity: 1, duration: 1.1, stagger: 0.08 }, 0)
    .to(miolo, { scale: 1, duration: 0.6, ease: "back.out(2.2)" }, 0.2);

  // 2. O clique: o logo afunda e solta.
  tl.to(svg, { scale: 0.8, duration: 0.2, ease: "power2.in" }, 2.2).to(
    svg,
    { scale: 1, duration: 0.3, ease: "back.out(3)" },
    2.4
  );

  // 3. Os anéis se soltam pra fora, como a onda de um toque.
  tl.to(
    aneis,
    { scale: 2.6, opacity: 0, duration: 0.7, stagger: 0.06, ease: "power2.out" },
    2.4
  );

  // 4. A tela abre num círculo que nasce do miolo e engole o nome. A
  //    máscara é um radial-gradient com o raio numa variável CSS; a onda
  //    limão é um anel que acompanha a borda do buraco e some no fim.
  const estado = { p: 0 };
  let raioFinal = 0;

  tl.to(
    estado,
    {
      p: 1,
      duration: 0.9,
      onStart: () => {
        const caixa = miolo.getBoundingClientRect();
        const cx = caixa.left + caixa.width / 2;
        const cy = caixa.top + caixa.height / 2;
        const w = window.innerWidth;
        const h = window.innerHeight;
        raioFinal = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 8;
        preloader.style.setProperty("--cx", `${cx}px`);
        preloader.style.setProperty("--cy", `${cy}px`);
        preloader.style.setProperty("--r", "0px");
        preloader.classList.add("abrindo");
        if (onda) {
          onda.style.left = `${cx}px`;
          onda.style.top = `${cy}px`;
        }
      },
      onUpdate: () => {
        const r = estado.p * raioFinal;
        preloader.style.setProperty("--r", `${r}px`);
        if (onda) {
          onda.style.width = `${r * 2}px`;
          onda.style.height = `${r * 2}px`;
          onda.style.opacity = String(
            estado.p < 0.5 ? 1 : Math.max(0, 1 - (estado.p - 0.5) / 0.5)
          );
        }
      },
    },
    2.4
  );
}

/**
 * O mesmo desenho do Logo.jsx, com cada anel num <g> próprio pra girar
 * sem brigar com o rotate(-58) que dá a diagonal dos cortes.
 */
function LogoAbertura() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <g className="anel">
        <circle
          cx="32"
          cy="32"
          r="22"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="97 41"
          transform="rotate(-58 32 32)"
        />
      </g>
      <g className="anel">
        <circle
          cx="32"
          cy="32"
          r="13"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="60 22"
          transform="rotate(-58 32 32)"
        />
      </g>
      <circle className="miolo" cx="32" cy="32" r="6" fill="currentColor" />
    </svg>
  );
}
