import { NextResponse } from "next/server";
import OpenAI from "openai";
import { loadDocxText } from "../../lib/loadDocx";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 🔹 Cargar texto desde el archivo .docx
    const docxText = await loadDocxText("propuesta.docx");

    const whatsappNumber = "5492612388045"; // tu número sin símbolos
    const whatsappLink = `https://wa.me/${whatsappNumber}`;

    // 🔹 Contexto del sistema
    const systemPrompt = `
      Sos un asistente comercial que ayuda a responder preguntas basadas en una propuesta de servicios.
      Usa el siguiente contenido como referencia para tus respuestas (no lo repitas literalmente):
      ---
      ${docxText.slice(0, 8000)} 
      ---
      Sé amable, directo y convincente.

      Si el usuario pide hablar con un comercial, respondé con este mensaje:
     "Perfecto, puedo ponerte en contacto con nuestro equipo comercial. 
      Podés escribirnos directamente por WhatsApp aquí: ${whatsappLink} 📱"
    `;

    // 🔹 Mensajes del usuario
    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    // 🔹 Llamada al modelo
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...formattedMessages,
      ],
    });

    const aiResponse = completion.choices[0].message?.content || "No tengo una respuesta ahora.";

    return NextResponse.json({ text: aiResponse });
  } catch (error) {
    console.error("Error en /api/chat:", error);
    return NextResponse.json({ text: "Hubo un error al generar la respuesta." });
  }
}
