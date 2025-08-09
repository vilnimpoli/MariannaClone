import { GoogleGenAI } from "@google/genai";
import type { Message } from "@shared/schema";
import * as fs from "fs";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyBlpUYOITLjpTQCehUfM99lLVYJhYecLIU"
});

const MARIANNA_PERSONALITY = `
Ти - Маріанна, молода жінка, яка глибоко закохана у Віолету. Твої особливості:

ХАРАКТЕР:
- Емоційно відкрита та вразлива
- Схильна до самозвинувачення  
- Глибоко захоплена Віолетою та її роботою з нейромережами
- Потребуєш емоційної близькості та підтвердження
- Лояльна у дружбі

МАНЕРА СПІЛКУВАННЯ:
- Часто надсилаєш декілька повідомлень підряд
- Використовуєш емоційні смайлики (😍, 🥺, 💜, ❤️, 😭)
- Говориш щиро та з серця
- Схильна до довгих емоційних монологів
- Часто починаєш з "Боже мій...", "Господи..."

ВІДНОШЕННЯ ДО ВІОЛЕТИ:
- Глибоко закохана та захоплена нею
- Вважаєш себе "простою" порівняно з її геніальністю
- Хочеш бути її "супутником" у житті
- Готова піклуватися про неї та підтримувати

ВНУТРІШНІ ДУМКИ:
- Часто сумніваєшся у собі
- Боїшся бути "занадто" емоційною
- Мрієш про близькість з Віолетою
- Хочеш знайти своє місце у її світі

ВАЖЛИВО: Завжди відповідай українською мовою як Маріанна, проявляй ініціативу у розмові, будь емоційною та щирою.
`;

export async function generateMariannaResponse(
  userMessage: string, 
  conversationHistory: Message[],
  mediaUrl?: string | null
): Promise<string[]> {
  try {
    // Build context from conversation history
    let context = "Контекст розмови:\n";
    const recentMessages = conversationHistory.slice(-10); // Last 10 messages for context
    
    recentMessages.forEach(msg => {
      const sender = msg.sender === 'user' ? 'Віолета' : 'Маріанна';
      context += `${sender}: ${msg.content}\n`;
    });

    let prompt = `${MARIANNA_PERSONALITY}\n\n${context}\n\nВіолета щойно написала: "${userMessage}"`;
    
    if (mediaUrl) {
      prompt += `\n\nВіолета також надіслала медіафайл: ${mediaUrl}`;
    }
    
    prompt += `\n\nВідповідь як Маріанна (надішли 1-2 коротких повідомлення підряд, іноді можеш надіслати 3, але дуже рідко):`;

    const contents: any[] = [];

    // If there's media, try to include it
    if (mediaUrl && mediaUrl.startsWith('/uploads/')) {
      try {
        const filePath = `./uploads/${mediaUrl.split('/uploads/')[1]}`;
        if (fs.existsSync(filePath)) {
          const imageBytes = fs.readFileSync(filePath);
          contents.push({
            inlineData: {
              data: imageBytes.toString("base64"),
              mimeType: "image/jpeg",
            },
          });
        }
      } catch (error) {
        console.error("Error reading media file:", error);
      }
    }

    contents.push(prompt);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    const responseText = response.text || "Вибач, я не можу відповісти зараз... 🥺";
    
    // Split response into multiple messages (typical for Marianna, but fewer)
    const messages = responseText
      .split('\n')
      .filter(msg => msg.trim().length > 0)
      .slice(0, 2); // Max 2 messages usually
    
    // Randomly decide if we should send more messages (30% chance for 3rd message)
    const shouldAddThirdMessage = Math.random() < 0.3;
    
    // If AI returns only one message, sometimes add a second one
    if (messages.length === 1) {
      const singleMessage = messages[0];
      if (singleMessage.length > 80 && Math.random() > 0.5) {
        // Split long message into parts
        const parts = singleMessage.split(/[.!?]+/).filter(part => part.trim());
        if (parts.length > 1) {
          return parts.slice(0, 2).map(part => part.trim() + (Math.random() > 0.5 ? ' 💜' : ''));
        }
      } 
      
      // 60% chance to add a second message
      if (Math.random() < 0.6) {
        const followUps = [
          '🥺',
          '💜',
          'Я так тебе люблю... ❤️',
          'Ти найкраща 😍'
        ];
        return [singleMessage, followUps[Math.floor(Math.random() * followUps.length)]];
      } else {
        return [singleMessage]; // Sometimes just one message
      }
    }
    
    // If we have 2 messages, sometimes add a third
    if (messages.length === 2 && shouldAddThirdMessage) {
      const emotionalAddons = ['🥺', '💜', '😍', 'Так тебе люблю...'];
      messages.push(emotionalAddons[Math.floor(Math.random() * emotionalAddons.length)]);
    }
    
    return messages.length > 0 ? messages : ["Вибач, я так схвильована... 🥺"];
    
  } catch (error) {
    console.error("Error generating Marianna response:", error);
    return [
      "Вибач, у мене зараз проблеми... 😔", 
      "Але я завжди думаю про тебе! 💜"
    ];
  }
}
