// Evento que abre o chat da Lia a partir de qualquer lugar da página.
//
// O estado de aberto/fechado mora dentro do ChatWidget. Em vez de subir
// esse estado pra um contexto só pra dois botões, os CTAs disparam este
// evento e o widget escuta. Mantém o widget dono da própria lógica.
export const ABRIR_CHAT_EVENT = "vc:abrir-chat";

export function abrirChat() {
  window.dispatchEvent(new Event(ABRIR_CHAT_EVENT));
}
