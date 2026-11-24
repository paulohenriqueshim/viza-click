// Constantes compartilhadas entre o preloader e o sistema de reveal de
// texto. Ficam num módulo só porque os dois precisam concordar sobre o
// mesmo instante: a hora em que a abertura revela o site.
//
// Estes tempos já foram encurtados uma vez (15/09/2026, na faxina de
// performance) e o Paulo mandou voltar no mesmo dia: a abertura rápida
// ficou apressada e a marca não aparecia. A abertura é o produto, não
// gordura pra cortar. Não encurtar de novo sem ele pedir. Em 24/11/2026
// a cortina virou a abertura "o clique" com estes mesmos tempos.

export const PRELOADER_DONE_EVENT = "vc:preloader-done";

// Respiro antes da timeline começar, pra fonte carregar e o primeiro
// frame não pegar o texto com a métrica errada.
export const PRELOADER_START_DELAY_S = 0.6;

// Instante absoluto (contando o delay acima) em que o círculo da
// abertura começa a crescer a partir do logo (era o instante em que a
// cortina antiga se partia; o tempo ficou igual de propósito). O texto do
// hero entra junto com esse movimento, então ele aterrissa enquanto o
// site aparece.
export const PRELOADER_HERO_DELAY_S = 3;
