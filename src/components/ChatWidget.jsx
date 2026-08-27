"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { WHATSAPP_URL } from "@/lib/contact";
import { ABRIR_CHAT_EVENT } from "@/lib/chat-ui";

// Limite simples de mensagens por sessão de navegador — contorna abuso
// básico sem precisar de banco de dados externo (decisão registrada no
// plano de migração do bot de WhatsApp pro site). É client-side, então
// contornável por quem souber limpar o sessionStorage; suficiente pro
// volume inicial. O backend (src/app/api/chat/route.js) também limita o
// tamanho da conversa como segunda camada.
const MAX_MESSAGES_PER_SESSION = 20;
const STORAGE_KEY = "vc-chat-history";
const COUNT_KEY = "vc-chat-count";
// Marca que esta conversa já virou aviso pro Paulo (seja porque a Lia
// chamou o handoff, seja porque o beacon de saída já foi enviado). Fica no
// sessionStorage pra sobreviver a um F5 no meio da conversa.
const REPORTED_KEY = "vc-chat-reportado";

const GREETING = {
  role: "assistant",
  content:
    "Oi! Sou a Lia, da Viza Click. Me conta rapidinho o que seu negócio faz que eu já te digo onde a IA pode ajudar.",
};

function loadSession(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveSession(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sessionStorage indisponível (modo privado etc.) — segue sem persistir.
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [count, setCount] = useState(0);
  const [ended, setEnded] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const painelRef = useRef(null);
  const hydrated = useRef(false);
  // Espelho das mensagens num ref: o listener de saída da página é
  // registrado uma vez só e leria um `messages` congelado no primeiro
  // render se dependesse do estado.
  const messagesRef = useRef(messages);
  const jaReportou = useRef(false);

  // Hidrata a partir do sessionStorage só no cliente, depois do primeiro
  // render, pra não divergir do HTML gerado no servidor (SSR).
  useEffect(() => {
    const savedMessages = loadSession(STORAGE_KEY, null);
    const savedCount = loadSession(COUNT_KEY, 0);
    if (savedMessages && savedMessages.length > 0) setMessages(savedMessages);
    setCount(savedCount);
    if (savedCount >= MAX_MESSAGES_PER_SESSION) setEnded(true);
    if (loadSession(REPORTED_KEY, false)) jaReportou.current = true;
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveSession(STORAGE_KEY, messages);
  }, [messages]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Quem fecha a aba no meio da conversa não manda mais nenhuma
  // requisição, então o servidor nunca saberia que essa pessoa existiu. O
  // sendBeacon é a única forma de mandar algo que sobrevive ao
  // fechamento da página (um fetch comum é cancelado no meio).
  //
  // O `pagehide` cobre fechar a aba e navegar pra fora; o
  // `visibilitychange` cobre o celular, onde trocar de app às vezes é a
  // última coisa que acontece antes do navegador matar a página. Isso faz
  // com que trocar de app e voltar também conte como saída — preferimos
  // avisar demais a perder um lead, e o servidor ainda descarta o que não
  // tiver informação concreta.
  useEffect(() => {
    const reportarSaida = () => {
      if (jaReportou.current) return;

      const historico = messagesRef.current;
      // Sem nada digitado não há o que avisar (a saudação é da Lia).
      if (!historico.some((m) => m.role === "user")) return;

      jaReportou.current = true;
      saveSession(REPORTED_KEY, true);

      try {
        navigator.sendBeacon(
          "/api/chat/abandono",
          new Blob([JSON.stringify({ history: historico })], {
            type: "application/json",
          })
        );
      } catch {
        // Navegador sem sendBeacon: perde-se o aviso, mas nunca a conversa.
      }
    };

    const aoEsconder = () => {
      if (document.visibilityState === "hidden") reportarSaida();
    };

    document.addEventListener("visibilitychange", aoEsconder);
    window.addEventListener("pagehide", reportarSaida);

    return () => {
      document.removeEventListener("visibilitychange", aoEsconder);
      window.removeEventListener("pagehide", reportarSaida);
    };
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  // Os CTAs da página abrem o chat por evento, sem precisar subir este
  // estado pra um contexto só por causa de dois botões.
  useEffect(() => {
    const abrir = () => setOpen(true);
    window.addEventListener(ABRIR_CHAT_EVENT, abrir);
    return () => window.removeEventListener(ABRIR_CHAT_EVENT, abrir);
  }, []);

  // No iPhone, quando o teclado sobe, o viewport de LAYOUT não muda, só o
  // visual. Um painel com height 100% continua do tamanho da tela inteira
  // e empurra o campo de texto pra debaixo do teclado. Aqui o painel é
  // medido pelo visualViewport, que é o que de fato está visível, e o
  // offsetTop reposiciona ele quando o iOS desloca a página.
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    const painel = painelRef.current;
    if (!vv || !painel) return;

    const limpar = () => {
      painel.style.height = "";
      painel.style.transform = "";
    };

    const ajustar = () => {
      // Só no mobile: no desktop o painel é uma caixa flutuante de
      // tamanho fixo e não tem teclado empurrando nada.
      if (!window.matchMedia("(max-width: 767px)").matches) {
        limpar();
        return;
      }
      painel.style.height = `${vv.height}px`;
      painel.style.transform = `translateY(${vv.offsetTop}px)`;
    };

    ajustar();
    vv.addEventListener("resize", ajustar);
    vv.addEventListener("scroll", ajustar);
    window.addEventListener("orientationchange", ajustar);

    return () => {
      vv.removeEventListener("resize", ajustar);
      vv.removeEventListener("scroll", ajustar);
      window.removeEventListener("orientationchange", ajustar);
      limpar();
    };
  }, [open]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending || ended) return;

    if (count >= MAX_MESSAGES_PER_SESSION) {
      setEnded(true);
      return;
    }

    const nextHistory = [...messages, { role: "user", content: text }];
    setMessages(nextHistory);
    setInput("");
    setSending(true);
    setErrorMsg("");

    // Devolve o foco pro campo ainda DENTRO do gesto de envio (clique no
    // botão ou Enter). Sem isso, quem envia clicando no botão deixa o foco
    // no botão e precisa clicar no campo de novo pra continuar escrevendo.
    // Tem que ser síncrono aqui: no iOS, focus() disparado depois do await
    // do fetch já está fora do gesto do usuário e o teclado não sobe.
    inputRef.current?.focus();

    const nextCount = count + 1;
    setCount(nextCount);
    saveSession(COUNT_KEY, nextCount);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ history: nextHistory }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao responder");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      // A Lia já registrou esta conversa (inclusive lead frio), então o
      // beacon de saída não pode mandar um segundo e-mail da mesma pessoa.
      if (data.handoff) {
        jaReportou.current = true;
        saveSession(REPORTED_KEY, true);
      }
      if (data.encerrar) setEnded(true);
    } catch (err) {
      setErrorMsg(
        err.message || "Não consegui responder agora. Tenta de novo em instantes."
      );
    } finally {
      setSending(false);
    }

    if (nextCount >= MAX_MESSAGES_PER_SESSION) setEnded(true);
  }

  return (
    <>
      {/* Botão flutuante — z acima do Header (z-50) pra ficar sempre no topo. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Fechar chat" : "Abrir chat com a Viza Click"}
        className={`fixed bottom-5 right-5 md:bottom-8 md:right-8 z-[60] inline-flex items-center gap-2.5 bg-accent text-bg rounded-full pl-4 pr-5 py-3.5 shadow-none hover:opacity-90 transition-opacity ${
          open ? "max-md:hidden" : ""
        }`}
      >
        {open ? (
          <CloseIcon />
        ) : (
          <>
            <Logo size={20} />
            <span className="font-body font-medium text-sm hidden sm:inline">
              Falar com a Lia
            </span>
          </>
        )}
      </button>

      {open && (
        <div
          ref={painelRef}
          data-lenis-prevent
          className="fixed inset-0 z-[59] flex h-[100dvh] w-full flex-col overflow-hidden border border-border bg-bg md:inset-auto md:bottom-24 md:right-8 md:h-[560px] md:max-h-[75vh] md:w-[380px] md:rounded-2xl"
          role="dialog"
          aria-label="Chat com a Viza Click"
        >
          {/* Cabeçalho — o X só aparece no mobile, onde o painel cobre a
              tela inteira e não há botão flutuante visível pra fechar
              (no desktop o botão flutuante continua acima do painel). */}
          <div className="flex items-center gap-2.5 border-b border-border bg-bg/85 backdrop-blur-sm px-5 py-4 shrink-0">
            <Logo size={22} className="text-accent" />
            <div className="flex flex-col leading-tight flex-1">
              <span className="font-body font-semibold text-sm text-fg">Lia — Viza Click</span>
              <span className="font-body text-xs text-fg-muted">
                Responde na hora, sem enrolação
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar chat"
              className="md:hidden -mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-fg-muted transition-colors hover:text-fg"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Mensagens */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {messages.map((m, i) => (
              <ChatBubble key={i} role={m.role} content={m.content} />
            ))}
            {sending && <TypingBubble />}
            {errorMsg && (
              <p className="text-xs text-fg-muted bg-bg-elevated border border-border rounded-xl px-4 py-3">
                {errorMsg}
              </p>
            )}
            {ended && !errorMsg && <EndedNotice />}
          </div>

          {/* Campo de mensagem.

              O input NÃO leva `disabled={sending}` de propósito: desabilitar
              um campo faz o navegador tirar o foco dele, e reabilitar não
              devolve — era isso que obrigava a clicar no campo de novo a
              cada mensagem enviada. Sem o disabled, dá pra continuar
              escrevendo enquanto a Lia responde, e no celular o teclado não
              fecha e reabre a cada envio. Quem segura o envio duplicado é o
              botão (disabled) mais a checagem de `sending` no handleSend. */}
          {!ended && (
            <form onSubmit={handleSend} className="flex shrink-0 items-center gap-2 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escreve aqui..."
                maxLength={2000}
                className="min-w-0 flex-1 rounded-full border border-border bg-bg-elevated px-4 py-3 text-base text-fg transition-colors placeholder:text-fg-muted focus:border-accent focus:outline-none md:py-2.5 md:text-sm"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Enviar mensagem"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-bg transition-colors hover:opacity-90 disabled:bg-bg-elevated disabled:text-fg-muted disabled:ring-1 disabled:ring-border md:h-10 md:w-10"
              >
                <SendIcon />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}

function ChatBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 font-body text-[15px] leading-relaxed md:text-sm ${
          isUser
            ? "bg-accent text-bg rounded-br-sm"
            : "bg-bg-elevated text-fg border border-border rounded-bl-sm"
        }`}
      >
        {content}
      </p>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="bg-bg-elevated border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-fg-muted animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-fg-muted animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-fg-muted animate-bounce" />
      </div>
    </div>
  );
}

function EndedNotice() {
  return (
    <div className="bg-bg-elevated border border-border rounded-2xl px-4 py-3.5 flex flex-col gap-2.5">
      <p className="text-sm font-body text-fg leading-relaxed">
        O Paulo vai te chamar por aqui em breve. Se quiser adiantar, é só chamar no WhatsApp.
      </p>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center bg-accent text-bg font-medium rounded-full px-4 py-2 text-sm hover:opacity-90 transition-opacity"
      >
        Chamar no WhatsApp
      </a>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M4 4L14 14M14 4L4 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
