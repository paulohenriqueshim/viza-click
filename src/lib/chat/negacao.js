// Trava contra a Lia dizer que a Viza Click "não faz" uma coisa que faz.
//
// Criada em 12/11/2026, depois de um prejuízo real: a Lia respondeu pra
// visitante do site que a Viza Click não trabalha com sistema de escala, e
// o Paulo estava justamente fazendo um (o primeiro é do Posto do Açaí). O
// prompt dizia "só estes cinco produtos, fora disso não fazemos", e ela
// tratou o que não estava escrito como coisa que a Viza não faz. O Paulo
// perdeu cliente com isso.
//
// O prompt foi corrigido (o que não está lá ela não sabe, e não saber vira
// passagem pro Paulo), mas é a mesma lição do preço: o Haiku falha uma vez
// ou outra mesmo com a regra escrita. Por isso a rota confere a resposta:
// se ela negar um serviço fora da lista fechada do que a Viza realmente não
// faz, a resposta é trocada por uma passagem pro Paulo. Errar pro lado de
// passar pro Paulo custa um e-mail; errar pro lado de negar custa o cliente.

// Frases de "não fazemos". Primeira pessoa do plural, "a gente" ou a Viza
// como sujeito: assim "o cartão não abre avaliação" ou "você não precisa de
// app" não contam.
const NEGACAO = [
  /\bn[ãa]o (trabalhamos|fazemos|oferecemos|desenvolvemos|criamos|prestamos|atuamos|mexemos|vendemos|montamos|atendemos|lidamos|constru[íi]mos|implementamos|produzimos)\b/i,
  /\b(a viza( click)?|a gente|n[óo]s) (ainda )?n[ãa]o (faz|fazemos|trabalha|trabalhamos|oferece|oferecemos|desenvolve|cria|presta|atua|mexe|vende|monta|atende|lida|constr[óo]i|implementa|produz)\b/i,
  /\bn[ãa]o (temos|tem) (esse|essa|este|esta|isso|um|uma|nenhum|nenhuma|sistema|servi[çc]o|produto|solu[çc][ãa]o)\b.{0,40}\b(servi[çc]o|sistema|produto|solu[çc][ãa]o|tipo)/i,
  /\bn[ãa]o [ée] (bem |exatamente |muito )?(algo|o que|um servi[çc]o|um tipo de|uma coisa|um produto|uma solu[çc][ãa]o)\b.{0,40}\b(fa[zç]|oferec|trabalh|atu|desenvolv|cri)/i,
  /\bn[ãa]o [ée] (bem |exatamente |muito )?(um |uma )?(servi[çc]o|produto|solu[çc][ãa]o) (da viza|nosso|nossa)/i,
  /\bn[ãa]o [ée] (bem |exatamente |muito )?(a |o )?(nossa|nosso) (área|area|foco|forte|ramo|servi[çc]o|especialidade|praia)\b/i,
  /\bfora d[oa] (nosso|nossa) (escopo|[áa]rea|foco|ramo|servi[çc]o|servi[çc]os|especialidade)\b/i,
  /\bfora do que (a gente |a viza( click)? |n[óo]s )?(faz|fazemos|oferece|oferecemos)\b/i,
  // (?=\s) e não \b: sem a flag u, o \b do JS não enxerga "á" como letra.
  /\bn[ãa]o (est[áa]|entra|faz parte|consta)(?=\s).{0,25}\b(nossos|nossas) (servi[çc]os|produtos|solu[çc][õo]es)\b/i,
  /\bn[ãa]o [ée] com a gente\b/i,
];

// O que a Viza Click realmente não faz (lista fechada do prompt, seção
// QUANDO NÃO É COM A GENTE; atendimento com IA fora do site entra aqui
// desde a decisão de 05/11/2026), mais o que a Lia nega com razão: filtro de
// avaliação (regra do Google), atendimento presencial (é tudo online),
// preço (é com o Paulo) e pedido de abuso (redação, código etc.).
const PERMITIDO =
  /tr[áa]fego|an[úu]ncio|\bads\b|impulsion|redes sociais|social ?media|gest[ãa]o d[eo] (instagram|redes|perfil|perfis)|\bposts?\b|postage|\bartes?\b|v[íi]deos?|\breels?\b|stor(y|ies)|aplicativo|\bapps?\b|play ?store|app ?store|\berp\b|totvs|\bsap\b|suporte t[ée]cnico|consert|manuten[çc][ãa]o d[eo] (computador|m[áa]quina|impressora|celular|equipamento)|design de produto|embalage|whats|\bzap\b|telegram|messenger|instagram|\bdirect\b|\bdm\b|filtr|presencial|pessoalmente|escrit[óo]rio|loja f[íi]sica|pre[çc]o|valor|parcel|desconto|reda[çc][ãa]o|tradu[çc]|receita|li[çc][ãa]o de casa|tarefa da escola|c[óo]digo|programa[çc][ãa]o pra voc|poema|piada/i;

// Palavra de produto da Viza no trecho negado: aí a negação é errada mesmo
// que a pergunta tenha citado outra coisa permitida.
const PRODUTO_DA_VIZA =
  /sistema|escala|automa|planilha|\bsites?\b|landing|loja virtual|cart[ãa]o|agenda|cadastro|controle|relat[óo]rio|painel/i;

// Quebra a resposta em trechos: frase por frase e, dentro da frase, nas
// vírgulas e no "mas"/"só". Assim "não fazemos no WhatsApp, só no site" é
// julgado pelo trecho que nega (WhatsApp, permitido), e não pela palavra
// "site" que veio depois.
function trechos(texto) {
  return texto
    .split(/(?<=[.!?])\s+|\n+/)
    .flatMap((f) => f.split(/[,;:]|\s(?:mas|s[óo]|por[ée]m|e sim|apenas|somente)\s/i))
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Diz se a resposta da Lia nega um serviço que ela não tem como saber que
 * a Viza não faz.
 *
 * @param {string} resposta texto da Lia
 * @param {string} pergunta última mensagem do visitante
 * @returns {boolean}
 */
export function negouServico(resposta, pergunta = '') {
  if (!resposta) return false;

  for (const trecho of trechos(resposta)) {
    if (!NEGACAO.some((re) => re.test(trecho))) continue;

    // O próprio trecho fala de algo da lista do que não fazemos.
    if (PERMITIDO.test(trecho)) continue;

    // O trecho nega um produto da Viza (sistema, site, cartão...).
    if (PRODUTO_DA_VIZA.test(trecho)) return true;

    // Trecho genérico ("isso a gente não faz"): vale o que foi perguntado.
    // Pergunta que mistura coisa permitida com produto da Viza ("vídeo e
    // sistema de escala") cai pro lado seguro, a passagem.
    if (PERMITIDO.test(pergunta) && !PRODUTO_DA_VIZA.test(pergunta)) continue;

    return true;
  }

  return false;
}

// Frases da passagem quando a negação é barrada. Sorteadas pra não soar
// como resposta pronta (pedido do Paulo). Nenhuma afirma nem nega que a
// Viza faz aquilo: só põe o Paulo na conversa.
const FRASES_SEM_CONTATO = [
  'Isso quem te responde certinho é o Paulo, porque depende do seu caso. Me passa seu nome e um WhatsApp ou e-mail que ele te chama, ou chama ele direto no WhatsApp aqui embaixo.',
  'Essa eu deixo com o Paulo, que vê o seu caso de perto e monta tudo sob medida. Se me passar seu nome e um WhatsApp ou e-mail, ele te chama. Ou, se quiser adiantar, é só chamar ele no WhatsApp aqui embaixo.',
  'Isso o Paulo vê com você, porque cada projeto da Viza Click é feito do jeito do negócio. Me deixa seu nome e um contato (WhatsApp ou e-mail) que ele te procura, ou chama ele agora pelo botão do WhatsApp aqui embaixo.',
];

export function fraseDePassagem({ jaTemContato }) {
  if (jaTemContato) {
    return 'Isso o Paulo vê com você, e ele vai te chamar no contato que você deixou. Se quiser adiantar, é só chamar ele no WhatsApp aqui embaixo.';
  }
  return FRASES_SEM_CONTATO[Math.floor(Math.random() * FRASES_SEM_CONTATO.length)];
}
