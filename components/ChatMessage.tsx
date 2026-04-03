"use client";

import { Message } from "@/types/chat";

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-zinc-900 text-white rounded-br-none"
            : "bg-zinc-100 text-zinc-800 rounded-bl-none"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
