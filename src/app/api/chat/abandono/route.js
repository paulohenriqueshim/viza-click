// Recebe o aviso de que um visitante saiu do site no meio da conversa.
// O servidor não tem como perceber isso sozinho: quem fecha a aba não
// manda mais nenhuma requisição. Quem avisa é o navegador, via
// navigator.sendBeacon no ChatWidget, que é a única forma de enviar algo
// que sobrevive ao fechamento da página.
//
// A conversa só vira e-mail se tiver informação concreta (nome, ramo,
// dor, contato). Quem entrou, digitou "oi" e fechou não gera aviso.

import { after } from 'next/server';

import { pareceVazio, analisarAbandono } from '@/lib/chat/abandono';
import { notifyHandoff } from '@/lib/chat/notify';

export const runtime = 'nodejs';

const MAX_HISTORY_MESSAGES = 40;
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  const { history } = body || {};

  // Este endpoint nunca conta pro cliente o que decidiu. Ele responde 204
  // em todo caminho, inclusive nos de recusa: quem chamou é um beacon de
  // página fechando, que não lê resposta nenhuma, e não faz sentido expor
  // pra fora o critério de quando o Paulo é ou não notificado.
  if (
    !Array.isArray(history) ||
    history.length === 0 ||
    history.length > MAX_HISTORY_MESSAGES
  ) {
    return new Response(null, { status: 204 });
  }

  const valido = history.every(
    (m) =>
      m &&
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string' &&
      m.content.length > 0 &&
      m.content.length <= MAX_MESSAGE_LENGTH
  );

  if (!valido || pareceVazio(history)) {
    return new Response(null, { status: 204 });
  }

  // Como no /api/chat: o trabalho pesado roda dentro do `after` pra não
  // ser cortado quando a função devolve a resposta.
  after(async () => {
    try {
      const campos = await analisarAbandono(history);
      if (!campos) return; // conversa sem informação aproveitável
      await notifyHandoff({ ...campos, tipo_de_saida: 'abandonou' });
    } catch (err) {
      console.error('[chat] erro ao processar abandono:', err);
    }
  });

  return new Response(null, { status: 204 });
}
