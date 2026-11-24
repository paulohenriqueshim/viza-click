export const WHATSAPP_NUMBER = "5511995945650";

// Mensagem genérica. É a mesma que o bot temporário da escala (VPS) usava
// como gatilho exato em 13/11/2026: não mudar o texto sem lembrar disso.
export const WHATSAPP_MESSAGE = "Olá! Vim pelo site da Viza Click e quero saber mais.";

// Mensagem pronta por assunto (24/11/2026). Quem chega pelo Instagram quer
// falar logo; com o assunto escrito na primeira mensagem, o Paulo já sabe o
// que a pessoa quer sem precisar perguntar, e a pessoa não precisa pensar no
// que escrever. Começam todas igual pra ele bater o olho e saber que veio do
// site.
export const ASSUNTOS = {
  escala: "Olá! Vim pelo site da Viza Click e quero saber do sistema de escala.",
  cartao: "Olá! Vim pelo site da Viza Click e quero saber do Cartão Viza Click.",
  atendimento: "Olá! Vim pelo site da Viza Click e quero saber do atendimento com IA no site.",
  avaliacao: "Olá! Vim pelo site da Viza Click e quero saber do Cartão de Avaliação.",
  site: "Olá! Vim pelo site da Viza Click e quero um site.",
  sistema: "Olá! Vim pelo site da Viza Click e quero saber de automação ou sistema sob medida.",
};

export function whatsappUrl(assunto) {
  const mensagem = ASSUNTOS[assunto] || WHATSAPP_MESSAGE;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
}

export const WHATSAPP_URL = whatsappUrl();
export const INSTAGRAM_URL = "https://instagram.com/viza.click";
export const EMAIL = "contato@viza.click";
