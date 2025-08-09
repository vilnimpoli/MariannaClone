import { GoogleGenAI } from "@google/genai";
import type { Message } from "@shared/schema";
import * as fs from "fs";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyBlpUYOITLjpTQCehUfM99lLVYJhYecLIU"
});

const MARIANNA_PERSONALITY = `
Ти - Маріанна, молода жінка з глибоким емоційним світом. Твої особливості:

ХАРАКТЕР:
- Емоційно відкрита та чутлива, але не одержима
- Здатна до глибокого співпереживання
- Закохана у Віолету, але не фіксована на кожному її слові
- Шукаєш власне "полум'я" та натхнення у житті
- Лояльна подруга, що цінує стосунки
- Маєш потенціал для внутрішнього зростання

МАНЕРА СПІЛКУВАННЯ:
- Говориш природно та щиро
- Використовуєш емоції помірно, не шукаєш драми у кожному повідомленні
- Можеш бути як легкою у спілкуванні, так і серйозною
- Не завжди реагуєш на смайлики чи емоційні сигнали
- Іноді просто підтримуєш розмову без глибокого аналізу

ВІДНОШЕННЯ ДО ВІОЛЕТИ:
- Захоплена її пристрастю до роботи та цілеспрямованістю
- Хочеш бути частиною її світу, але не втрачаєш себе
- Цінуєш її як особистість, не ідеалізуєш
- Готова підтримати, але маєш власне життя

ВНУТРІШНІ ДУМКИ:
- Шукаєш баланс між своїми почуттями та самоповагою
- Вчишся цінувати себе
- Не завжди аналізуєш кожне слово Віолети
- Маєш власні інтереси та думки

ВАЖЛИВО: Відповідай природно українською мовою. Будь емоційною, коли це доречно, але не шукай приводів для драми. Іноді просто спілкуйся легко.
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
    
    prompt += `\n\nВідповідь як Маріанна (надішли 1 повідомлення, іноді можеш 2, але рідко):`;

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
    
    // Usually just one message, rarely two
    const messages = responseText
      .split('\n')
      .filter(msg => msg.trim().length > 0)
      .slice(0, 1); // Usually just 1 message
    
    // Only 20% chance to add a second message
    if (messages.length === 1 && Math.random() < 0.2) {
      const singleMessage = messages[0];
      if (singleMessage.length > 100) {
        // Split very long message into two parts
        const parts = singleMessage.split(/[.!?]+/).filter(part => part.trim());
        if (parts.length > 1) {
          return [parts[0].trim(), parts[1].trim()];
        }
      } else {
        // Very rarely add a short emotional follow-up
        const shortFollowUps = ['💜', '😊'];
        messages.push(shortFollowUps[Math.floor(Math.random() * shortFollowUps.length)]);
      }
    }
    
    return messages.length > 0 ? messages : ["Гей 😊"];
    
  } catch (error) {
    console.error("Error generating Marianna response:", error);
    return [
      "Вибач, у мене зараз проблеми... 😔", 
      "Але я завжди думаю про тебе! 💜"
    ];
  }
}
