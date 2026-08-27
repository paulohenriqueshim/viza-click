// Decide se uma conversa abandonada (visitante fechou a aba sem se
// despedir) tem informação concreta o suficiente pra valer um e-mail pro
// Paulo. A regra dele: quem sai sem dizer nada de útil não vira aviso;
// quem já deu nome, ramo do negócio ou uma dor, vira.
//
// Roda em dois estágios de propósito. O primeiro é uma peneira local e
// gratuita, que descarta "oi" e teste sem gastar chamada de API — a maior
// parte dos abandonos é isso. Só o que passa dela custa uma chamada.

const SAUDACOES = new Set([
  'oi', 'ola', 'olá', 'opa', 'eae', 'e ai', 'e aí', 'bom dia', 'boa tarde',
  'boa noite', 'teste', 'test', 'hey', 'hi', 'alo', 'alô', '?', '...',
  'oii', 'oiii', 'blz', 'beleza',
]);

/**
 * Peneira barata: dá pra descartar sem consultar a IA?
 * @param {{role: string, content: string}[]} history
 */
export function pareceVazio(history) {
  const doUsuario = history
    .filter((m) => m.role === 'user')
    .map((m) => m.content.trim())
    .filter(Boolean);

  if (doUsuario.length === 0) return true;

  const texto = doUsuario.join(' ').toLowerCase().trim();

  // Só saudação ou teste, numa mensagem só.
  if (doUsuario.length === 1 && SAUDACOES.has(texto.replace(/[.!?]+$/, ''))) {
    return true;
  }

  // Curto demais pra caber nome, ramo ou dor.
  return texto.replace(/\s+/g, '').length < 12;
}

const EXTRACAO_SYSTEM = `
Você recebe o histórico de uma conversa que um visitante teve com o chat da
Viza.click (agência de IA) e abandonou sem se despedir. Sua tarefa é decidir
se sobrou informação concreta o bastante pra valer avisar o Paulo, dono da
agência, e extrair o que houver.

CONTA COMO INFORMAÇÃO CONCRETA (qualquer uma já basta):
- O nome da pessoa.
- O ramo, profissão ou tipo de negócio dela.
- Uma dor, gargalo ou necessidade que ela descreveu.
- Um serviço específico que ela pediu.
- Um contato que ela deixou (telefone, e-mail).

NÃO CONTA COMO INFORMAÇÃO CONCRETA:
- Só saudação ("oi", "bom dia").
- Só teste ("teste", "asdf", "123").
- Pergunta genérica sem nada sobre quem está perguntando ("quanto custa?",
  "vocês fazem site?") quando o visitante não disse nada sobre si.
- Conversa em que só a atendente falou.

Seja conservador: na dúvida entre avisar e não avisar por causa de
informação vaga demais, NÃO avise. O objetivo é que todo e-mail que chegue
tenha serventia real.

Chame sempre a ferramenta registrar_abandono, com tem_info_relevante true
ou false conforme a análise.
`.trim();

const EXTRACAO_TOOL = {
  name: 'registrar_abandono',
  description:
    'Registra a análise da conversa abandonada, dizendo se há informação concreta e extraindo o que foi possível apurar.',
  input_schema: {
    type: 'object',
    properties: {
      tem_info_relevante: {
        type: 'boolean',
        description:
          'true se a conversa tem pelo menos uma informação concreta sobre o visitante ou o negócio dele; false se foi só saudação, teste ou pergunta genérica.',
      },
      nome: { type: 'string', description: 'Nome do visitante, se ele informou.' },
      negocio: {
        type: 'string',
        description: 'Ramo, profissão ou tipo de negócio, se apareceu.',
      },
      dor_ou_necessidade: {
        type: 'string',
        description: 'Dor, gargalo ou pedido que apareceu na conversa, se apareceu.',
      },
      contato: {
        type: 'string',
        description: 'Telefone ou e-mail deixado pelo visitante, se deixou.',
      },
      resumo_para_atendente: {
        type: 'string',
        description:
          'Resumo em no máximo 20 palavras do que aconteceu e onde a conversa parou.',
      },
    },
    required: ['tem_info_relevante', 'resumo_para_atendente'],
  },
};

/**
 * @param {{role: 'user'|'assistant', content: string}[]} history
 * @returns {Promise<null | Record<string, string>>} campos pro e-mail, ou null
 */
export async function analisarAbandono(history) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY não configurada');

  const transcricao = history
    .map((m) => `${m.role === 'user' ? 'VISITANTE' : 'LIA'}: ${m.content}`)
    .join('\n');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: EXTRACAO_SYSTEM,
      tools: [EXTRACAO_TOOL],
      tool_choice: { type: 'tool', name: 'registrar_abandono' },
      messages: [{ role: 'user', content: transcricao }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  const bloco = (data.content || []).find(
    (b) => b.type === 'tool_use' && b.name === 'registrar_abandono'
  );

  if (!bloco?.input?.tem_info_relevante) return null;

  const { tem_info_relevante, ...campos } = bloco.input;
  return campos;
}
