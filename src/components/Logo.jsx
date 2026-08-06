/**
 * Marca da Viza Click.
 *
 * Conceito: um ponto sólido com anéis se expandindo ao redor. Lê ao mesmo
 * tempo como o pulso de um clique (a ação) e como uma lente/íris (a visão,
 * o "Viza"). Os cortes nos anéis são assimétricos e alinhados na diagonal
 * pra dar direção e movimento, evitando virar alvo de tiro ou ícone de wifi.
 *
 * Duas cores só: o traço herda a cor do texto (currentColor) e o miolo usa
 * o acento da marca. Sem gradiente, sem letra, sem inicial.
 */
export default function Logo({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="Viza Click"
    >
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
      <circle cx="32" cy="32" r="6" fill="currentColor" />
    </svg>
  );
}
