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
  landing_page: 'Landing Page',
  site_completo: 'Site completo',
  chatbot_whatsapp: 'Chatbot de IA para WhatsApp',
  conteudo_ia: 'Conteúdo com IA',
  automacao: 'Automação',
  presenca_digital: 'Presença digital (site + atendimento)',
  nao_definido: 'Não definido ainda',
};

// O assunto do e-mail precisa dizer, sem abrir, se aquilo exige ação sua
// agora ou se é só registro — desde que o lead frio também notifica, a
// caixa recebe os dois tipos misturados.
const SAIDA_LABELS = {
  lead_qualificado: 'Lead qualificado',
  reuniao_agendada: 'REUNIÃO MARCADA',
  pediu_humano: 'Pediu falar com você',
  lead_frio: 'Lead frio (só registro)',
  abandonou: 'Saiu no meio da conversa',
};

function formatHandoffSummary(handoff) {
  const linhas = [
    `Tipo: ${SAIDA_LABELS[handoff.tipo_de_saida] || handoff.tipo_de_saida || 'não informado'}`,
    handoff.reuniao ? `>>> REUNIÃO: ${handoff.reuniao}` : null,
    handoff.nome ? `Nome: ${handoff.nome}` : null,
    `Negócio: ${handoff.negocio || 'não informado'}`,
    `Dor/necessidade: ${handoff.dor_ou_necessidade || 'não informado'}`,
    handoff.ja_tentou ? `Já tentou: ${handoff.ja_tentou}` : null,
    `Serviço indicado: ${SERVICO_LABELS[handoff.servico_indicado] || handoff.servico_indicado || 'não definido'}`,
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
      subject: `[${SAIDA_LABELS[handoff.tipo_de_saida] || 'Contato'}] chat do site${handoff.nome ? ` — ${handoff.nome}` : ''}`,
      text: resumo,
    });
  } catch (err) {
    // Não propaga erro pro visitante do chat — ele já recebeu a mensagem de
    // encerramento. Só registra pra investigar depois.
    console.error('[chat] Falha ao enviar e-mail de handoff:', err);
  }
}
