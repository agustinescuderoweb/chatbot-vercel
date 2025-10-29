"use client";

import { useState } from "react";
import { supabase } from "./lib/supabaseClient";

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 1️⃣ Enviar mensaje al backend
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await res.json();
      const botMessage = { role: "assistant", content: data.text };
      setMessages((prev) => [...prev, botMessage]);

      // 2️⃣ Guardar ambos mensajes en Supabase
      await supabase.from("messages").insert([
        { role: "user", content: userMessage.content },
        { role: "assistant", content: botMessage.content },
      ]);
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Chatbot IA - Demo</h1>
      <div className="w-full max-w-md space-y-4">
        {/* Chat Box */}
        <div className="h-96 overflow-y-auto border border-gray-700 rounded-lg p-3 bg-gray-800">
          {messages.map((m, i) => {
            const isWhatsAppLink = m.content.includes("https://wa.me/");
            return (
              <div key={i} className="mb-2">
                <strong>{m.role === "user" ? "🧑 Tú:" : "🤖 Bot:"}</strong>{" "}
                {isWhatsAppLink ? (
                  <a
                    href={m.content.match(/https:\/\/wa\.me\/\d+/)?.[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-3 py-1 mt-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Contactar por WhatsApp 📱
                  </a>
                ) : (
                  m.content
                )}
              </div>
            );
          })}
          {loading && <div>🤖 escribiendo...</div>}
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-lg p-2 bg-gray-700 text-white"
            placeholder="Escribe un mensaje..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Enviar
          </button>
        </form>
      </div>
    </main>
  );
}
