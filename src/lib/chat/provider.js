// Chamada direta à API da Anthropic, sem SDK — mesmo padrão usado no bot de
// WhatsApp (02-chatbot-ia/projetos/viza-whatsapp-bot/src/ai/provider.js).
// Só a função usada pelo widget (Claude) foi portada; o bot original também
// suporta OpenAI como alternativa, mas o site não precisa dessa opção.

import { SYSTEM_PROMPT, HANDOFF_TOOL } from './systemPrompt';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
const AI_MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS, 10) || 500;

/**
 * @typedef {{text: string, handoff: null | Record<string, string>}} AIReply
 */

/**
 * @param {{role: 'user'|'assistant', content: string}[]} history
 * @returns {Promise<AIReply>}
 */
export async function getAIReply(history) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY não configurada nas variáveis de ambiente');
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: AI_MAX_TOKENS,
      system: SYSTEM_PROMPT,
      tools: [HANDOFF_TOOL],
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const blocks = data.content || [];

  const textBlock = blocks.find((b) => b.type === 'text');
  const toolBlock = blocks.find((b) => b.type === 'tool_use' && b.name === 'handoff_to_team');

  return {
    text: textBlock ? textBlock.text.trim() : '',
    handoff: toolBlock ? toolBlock.input || {} : null,
  };
}
