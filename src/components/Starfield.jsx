"use client";

import { useEffect, useRef } from "react";

/**
 * Campo de estrelas em WebGL, adaptado do componente "galaxy" que o Paulo
 * mandou (26/08/2026), em substituição ao fundo de fluido anterior.
 *
 * O original foi bastante enxugado, porque boa parte dele era código que
 * nunca rodava com os parâmetros escolhidos:
 *
 * - `saturation: 0` deixa toda estrela branca, então a conversão HSV
 *   inteira e o giro de matiz (`hueShift`) foram removidos: sobra o canal
 *   de maior valor, que dá o mesmo resultado por muito menos conta.
 *   Estrela branca também é o que combina com a paleta da marca.
 * - `rotation: [1, 0]` é matriz identidade, `focal: [0.5, 0.5]` é o centro
 *   e `autoCenterRepulsion: 0` desliga aquele ramo inteiro. Os três saíram.
 * - `uTransparent` e `uMouseRepulsion` eram constantes ligadas, viraram o
 *   comportamento fixo.
 *
 * O que sobrou de parâmetro está em CONFIG e entra no shader como
 * constante na hora de compilar, então não existe uniform pra valor que
 * nunca muda. Sobram cinco: tempo, resolução, profundidade e o ponteiro.
 *
 * A discrição é o ponto. O fundo anterior enjoava porque empurrava a tela
 * inteira numa onda contínua; aqui o que se move é pontinho de luz, devagar,
 * e o ponteiro só afasta as estrelas que estão por perto.
 */
const CONFIG = {
  densidade: 0.7,
  brilho: 0.18,
  cintilancia: 0.12,
  rotacao: 0.08,
  repulsao: 1.6,
  velocidade: 0.5,
};

// Limite de quadros. 24fps é de sobra pra um fundo que se move devagar e
// corta quase pela metade o custo de uma tela cheia de fragment shader.
const MS_POR_QUADRO = 42;

// GLSL não aceita "1" onde espera float: precisa de "1.0".
const f = (n) => (Number.isInteger(n) ? `${n}.0` : `${n}`);

const VERTEX_SRC = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SRC = `
precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uProfundidade;
uniform vec2 uPonteiro;
uniform float uPonteiroAtivo;

varying vec2 vUv;

#define CAMADAS 2.0
#define PERIODO 3.0
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define CORTE 0.2

#define DENSIDADE ${f(CONFIG.densidade)}
#define BRILHO ${f(CONFIG.brilho)}
#define CINTILANCIA ${f(CONFIG.cintilancia)}
#define ROTACAO ${f(CONFIG.rotacao)}
#define REPULSAO ${f(CONFIG.repulsao)}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

float estrela(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * BRILHO) / max(d, 1e-4);

  float raios = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 800.0));
  m += raios * flare * BRILHO;

  uv *= MAT45;
  raios = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 800.0));
  m += raios * 0.25 * flare * BRILHO;

  return m * smoothstep(1.0, 0.2, d);
}

float camada(vec2 uv) {
  float soma = 0.0;
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 celula = id + offset;

      float semente = hash21(celula);
      float tamanho = fract(semente * 345.32);
      float flare = smoothstep(0.9, 1.0, tamanho)
        * tri(uProfundidade / (PERIODO * semente + 1.0));

      // Sem HSV: com saturação zero o resultado da conversão é sempre o
      // maior dos três canais, então usa ele direto.
      float r = smoothstep(CORTE, 1.0, hash21(celula + 1.0)) + CORTE;
      float b = smoothstep(CORTE, 1.0, hash21(celula + 3.0)) + CORTE;
      float g = min(r, b) * semente;
      float valor = max(max(r, g), b);

      vec2 deriva = vec2(
        tris(semente * 34.0 + uTime / 10.0),
        tris(semente * 38.0 + uTime / 30.0)
      ) - 0.5;

      float cintila = mix(
        1.0,
        trisn(uTime + semente * 6.2831) * 0.5 + 1.0,
        CINTILANCIA
      );

      soma += estrela(gv - offset - deriva, flare) * tamanho * valor * cintila;
    }
  }

  return soma;
}

void main() {
  float aspecto = uResolution.x / uResolution.y;
  vec2 uv = (vUv - 0.5) * vec2(aspecto, 1.0);

  // O ponteiro afasta as estrelas que estão por perto. É a única coisa
  // aqui que reage a alguma coisa, e some sozinha quando o mouse sai.
  vec2 ponteiro = (uPonteiro - 0.5) * vec2(aspecto, 1.0);
  float dist = length(uv - ponteiro);
  uv += normalize(uv - ponteiro) * (REPULSAO / (dist + 0.1)) * 0.05 * uPonteiroAtivo;

  float angulo = uTime * ROTACAO;
  uv = mat2(cos(angulo), -sin(angulo), sin(angulo), cos(angulo)) * uv;

  float luz = 0.0;
  for (float i = 0.0; i < 1.0; i += 1.0 / CAMADAS) {
    float p = fract(i + uProfundidade);
    float escala = mix(20.0 * DENSIDADE, 0.5 * DENSIDADE, p);
    luz += camada(uv * escala + i * 453.32) * p * smoothstep(1.0, 0.9, p);
  }

  // Branco puro: a cor do fundo vem do carvão do body, por trás do canvas.
  gl_FragColor = vec4(vec3(luz), min(smoothstep(0.0, 0.3, luz), 1.0));
}
`;

function compilar(gl, tipo, src) {
  const sh = gl.createShader(tipo);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const opcoes = { alpha: true, antialias: false, premultipliedAlpha: false };
    const gl =
      canvas.getContext("webgl", opcoes) ||
      canvas.getContext("experimental-webgl", opcoes);

    // Sem WebGL o fundo simplesmente fica no carvão do body. Nada quebra.
    if (!gl) return;

    const vs = compilar(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compilar(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    // Um triângulo só, maior que a tela, em vez de dois formando um
    // retângulo: cobre o mesmo sem a costura na diagonal do meio.
    const atributo = (nome, dados) => {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dados), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, nome);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      return buf;
    };
    const bufPos = atributo("position", [-1, -1, 3, -1, -1, 3]);
    const bufUv = atributo("uv", [0, 0, 2, 0, 0, 2]);

    const uTime = gl.getUniformLocation(program, "uTime");
    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uProfundidade = gl.getUniformLocation(program, "uProfundidade");
    const uPonteiro = gl.getUniformLocation(program, "uPonteiro");
    const uPonteiroAtivo = gl.getUniformLocation(program, "uPonteiroAtivo");

    // "pointer: fine" é o que separa mouse de dedo de verdade, melhor que
    // largura de tela: tablet grande com toque cai no caminho certo.
    const ponteiroFino = window.matchMedia("(pointer: fine)").matches;
    const DPR = ponteiroFino ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;

    let larguraCss = 0;
    let alturaCss = 0;
    let alturaRolavel = 1;

    function redimensionar() {
      const l = canvas.clientWidth;
      const a = canvas.clientHeight;

      // No celular a barra de endereço entra e sai durante o scroll e a
      // altura da viewport muda junto, o tempo todo. Redimensionar o
      // canvas a cada mudancinha dessas realoca buffer de GPU no meio da
      // rolagem e trava. Variação pequena só de altura é ignorada.
      const mudouLargura = Math.abs(l - larguraCss) > 4;
      const mudouAltura = Math.abs(a - alturaCss) > 120;
      if (larguraCss && !mudouLargura && !mudouAltura) return;

      larguraCss = l;
      alturaCss = a;

      const largura = Math.max(1, Math.floor(l * DPR));
      const altura = Math.max(1, Math.floor(a * DPR));
      canvas.width = largura;
      canvas.height = altura;
      gl.viewport(0, 0, largura, altura);
      gl.uniform2f(uResolution, largura, altura);
    }
    redimensionar();
    window.addEventListener("resize", redimensionar);

    // Quanto ainda dá pra rolar. Fica guardado porque ler scrollHeight
    // força cálculo de layout, e isso não pode acontecer a cada quadro.
    const medirRolagem = () => {
      alturaRolavel = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
    };
    medirRolagem();
    const observador = new ResizeObserver(medirRolagem);
    observador.observe(document.body);

    // O canvas é pointer-events-none e fica atrás de tudo, então quem
    // escuta o ponteiro é a janela, não o elemento.
    const alvo = { x: 0.5, y: 0.5, ativo: 0 };
    const suave = { x: 0.5, y: 0.5, ativo: 0 };

    const mover = (e) => {
      alvo.x = e.clientX / window.innerWidth;
      alvo.y = 1 - e.clientY / window.innerHeight;
      alvo.ativo = 1;
    };
    const sair = () => {
      alvo.ativo = 0;
    };
    // Só no mouse: no toque o loop de render sobrescreve isso com a
    // posição da rolagem a cada quadro, então escutar seria desperdício.
    if (ponteiroFino) {
      window.addEventListener("pointermove", mover, { passive: true });
      document.addEventListener("pointerleave", sair);
    }

    let raf = null;
    let ultimoQuadro = 0;

    function quadro(t) {
      raf = requestAnimationFrame(quadro);
      if (t - ultimoQuadro < MS_POR_QUADRO) return;
      ultimoQuadro = t;

      const segundos = t * 0.001;
      gl.uniform1f(uTime, segundos);
      gl.uniform1f(uProfundidade, (segundos * CONFIG.velocidade) / 10);

      // Celular não tem mouse pra passar por cima do fundo, e durante o
      // scroll o navegador cancela os eventos de ponteiro, então lá a
      // repulsão nunca dispararia e sobraria só a rotação. Quem move o
      // foco no toque é a rolagem, que é a única coisa que a pessoa faz
      // na página: o vazio entre as estrelas desce junto com ela.
      // É leitura de propriedade barata, não força layout (por isso
      // alturaRolavel fica guardado em vez de ser medido aqui).
      if (!ponteiroFino) {
        alvo.x = 0.5;
        alvo.y = 1 - Math.min(1, Math.max(0, window.scrollY / alturaRolavel));
        alvo.ativo = 1;
      }

      const k = 0.05;
      suave.x += (alvo.x - suave.x) * k;
      suave.y += (alvo.y - suave.y) * k;
      suave.ativo += (alvo.ativo - suave.ativo) * k;
      gl.uniform2f(uPonteiro, suave.x, suave.y);
      gl.uniform1f(uPonteiroAtivo, suave.ativo);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // Aba escondida não anima: economiza bateria no celular.
    const visibilidade = () => {
      if (document.hidden) {
        if (raf !== null) cancelAnimationFrame(raf);
        raf = null;
      } else if (raf === null) {
        ultimoQuadro = 0;
        raf = requestAnimationFrame(quadro);
      }
    };
    document.addEventListener("visibilitychange", visibilidade);
    raf = requestAnimationFrame(quadro);

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      observador.disconnect();
      window.removeEventListener("resize", redimensionar);
      window.removeEventListener("pointermove", mover);
      document.removeEventListener("pointerleave", sair);
      document.removeEventListener("visibilitychange", visibilidade);

      gl.deleteBuffer(bufPos);
      gl.deleteBuffer(bufUv);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
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
