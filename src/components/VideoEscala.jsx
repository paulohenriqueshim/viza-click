"use client";

import { useEffect, useRef, useState } from "react";
import BotaoWhatsApp from "./BotaoWhatsApp";

/**
 * Player dos dois stories de "como funciona" da escala (23/11/2026), que são
 * gravação do sistema real com dados inventados (Restaurante do Toninho).
 *
 * - Só toca quando a pessoa clica. Nada de autoplay mudo em loop: o Paulo
 *   recusa movimento ambiente rodando sozinho no site.
 * - preload="none": os vídeos (1,5 MB e 1 MB) só baixam no play. Até lá a
 *   página carrega só as capas.
 * - Um elemento <video> só pros dois capítulos. Quando o primeiro acaba, o
 *   segundo começa sozinho. Com um elemento só, o iPhone aceita o play do
 *   segundo, porque o mesmo vídeo já foi liberado pelo toque da pessoa.
 * - O story 2 foi cortado antes do "Me chama na DM" (não faz sentido no
 *   site). No lugar dele entra o cartão final com o WhatsApp.
 * - Arquivos em public/video/. Pra regravar, ver o README de
 *   03-instagram/stories/2026-11-23-escala-como-funciona/.
 */
const CAPITULOS = [
  {
    titulo: "O gerente monta",
    duracao: "24s",
    src: "/video/escala-gerente.mp4",
    poster: "/video/escala-gerente.webp",
  },
  {
    titulo: "A equipe recebe",
    duracao: "18s",
    src: "/video/escala-equipe.mp4",
    poster: "/video/escala-equipe.webp",
  },
];

export default function VideoEscala() {
  const videoRef = useRef(null);
  const tocarAoTrocar = useRef(false);
  const [atual, setAtual] = useState(0);
  const [estado, setEstado] = useState("parado"); // parado | tocando | pausado | fim
  const [progresso, setProgresso] = useState(0);
  const [mudo, setMudo] = useState(false);

  const capitulo = CAPITULOS[atual];

  const tocar = () => {
    const video = videoRef.current;
    if (!video) return;
    const promessa = video.play();
    // Se o navegador barrar o play (aba sem gesto, economia de dados), o
    // botão de play volta a aparecer em vez de o player ficar mudo e parado.
    if (promessa?.catch) promessa.catch(() => setEstado("pausado"));
  };

  // Trocar o src faz o navegador carregar o vídeo novo sozinho. O play vem
  // depois, só se a troca veio de um clique ou do fim do capítulo anterior.
  useEffect(() => {
    setProgresso(0);
    if (tocarAoTrocar.current) {
      tocarAoTrocar.current = false;
      tocar();
    }
  }, [atual]);

  const escolher = (i) => {
    if (i === atual) {
      const video = videoRef.current;
      if (video) video.currentTime = 0;
      tocar();
      return;
    }
    tocarAoTrocar.current = true;
    setAtual(i);
  };

  const alternar = () => {
    if (estado === "tocando") {
      videoRef.current?.pause();
      return;
    }
    if (estado === "fim") {
      escolher(0);
      return;
    }
    tocar();
  };

  const aoAcabar = () => {
    if (atual < CAPITULOS.length - 1) {
      tocarAoTrocar.current = true;
      setAtual(atual + 1);
      return;
    }
    setEstado("fim");
  };

  const aoAtualizar = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgresso(video.currentTime / video.duration);
  };

  const alternarSom = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMudo(video.muted);
  };

  return (
    <div className="mx-auto w-full max-w-[20rem] md:max-w-none">
      <div className="relative aspect-[9/16] w-full overflow-hidden border border-border bg-bg-elevated">
        <video
          ref={videoRef}
          src={capitulo.src}
          poster={capitulo.poster}
          preload="none"
          playsInline
          onClick={alternar}
          onPlay={() => setEstado("tocando")}
          onPause={(e) => {
            if (!e.currentTarget.ended) setEstado("pausado");
          }}
          onEnded={aoAcabar}
          onTimeUpdate={aoAtualizar}
          aria-label={`Vídeo do sistema de escala: ${capitulo.titulo}`}
          className="absolute inset-0 h-full w-full cursor-pointer object-cover"
        />

        {(estado === "parado" || estado === "pausado") && (
          <button
            type="button"
            onClick={alternar}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg/25"
            aria-label={`Assistir: ${capitulo.titulo}`}
          >
            <span className="flex h-16 w-16 items-center justify-center bg-accent text-bg transition-transform duration-300 group-hover:scale-105">
              <svg width="20" height="22" viewBox="0 0 20 22" fill="currentColor" aria-hidden="true">
                <path d="M2 1.5v19L19 11 2 1.5Z" />
              </svg>
            </span>
            <span className="type-label bg-bg px-3 py-2 text-fg">
              {estado === "pausado" ? "Continuar" : `Assistir · ${capitulo.duracao}`}
            </span>
          </button>
        )}

        {estado === "tocando" && (
          <button
            type="button"
            onClick={alternarSom}
            className="type-label absolute right-3 top-3 bg-bg/80 px-3 py-2 text-fg transition-colors hover:text-accent"
          >
            {mudo ? "Ligar som" : "Tirar som"}
          </button>
        )}

        {estado === "fim" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
            <p className="type-lg text-[clamp(1.75rem,3vw,2.5rem)]">
              Quer um assim pro seu negócio?
            </p>
            <BotaoWhatsApp assunto="escala" tamanho="compacto" className="w-full py-4">
              Chamar no WhatsApp
            </BotaoWhatsApp>
            <button
              type="button"
              onClick={() => escolher(0)}
              className="type-label text-fg-muted transition-colors hover:text-accent"
            >
              Ver de novo
            </button>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-border/60">
          <div
            className="h-full origin-left bg-accent transition-transform duration-300 ease-linear"
            style={{ transform: `scaleX(${progresso})` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {CAPITULOS.map((c, i) => (
          <button
            key={c.src}
            type="button"
            onClick={() => escolher(i)}
            aria-pressed={i === atual}
            className={`type-label flex flex-col items-start gap-1.5 border-t-2 pt-3 text-left transition-colors ${
              i === atual
                ? "border-accent text-fg"
                : "border-border text-fg-muted hover:text-fg"
            }`}
          >
            <span>
              {i + 1}. {c.titulo}
            </span>
            <span className="text-fg-muted">{c.duracao}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
