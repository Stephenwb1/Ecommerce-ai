"use client";

import { useState, useRef, useEffect } from "react";
import { Message } from "@/types/chat";
import ChatMessage from "@/components/ChatMessage";

function LoadingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex gap-1 px-3 py-3 bg-zinc-100 rounded-2xl rounded-bl-none">
        <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content:
        "Hi! I'm your ThreadLine shopping assistant. Ask me anything about our products, shipping, or return policy.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage() {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-80 h-[480px] bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col mb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
        <span className="text-sm font-semibold text-zinc-900">Support Chat</span>
        <button
          type="button"
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-700 transition-colors text-lg leading-none"
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <LoadingBubble />}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex items-center gap-2 px-3 py-3 border-t border-zinc-100"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
          placeholder="Ask a question..."
          aria-label="Message input"
          className="flex-1 text-sm text-zinc-900 placeholder-zinc-400 outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          aria-label="Send message"
          className="bg-zinc-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
