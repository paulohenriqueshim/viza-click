// Endpoint do widget de chat do site. Roda como função serverless da Vercel
// (runtime Node — precisa ficar fora do Edge por causa do fetch simples e
// possível uso futuro de libs Node). A ANTHROPIC_API_KEY só existe aqui, no
// servidor — nunca é enviada ao navegador.

import { after } from 'next/server';

import { getAIReply } from '@/lib/chat/provider';
import { notifyHandoff } from '@/lib/chat/notify';
import { ipDaRequisicao, verificarLimite } from '@/lib/chat/rateLimit';

export const runtime = 'nodejs';

// Segunda camada de limite, além do contador em sessionStorage do widget:
// mesmo que alguém contorne o limite client-side, uma conversa individual
// não pode crescer sem controle (custo de API + payload).
const MAX_HISTORY_MESSAGES = 40;
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(request) {
  // Trava de custo ANTES de qualquer coisa: nada de gastar chamada de API (nem
  // fazer parse de body grande) por conta de quem está martelando o endpoint.
  const ip = ipDaRequisicao(request);
  const limite = verificarLimite(ip);
  if (!limite.permitido) {
    console.warn(`[chat] limite atingido (${limite.motivo}) para ${ip}`);
    return Response.json(
      { error: 'Muitas mensagens em pouco tempo. Espera um instante e tenta de novo.' },
      { status: 429, headers: { 'retry-after': String(limite.esperarSegundos) } }
    );
  }

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
    const { text, handoff, custo } = await getAIReply(history);

    // Abuso não vira e-mail. Quem está martelando o chat de propósito
    // adoraria transformar cada tentativa numa notificação na caixa do
    // Paulo: seria trocar gasto de API por spam. Fica no log do servidor,
    // que é onde isso interessa.
    const ehAbuso = handoff?.tipo_de_saida === 'abuso';

    if (ehAbuso) {
      console.warn(`[chat] conversa encerrada por abuso — ip ${ip}`);
    }

    if (handoff && !ehAbuso) {
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

    // O widget precisa saber COMO a conversa acabou pra escolher o que
    // mostrar no fim: prometer retorno do Paulo só faz sentido pra quem foi
    // qualificado. Quem ouviu que não é caso pra Viza Click recebe a porta
    // aberta do WhatsApp em vez de uma promessa, e quem veio abusar não
    // recebe nem uma coisa nem outra. Só o rótulo do desfecho vai pro
    // navegador, nunca o conteúdo do registro.
    const desfecho = !encerrar
      ? null
      : ehAbuso
        ? 'abuso'
        : handoff.tipo_de_saida === 'fora_do_perfil'
          ? 'fora_do_perfil'
          : 'handoff';

    // O custo por chamada não vai pra resposta — é só log de servidor. Expor
    // isso ao navegador entregaria de graça qual modelo e qual volume a gente
    // usa, além de não servir pra nada do lado do lead.
    if (handoff && custo) {
      console.log(`[chat] handoff concluído — custo desta chamada R$${custo.brl.toFixed(4)}`);
    }

    return Response.json({
      reply: text,
      handoff: Boolean(handoff),
      encerrar,
      desfecho,
    });
  } catch (err) {
    console.error('[chat] erro ao chamar a IA:', err);
    return Response.json(
      { error: 'Não consegui responder agora. Tenta de novo em instantes.' },
      { status: 502 }
    );
  }
}
