// Constantes compartilhadas entre o preloader, o scroll e o sistema de
// reveal de texto. Ficam num módulo só porque os três precisam concordar
// sobre o mesmo instante: a hora em que a cortina abre.

export const PRELOADER_DONE_EVENT = "vc:preloader-done";

// Respiro antes da timeline começar, pra fonte carregar e o primeiro
// frame não pegar o texto com a métrica errada.
export const PRELOADER_START_DELAY_S = 0.6;

// Instante absoluto (contando o delay acima) em que as duas metades
// começam a deslizar. O texto do hero entra junto com esse movimento,
// então ele aterrissa exatamente quando a cortina abre.
export const PRELOADER_HERO_DELAY_S = 3;
