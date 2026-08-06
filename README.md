# Viza Click

Site institucional da **Viza Click**, agência de inteligência artificial que implementa agentes de IA, automações e presença digital para negócios venderem todos os dias, inclusive fora do horário comercial.

🔗 [viza.click](https://viza.click)

## Stack

`Next.js 16 (App Router)` · `React 19` · `Tailwind CSS 4` · `GSAP (ScrollTrigger, SplitText)` · `Lenis`

## Destaques técnicos

- Efeito de hero **"Fall"**: cada palavra do título nasce coberta por um bloco sólido que "cai" com física (gravidade + rotação aleatória) ao rolar a página, revelando o texto. 100% tipográfico, não depende de nenhuma foto. Adaptado da biblioteca de efeitos da Viza Click (pacote "Scroll Animation", efeito #56) pra paleta de marca.
- Smooth scroll via Lenis sincronizado com GSAP ScrollTrigger.
- Paleta: fundo quase preto (`#0b0c0e`), texto off-white (`#f5f4f0`), acento único verde-limão (`#c8ff3d`) usado com moderação. Sem gradiente em nenhum lugar.
- Tipografia: Anton (display, títulos) + Inter (corpo), via `next/font/google`.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000).

## Pendências conhecidas

- **Logo**: favicon/mark atual (`src/app/icon.svg`) é um placeholder geométrico simples. O Paulo tem um logo pronto pra substituir.
- **Seção "O que já construímos"**: mostra só o próprio site e o bot de WhatsApp em desenvolvimento (não inventei case de cliente fictício). Trocar por projetos reais conforme forem entregues.
- Mais efeitos da biblioteca (`06-landing-pages/CLAUDE.md`) podem ser aplicados depois, sob pedido.

## Sobre

Site criado e mantido por [Paulo Shim](https://github.com/paulohenriqueshim), fundador da Viza Click.
