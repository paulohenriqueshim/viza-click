// Endpoint do widget de chat do site. Roda como função serverless da Vercel
// (runtime Node — precisa ficar fora do Edge por causa do fetch simples e
// possível uso futuro de libs Node). A ANTHROPIC_API_KEY só existe aqui, no
// servidor — nunca é enviada ao navegador.

import { after } from 'next/server';

import { getAIReply } from '@/lib/chat/provider';
import { notifyHandoff } from '@/lib/chat/notify';

export const runtime = 'nodejs';

// Segunda camada de limite, além do contador em sessionStorage do widget:
// mesmo que alguém contorne o limite client-side, uma conversa individual
// não pode crescer sem controle (custo de API + payload).
const MAX_HISTORY_MESSAGES = 40;
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { history } = body || {};

  if (!Array.isArray(history) || history.length === 0) {
    return Response.json({ error: 'history é obrigatório' }, { status: 400 });
  }

  if (history.length > MAX_HISTORY_MESSAGES) {
    return Response.json({ error: 'Conversa muito longa' }, { status: 400 });
  }

  const validHistory = history.every(
    (m) =>
      m &&
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string' &&
      m.content.length > 0 &&
      m.content.length <= MAX_MESSAGE_LENGTH
  );

  if (!validHistory) {
    return Response.json({ error: 'history inválido' }, { status: 400 });
  }

  try {
    const { text, handoff } = await getAIReply(history);

    if (handoff) {
      // Roda DEPOIS da resposta ir pro lead, mas dentro do `after` do
      // Next: numa função serverless, uma promise solta (`notify().catch()`
      // sem await) morre junto com a instância assim que a resposta é
      // devolvida — o envio SMTP leva alguns segundos e nunca terminava,
      // então o e-mail de lead simplesmente não saía, sem erro nenhum
      // aparecer no log. O `after` mantém a função viva até o envio acabar
      // sem fazer o lead esperar por isso.
      after(async () => {
        try {
          await notifyHandoff(handoff);
        } catch (err) {
          console.error('[chat] erro ao notificar handoff:', err);
        }
      });
    }

    // Lead frio dispara a ferramenta só pra registrar a conversa pro Paulo —
    // a pessoa continua livre pra voltar a escrever. Fechar o campo aí seria
    // expulsar do chat justamente quem ainda estava em cima do muro.
    const encerrar = Boolean(handoff) && handoff.tipo_de_saida !== 'lead_frio';

    return Response.json({ reply: text, handoff: Boolean(handoff), encerrar });
  } catch (err) {
    console.error('[chat] erro ao chamar a IA:', err);
    return Response.json(
      { error: 'Não consegui responder agora. Tenta de novo em instantes.' },
      { status: 502 }
    );
  }
}
