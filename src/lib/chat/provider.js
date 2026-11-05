// Chamada direta à API da Anthropic, sem SDK — mesmo padrão usado no bot de
// WhatsApp (02-chatbot-ia/projetos/viza-whatsapp-bot/src/ai/provider.js).
// Só a função usada pelo widget (Claude) foi portada; o bot original também
// suporta OpenAI como alternativa, mas o site não precisa dessa opção.

import { buildSystemBlocks, HANDOFF_TOOL } from './systemPrompt';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
const AI_MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS, 10) || 500;

// Preço do Haiku 4.5 por milhão de tokens (USD). Cache de escrita custa 1,25x
// o input; cache de leitura, 0,10x — é daí que vem a economia.
const PRECO = { input: 1.0, output: 5.0, cacheWrite: 1.25, cacheRead: 0.1 };
const USD_BRL = parseFloat(process.env.USD_BRL) || 5.4;

/**
 * Estima o custo de UMA chamada a partir do bloco `usage` da resposta.
 * Serve pra medir de verdade em vez de estimar por tamanho de prompt — e,
 * principalmente, pra confirmar que o cache está pegando: se `cache_read`
 * vier zerado em chamadas seguidas da mesma conversa, alguma coisa está
 * invalidando o prefixo (tipicamente conteúdo variável antes do breakpoint).
 */
function estimarCusto(usage) {
  const usd =
    ((usage.input_tokens || 0) * PRECO.input +
      (usage.cache_creation_input_tokens || 0) * PRECO.cacheWrite +
      (usage.cache_read_input_tokens || 0) * PRECO.cacheRead +
      (usage.output_tokens || 0) * PRECO.output) /
    1e6;
  return { usd, brl: usd * USD_BRL };
}

/**
 * Rede de segurança pro que o prompt já proíbe e o modelo às vezes faz
 * mesmo assim (visto nos testes de 05/11/2026): travessão longo, que é regra
 * do Paulo pra todo texto da Viza, e negrito em markdown, que o chat mostra
 * cru, com os asteriscos.
 */
function limparTexto(texto) {
  return texto
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\s*—\s*/g, ', ')
    .replace(/,\s*([.,:;!?])/g, '$1')
    .trim();
}

/**
 * @typedef {{text: string, handoff: null | Record<string, string>,
 *   usage: object, custo: {usd: number, brl: number}}} AIReply
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
      // Array de blocos, não string: o primeiro bloco carrega o
      // `cache_control` e o de data/hora vem depois. Ver buildSystemBlocks().
      system: buildSystemBlocks(),
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

  const usage = data.usage || {};
  const custo = estimarCusto(usage);

  // Uma linha por chamada. Nos logs da Vercel dá pra filtrar por "[chat:uso]"
  // e somar o custo real do mês, em vez de estimar por tamanho de prompt.
  console.log(
    `[chat:uso] in=${usage.input_tokens || 0} out=${usage.output_tokens || 0} ` +
      `cache_read=${usage.cache_read_input_tokens || 0} ` +
      `cache_write=${usage.cache_creation_input_tokens || 0} ` +
      `custo=R$${custo.brl.toFixed(4)}`
  );

  // Alarme de regressão de custo. Os dois zerados juntos significam que a API
  // ignorou o cache_control, e o motivo mais provável é o prefixo ter caído
  // abaixo do mínimo do modelo (4.096 tokens no Haiku 4.5) depois de alguém
  // encurtar o prompt. É falha silenciosa: nada quebra, a conversa responde
  // normalmente, e a fatura sobe várias vezes. Ver o comentário do
  // systemPrompt.js.
  if (!usage.cache_read_input_tokens && !usage.cache_creation_input_tokens) {
    console.warn(
      '[chat:uso] ATENÇÃO: cache de prompt não pegou. Prefixo provavelmente ' +
        'abaixo do mínimo do modelo. Toda mensagem está custando preço cheio.'
    );
  }

  return {
    text: textBlock ? limparTexto(textBlock.text) : '',
    handoff: toolBlock ? toolBlock.input || {} : null,
    usage,
    custo,
  };
}
