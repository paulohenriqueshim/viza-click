"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { WHATSAPP_URL } from "@/lib/contact";

// Limite simples de mensagens por sessão de navegador — contorna abuso
// básico sem precisar de banco de dados externo (decisão registrada no
// plano de migração do bot de WhatsApp pro site). É client-side, então
// contornável por quem souber limpar o sessionStorage; suficiente pro
// volume inicial. O backend (src/app/api/chat/route.js) também limita o
// tamanho da conversa como segunda camada.
const MAX_MESSAGES_PER_SESSION = 20;
const STORAGE_KEY = "vc-chat-history";
const COUNT_KEY = "vc-chat-count";

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
  const hydrated = useRef(false);

  // Hidrata a partir do sessionStorage só no cliente, depois do primeiro
  // render, pra não divergir do HTML gerado no servidor (SSR).
  useEffect(() => {
    const savedMessages = loadSession(STORAGE_KEY, null);
    const savedCount = loadSession(COUNT_KEY, 0);
    if (savedMessages && savedMessages.length > 0) setMessages(savedMessages);
    setCount(savedCount);
    if (savedCount >= MAX_MESSAGES_PER_SESSION) setEnded(true);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveSession(STORAGE_KEY, messages);
  }, [messages]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

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
      if (data.handoff) setEnded(true);
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
          className="fixed inset-0 md:inset-auto md:bottom-24 md:right-8 z-[59] w-full h-full md:w-[380px] md:h-[560px] md:max-h-[75vh] flex flex-col bg-bg border border-border md:rounded-2xl overflow-hidden"
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
              className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-full text-fg-muted hover:text-fg transition-colors"
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

          {/* Campo de mensagem */}
          {!ended && (
            <form onSubmit={handleSend} className="border-t border-border p-3 shrink-0 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escreve aqui..."
                disabled={sending}
                maxLength={2000}
                className="flex-1 bg-bg-elevated border border-border rounded-full px-4 py-2.5 text-sm text-fg placeholder:text-fg-muted focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Enviar mensagem"
                className="inline-flex items-center justify-center bg-accent text-bg rounded-full w-10 h-10 shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
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
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-body leading-relaxed whitespace-pre-wrap ${
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
