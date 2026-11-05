// Notificação por e-mail quando o widget de chat faz handoff de um lead
// qualificado. Envia via SMTP da própria caixa contato@viza.click
// (Hostinger), usando nodemailer — sem depender de um serviço terceiro
// novo (Resend, SendGrid etc.), já que o domínio já tem e-mail contratado.
//
// LGPD: só o resumo do handoff sai do navegador (nome, negócio, dor,
// serviço indicado, contato se informado) — nunca o histórico completo da
// conversa, e nada disso é persistido em banco de dados.

import nodemailer from 'nodemailer';

const SERVICO_LABELS = {
  cartao_contato: 'Cartão Viza Click (só contato)',
  cartao_ia: 'Cartão Viza Click (contato + IA)',
  atendimento_ia: 'Atendimento com IA no site',
  cartao_avaliacao: 'Cartão de Avaliação (Google)',
  site: 'Site ou landing page',
  automacao: 'Automações e sistemas sob medida',
  presenca_digital: 'Presença digital (site + atendimento)',
  nao_definido: 'Não definido ainda',
};

// O assunto do e-mail precisa dizer, sem abrir, se aquilo exige ação sua
// agora ou se é só registro — desde que o lead frio também notifica, a
// caixa recebe os dois tipos misturados.
const SAIDA_LABELS = {
  quer_comprar: 'Quer comprar / pediu preço',
  reuniao_agendada: 'REUNIÃO MARCADA',
  pediu_humano: 'Pediu você ou dúvida que a Lia não sabe',
  abandonou: 'Saiu no meio da conversa',
};

function formatHandoffSummary(handoff) {
  const linhas = [
    `Tipo: ${SAIDA_LABELS[handoff.tipo_de_saida] || handoff.tipo_de_saida || 'não informado'}`,
    handoff.reuniao ? `>>> REUNIÃO: ${handoff.reuniao}` : null,
    handoff.nome ? `Nome: ${handoff.nome}` : null,
    `Negócio: ${handoff.negocio || 'não informado'}`,
    `O que quer / dúvida: ${handoff.dor_ou_necessidade || 'não informado'}`,
    handoff.ja_tentou ? `Já tentou: ${handoff.ja_tentou}` : null,
    `Produto de interesse: ${SERVICO_LABELS[handoff.servico_indicado] || handoff.servico_indicado || 'não definido'}`,
    handoff.contato ? `Contato informado: ${handoff.contato}` : null,
    `Resumo: ${handoff.resumo_para_atendente || ''}`,
  ].filter(Boolean);

  return linhas.join('\n');
}

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT, 10) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) return null;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL direto; 587 usa STARTTLS (secure: false)
    auth: { user, pass },
  });

  return cachedTransporter;
}

/**
 * @param {Record<string, string>} handoff
 */
export async function notifyHandoff(handoff) {
  const to = process.env.NOTIFY_EMAIL;
  const transporter = getTransporter();

  if (!transporter || !to) {
    // Sem config de e-mail, não derruba a conversa do lead — só loga no
    // servidor pra não perder o handoff silenciosamente.
    console.error('[chat] SMTP/NOTIFY_EMAIL não configurados — handoff não enviado por e-mail:', handoff);
    return;
  }

  const resumo = formatHandoffSummary(handoff);

  try {
    await transporter.sendMail({
      from: `"Widget Viza Click" <${process.env.SMTP_USER}>`,
      to,
      // "(sem contato)" no assunto: a Lia passa a venda assim que a pessoa
      // pergunta preço, antes de ela deixar telefone ou e-mail. Se ela
      // mandar o contato depois, chega um segundo e-mail, já com ele.
      subject: `[${SAIDA_LABELS[handoff.tipo_de_saida] || 'Contato'}] chat do site${handoff.nome ? ` — ${handoff.nome}` : ''}${handoff.contato ? '' : ' (sem contato)'}`,
      text: resumo,
    });
  } catch (err) {
    // Não propaga erro pro visitante do chat — ele já recebeu a mensagem de
    // encerramento. Só registra pra investigar depois.
    console.error('[chat] Falha ao enviar e-mail de handoff:', err);
  }
}
