"use client";

import { useEffect, useRef } from "react";

/**
 * Fundo de fluido reativo ao ponteiro.
 *
 * O solver é adaptado do footer-fluid.js do projeto de referência que o
 * Paulo mandou (stable fluids do Jos Stam: força externa, advecção
 * semi-lagrangiana e projeção por pressão em Gauss-Seidel). Roda em CPU,
 * sem WebGL e sem nenhum dos 36 shaders.
 *
 * A renderização é minha, não a de lá: o footer original move até 262 mil
 * partículas num simulador WebGL com passe de separação em CPU, o que não
 * sobrevive em celular. Aqui as partículas riscam trilhas curtas num
 * canvas 2D e o quadro anterior é apagado com um véu de carvão, o que dá
 * o rastro de fluido por um custo muito menor.
 */

// Menos iterações de pressão que o original (50): como fundo, a diferença
// visual é imperceptível e o custo por quadro cai junto.
const ITERACOES_PRESSAO = 16;

function criarCampo(largura, altura, tamanhoCelula) {
  const nx = Math.max(8, Math.floor(largura / tamanhoCelula));
  const ny = Math.max(8, Math.floor(altura / tamanhoCelula));
  const n = nx * ny;

  return {
    nx,
    ny,
    largura,
    altura,
    celula: tamanhoCelula,
    u: new Float32Array(n),
    v: new Float32Array(n),
    uPrev: new Float32Array(n),
    vPrev: new Float32Array(n),
    p: new Float32Array(n),
    div: new Float32Array(n),
  };
}

function idx(campo, x, y) {
  return y * campo.nx + x;
}

function empurrar(campo, x, y, dx, dy, raio, forca) {
  const { nx, ny } = campo;
  const cx = (x / campo.largura) * (nx - 1);
  const cy = (y / campo.altura) * (ny - 1);
  const cr = (raio / Math.max(1, campo.largura)) * (nx - 1);
  const cr2 = cr * cr;

  const minX = Math.max(0, Math.floor(cx - cr - 1));
  const maxX = Math.min(nx - 1, Math.ceil(cx + cr + 1));
  const minY = Math.max(0, Math.floor(cy - cr - 1));
  const maxY = Math.min(ny - 1, Math.ceil(cy + cr + 1));

  for (let gy = minY; gy <= maxY; gy++) {
    for (let gx = minX; gx <= maxX; gx++) {
      const ddx = gx - cx;
      const ddy = gy - cy;
      const d2 = ddx * ddx + ddy * ddy;
      if (d2 > cr2) continue;

      const t = 1 - d2 / Math.max(1e-6, cr2);
      const suave = t * t * (3 - 2 * t);
      const i = idx(campo, gx, gy);
      campo.u[i] += dx * forca * suave;
      campo.v[i] += dy * forca * suave;
    }
  }
}

function advectar(campo, dt) {
  const { nx, ny, uPrev, vPrev } = campo;

  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      const i = idx(campo, x, y);
      // Velocidade está em px/s: divide pelo tamanho da célula pra virar
      // deslocamento em coordenada de grade.
      const bx = x - (uPrev[i] * dt) / campo.celula;
      const by = y - (vPrev[i] * dt) / campo.celula;

      const sx = Math.max(0, Math.min(nx - 1, bx));
      const sy = Math.max(0, Math.min(ny - 1, by));
      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      const x1 = Math.min(nx - 1, x0 + 1);
      const y1 = Math.min(ny - 1, y0 + 1);
      const tx = sx - x0;
      const ty = sy - y0;

      const i00 = idx(campo, x0, y0);
      const i10 = idx(campo, x1, y0);
      const i01 = idx(campo, x0, y1);
      const i11 = idx(campo, x1, y1);

      campo.u[i] =
        (uPrev[i00] * (1 - tx) + uPrev[i10] * tx) * (1 - ty) +
        (uPrev[i01] * (1 - tx) + uPrev[i11] * tx) * ty;
      campo.v[i] =
        (vPrev[i00] * (1 - tx) + vPrev[i10] * tx) * (1 - ty) +
        (vPrev[i01] * (1 - tx) + vPrev[i11] * tx) * ty;
    }
  }
}

function bordas(campo) {
  const { nx, ny, u, v } = campo;
  for (let x = 0; x < nx; x++) {
    const topo = idx(campo, x, 0);
    const base = idx(campo, x, ny - 1);
    u[topo] = v[topo] = u[base] = v[base] = 0;
  }
  for (let y = 0; y < ny; y++) {
    const esq = idx(campo, 0, y);
    const dir = idx(campo, nx - 1, y);
    u[esq] = v[esq] = u[dir] = v[dir] = 0;
  }
}

function projetar(campo) {
  const { nx, ny, u, v, p, div } = campo;

  for (let y = 1; y < ny - 1; y++) {
    for (let x = 1; x < nx - 1; x++) {
      const i = idx(campo, x, y);
      div[i] =
        (u[idx(campo, x + 1, y)] - u[idx(campo, x - 1, y)]) * 0.5 +
        (v[idx(campo, x, y + 1)] - v[idx(campo, x, y - 1)]) * 0.5;
      p[i] = 0;
    }
  }

  for (let k = 0; k < ITERACOES_PRESSAO; k++) {
    for (let y = 1; y < ny - 1; y++) {
      for (let x = 1; x < nx - 1; x++) {
        const i = idx(campo, x, y);
        p[i] =
          (p[idx(campo, x + 1, y)] +
            p[idx(campo, x - 1, y)] +
            p[idx(campo, x, y + 1)] +
            p[idx(campo, x, y - 1)] -
            div[i]) *
          0.25;
      }
    }
  }

  for (let y = 1; y < ny - 1; y++) {
    for (let x = 1; x < nx - 1; x++) {
      const i = idx(campo, x, y);
      u[i] -= (p[idx(campo, x + 1, y)] - p[idx(campo, x - 1, y)]) * 0.5;
      v[i] -= (p[idx(campo, x, y + 1)] - p[idx(campo, x, y - 1)]) * 0.5;
    }
  }

  bordas(campo);
}

function amostrar(campo, xPx, yPx) {
  const { nx, ny, u, v } = campo;
  const x = (xPx / campo.largura) * (nx - 1);
  const y = (yPx / campo.altura) * (ny - 1);

  const x0 = Math.max(0, Math.min(nx - 1, Math.floor(x)));
  const y0 = Math.max(0, Math.min(ny - 1, Math.floor(y)));
  const x1 = Math.min(nx - 1, x0 + 1);
  const y1 = Math.min(ny - 1, y0 + 1);
  const tx = x - x0;
  const ty = y - y0;

  const i00 = idx(campo, x0, y0);
  const i10 = idx(campo, x1, y0);
  const i01 = idx(campo, x0, y1);
  const i11 = idx(campo, x1, y1);

  return {
    u:
      (u[i00] * (1 - tx) + u[i10] * tx) * (1 - ty) +
      (u[i01] * (1 - tx) + u[i11] * tx) * ty,
    v:
      (v[i00] * (1 - tx) + v[i10] * tx) * (1 - ty) +
      (v[i01] * (1 - tx) + v[i11] * tx) * ty,
  };
}

export default function FluidBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Celular ganha grade mais grossa e menos partículas: mesma imagem,
    // custo por quadro compatível com o aparelho.
    const movel = window.matchMedia("(max-width: 900px)").matches;
    const TAMANHO_CELULA = movel ? 34 : 26;
    const QTD_PARTICULAS = movel ? 320 : 900;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

    let largura = window.innerWidth;
    let altura = window.innerHeight;
    let campo = criarCampo(largura, altura, TAMANHO_CELULA);

    const px = new Float32Array(QTD_PARTICULAS);
    const py = new Float32Array(QTD_PARTICULAS);

    function espalhar() {
      for (let i = 0; i < QTD_PARTICULAS; i++) {
        px[i] = Math.random() * largura;
        py[i] = Math.random() * altura;
      }
    }

    let primeiraMedida = true;

    function redimensionar() {
      const larguraAnterior = largura;
      const alturaAnterior = altura;

      // Mede o próprio canvas (fixed inset-0) em vez de window.innerHeight:
      // no celular a barra de endereço entra e sai o tempo todo e o
      // innerHeight muda junto, o que dispararia reinício sem parar.
      largura = canvas.clientWidth || window.innerWidth;
      altura = canvas.clientHeight || window.innerHeight;

      canvas.width = Math.floor(largura * DPR);
      canvas.height = Math.floor(altura * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.fillStyle = "#0b0c0e";
      ctx.fillRect(0, 0, largura, altura);

      campo = criarCampo(largura, altura, TAMANHO_CELULA);

      // Só reposiciona tudo em mudança de verdade (girar o aparelho,
      // redimensionar a janela). Numa variação pequena de altura as
      // partículas só são trazidas de volta pra dentro da área.
      const mudancaReal =
        Math.abs(largura - larguraAnterior) > 4 ||
        Math.abs(altura - alturaAnterior) > 120;

      if (primeiraMedida || mudancaReal) {
        espalhar();
        primeiraMedida = false;
      } else {
        for (let i = 0; i < QTD_PARTICULAS; i++) {
          px[i] = Math.min(px[i], largura);
          py[i] = Math.min(py[i], altura);
        }
      }
    }
    redimensionar();
    window.addEventListener("resize", redimensionar);

    let ponteiroX = largura * 0.5;
    let ponteiroY = altura * 0.5;
    let ultimoX = ponteiroX;
    let ultimoY = ponteiroY;
    let temPonteiro = false;

    const mover = (e) => {
      ponteiroX = e.clientX;
      ponteiroY = e.clientY;
      temPonteiro = true;
    };
    window.addEventListener("pointermove", mover, { passive: true });

    let raf = null;
    let ultimoT = 0;
    let tempo = 0;

    function quadro(t) {
      raf = requestAnimationFrame(quadro);

      const dt = ultimoT ? Math.min((t - ultimoT) / 1000, 0.05) : 0.016;
      ultimoT = t;
      tempo += dt;

      if (temPonteiro) {
        const dx = ponteiroX - ultimoX;
        const dy = ponteiroY - ultimoY;
        if (dx * dx + dy * dy > 1) {
          // Delta do ponteiro (px no quadro) vira px/s antes de entrar no
          // campo, senão a força fica dependente da taxa de quadros.
          const vx = dx / Math.max(1e-4, dt);
          const vy = dy / Math.max(1e-4, dt);
          empurrar(campo, ponteiroX, ponteiroY, vx, vy, largura * 0.09, 0.35);
        }
        ultimoX = ponteiroX;
        ultimoY = ponteiroY;
      }

      campo.uPrev.set(campo.u);
      campo.vPrev.set(campo.v);
      for (let i = 0; i < campo.u.length; i++) {
        campo.u[i] *= 0.985;
        campo.v[i] *= 0.985;
      }
      advectar(campo, dt);
      bordas(campo);
      projetar(campo);

      // Véu de carvão por cima do quadro anterior: é ele que transforma
      // os pontos em rastro que se apaga sozinho.
      ctx.fillStyle = "rgba(11, 12, 14, 0.09)";
      ctx.fillRect(0, 0, largura, altura);

      ctx.beginPath();
      for (let i = 0; i < QTD_PARTICULAS; i++) {
        const ax = px[i];
        const ay = py[i];
        const vel = amostrar(campo, ax, ay);

        // Deriva ambiente: sem ela a tela morre quando ninguém mexe o
        // mouse, e no celular quase ninguém arrasta o dedo pelo fundo.
        const derivaX = Math.sin(ay * 0.0032 + tempo * 0.22) * 42;
        const derivaY = Math.cos(ax * 0.0028 - tempo * 0.19) * 42;

        let bx = ax + (vel.u + derivaX) * dt;
        let by = ay + (vel.v + derivaY) * dt;

        let deuVolta = false;
        if (bx < 0) {
          bx += largura;
          deuVolta = true;
        } else if (bx > largura) {
          bx -= largura;
          deuVolta = true;
        }
        if (by < 0) {
          by += altura;
          deuVolta = true;
        } else if (by > altura) {
          by -= altura;
          deuVolta = true;
        }

        // Sem isso a partícula que sai por um lado e volta pelo outro
        // risca um traço atravessando a tela inteira.
        if (!deuVolta) {
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
        }

        px[i] = bx;
        py[i] = by;
      }
      ctx.strokeStyle = "rgba(200, 255, 61, 0.22)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Aba escondida não anima: economiza bateria no celular.
    const visibilidade = () => {
      if (document.hidden) {
        if (raf !== null) cancelAnimationFrame(raf);
        raf = null;
      } else if (raf === null) {
        ultimoT = 0;
        raf = requestAnimationFrame(quadro);
      }
    };
    document.addEventListener("visibilitychange", visibilidade);
    raf = requestAnimationFrame(quadro);

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener("resize", redimensionar);
      window.removeEventListener("pointermove", mover);
      document.removeEventListener("visibilitychange", visibilidade);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
