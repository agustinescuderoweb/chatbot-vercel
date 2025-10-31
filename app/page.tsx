"use client";

import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import tenesis from "../public/tenesis.jpg";
import Image from "next/image";

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Saludo automático de Tenesis al iniciar
  useEffect(() => {
    const greeting = {
      role: "assistant",
      content: "👋 ¡Hola! Soy Tenesis, tu asistente de IA. ¿En qué puedo ayudarte?",
    };
    setMessages([greeting]);
  }, []);

  // 🔹 Enviar mensaje al backend
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await res.json();
      const botMessage = { role: "assistant", content: data.text };

      setMessages((prev) => [...prev, botMessage]);

      // Guardar en Supabase
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
      {/* 🔹 Avatar de Tenesis */}
      <Image
        src={tenesis}
        alt="Tenesis - Asistente de IA"
        className="w-24 h-24 rounded-full mb-4 border-4 border-blue-500 shadow-lg"
      />

      <div className="w-full max-w-md space-y-4">
        {/* 🔹 Chat Box */}
        <div className="h-96 overflow-y-auto border border-gray-700 rounded-lg p-3 bg-gray-800">
          {messages.map((m, i) => {
            // Detectar si el mensaje incluye un enlace de WhatsApp
            const match = m.content.match(/https:\/\/wa\.me\/\d+/);
            const hasWhatsAppLink = !!match;
            const link = match ? match[0] : null;

            return (
              <div key={i} className="mb-3">
                <strong>{m.role === "user" ? "🧑 Tú:" : "🤖 Tenesis:"}</strong>{" "}
                {hasWhatsAppLink ? (
                  <div className="mt-1 space-y-2">
                    {/* Mostrar el texto original sin perder el mensaje del modelo */}
                    <p>{m.content.replace(link!, "").trim()}</p>

                    {/* Botón verde de WhatsApp */}
                    <a
                      href={link!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Contactar por WhatsApp 📱
                    </a>
                  </div>
                ) : (
                  <p>{m.content}</p>
                )}
              </div>
            );
          })}
          {loading && <div>🤖 escribiendo...</div>}
        </div>

        {/* 🔹 Input */}
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
