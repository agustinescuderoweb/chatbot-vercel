"use client";

import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import tenesis from "../public/tenesis.jpg"
import Image from "next/image";

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Saludo automático de Scott al iniciar
  useEffect(() => {
    const greeting = {
      role: "assistant",
      content: "👋 ¡Hola! Soy Tenesis, tu asistente de IA. ¿En qué puedo ayudarte?"
    };
    setMessages([greeting]);
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

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
      {/* 🔹 Título */}
      {/* 🔹 Imagen de Scott */}
      <Image
        src={tenesis} // 👈 cambia la URL por la que quieras
        alt="Scott - Asistente de IA"
        className="w-24 h-24 rounded-full mb-4 border-4 border-blue-500 shadow-lg"
      />

      <div className="w-full max-w-md space-y-4">
        {/* Chat Box */}
        <div className="h-96 overflow-y-auto border border-gray-700 rounded-lg p-3 bg-gray-800">
          {messages.map((m, i) => {
            const isWhatsAppLink = m.content.includes("https://wa.me/");
            return (
              <div key={i} className="mb-2">
                <strong>{m.role === "user" ? "🧑 Tú:" : "🤖 Tenesis:"}</strong>{" "}
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
