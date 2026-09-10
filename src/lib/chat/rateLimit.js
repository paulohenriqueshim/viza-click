// Limite de requisições por IP para o endpoint público do chat.
//
// POR QUE ISSO EXISTE: /api/chat é público e cada chamada custa dinheiro (API
// da Anthropic). O widget tem um contador em sessionStorage, mas contador
// client-side é decorativo — qualquer um abre o DevTools e contorna. Sem uma
// trava no servidor, um script conseguiria gerar centenas de reais de fatura
// numa madrugada.
//
// LIMITAÇÃO CONHECIDA: o estado vive na memória da instância serverless. A
// Vercel pode rodar várias instâncias em paralelo, então o limite real é
// "N por instância", não N global. Isso segura abuso ingênuo (script simples
// de um IP só), que é o cenário provável aqui. Para trava dura e distribuída,
// o caminho é o rate limiting do WAF da Vercel, configurado no painel do
// projeto — recomendado ligar também, já que não custa código.

const JANELA_CURTA_MS = 60 * 1000;
const MAX_JANELA_CURTA = 20; // rajada: humano manda 1-3 msg/min, 20 é folgado

const JANELA_LONGA_MS = 60 * 60 * 1000;
const MAX_JANELA_LONGA = 120; // sustentado: conversa longa cabe, script não

const acessos = new Map();

// Evita a Map crescer sem fim numa instância de vida longa.
function limpar(agora) {
  for (const [ip, registros] of acessos) {
    const vivos = registros.filter((t) => agora - t < JANELA_LONGA_MS);
    if (vivos.length === 0) acessos.delete(ip);
    else acessos.set(ip, vivos);
  }
}

let ultimaLimpeza = 0;

/**
 * Extrai o IP do cliente. Na Vercel o IP real vem no x-forwarded-for; o
 * primeiro item da lista é o cliente, o resto são proxies.
 * @param {Request} request
 */
export function ipDaRequisicao(request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'desconhecido';
}

/**
 * Registra um acesso e diz se ele passa do limite.
 * @param {string} ip
 * @returns {{permitido: boolean, motivo?: string, esperarSegundos?: number}}
 */
export function verificarLimite(ip) {
  const agora = Date.now();

  if (agora - ultimaLimpeza > JANELA_LONGA_MS) {
    limpar(agora);
    ultimaLimpeza = agora;
  }

  const registros = (acessos.get(ip) || []).filter(
    (t) => agora - t < JANELA_LONGA_MS
  );

  const naJanelaCurta = registros.filter((t) => agora - t < JANELA_CURTA_MS);

  if (naJanelaCurta.length >= MAX_JANELA_CURTA) {
    const maisAntigo = Math.min(...naJanelaCurta);
    return {
      permitido: false,
      motivo: 'rajada',
      esperarSegundos: Math.ceil((JANELA_CURTA_MS - (agora - maisAntigo)) / 1000),
    };
  }

  if (registros.length >= MAX_JANELA_LONGA) {
    const maisAntigo = Math.min(...registros);
    return {
      permitido: false,
      motivo: 'volume',
      esperarSegundos: Math.ceil((JANELA_LONGA_MS - (agora - maisAntigo)) / 1000),
    };
  }

  registros.push(agora);
  acessos.set(ip, registros);
  return { permitido: true };
}
