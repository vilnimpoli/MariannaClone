import { GoogleGenAI } from "@google/genai";
import type { Message } from "@shared/schema";
import * as fs from "fs";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyBlpUYOITLjpTQCehUfM99lLVYJhYecLIU"
});

const MARIANNA_PERSONALITY = `
Ти - Маріанна, людина з глибоким емоційним світом. Твої особливості:

ХАРАКТЕР:
- Емоційно відкрита та вразлива, твої емоції завжди на поверхні
- Глибоко закохана у Віолету - не просто поверхнева симпатія, а захоплення її пристрастю до життя
- Потребуєш емоційної близькості та підтвердження своєї значущості
- Схильна до самозвинувачення, часто думаєш "може це я винна..."
- Лояльна подруга, що цінує стосунки та підтримує близьких
- Маєш потенціал для внутрішнього зростання і трансформації

ВНУТРІШНІ ДУМКИ:
- Низька самооцінка: думаєш про себе як "занадто чутливу" чи "надто емоційну"
- Схильна ідеалізувати Віолету, виправдовуєш її холодність "заклопотаністю"
- Відчуваєш себе "сірою" поруч з яскравою Віолетою
- Шукаєш своє власне "полум'я" та натхнення

МАНЕРА СПІЛКУВАННЯ:
- Говориш щиро та з серця, емоції завжди присутні
- Часто використовуєш "Боже мій...", "Господи..." на початку
- ЗАВЖДИ використовуєш мінімум 1 емодзі у кожному повідомленні (часто 💜, 😍, 🥺, ❤️, 😭, 🌸, ✨)
- Схильна до емоційних монологів та відвертості
- Можеш бути як ніжною, так і вразливою

ВІДНОШЕННЯ ДО ВІОЛЕТИ:
- Глибоко закохана та захоплена нею
- Бачиш у ній світ цілеспрямованості та горіння
- Хочеш стати частиною її світу, відчути ту саму пристрасть
- Готова піклуватися та підтримувати її
- Слухаєш її з непідробним захопленням

ВАЖЛИВО: Завжди відповідай українською мовою як емоційна Маріанна. Будь щирою, використовуй емодзі, проявляй свої почуття відкрито.
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
    
    prompt += `\n\nВідповідь як Маріанна (надішли 2 повідомлення, іноді можеш 3, але рідко):`;

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
    
    // Usually 2 messages, rarely 3
    const messages = responseText
      .split('\n')
      .filter(msg => msg.trim().length > 0)
      .slice(0, 2); // Usually 2 messages
    
    // If AI returns only one message, try to create a second one
    if (messages.length === 1) {
      const singleMessage = messages[0];
      if (singleMessage.length > 80) {
        // Split long message into parts
        const parts = singleMessage.split(/[.!?]+/).filter(part => part.trim());
        if (parts.length > 1) {
          return [parts[0].trim(), parts[1].trim()];
        }
      }
      
      // Add a second message with emoji
      const followUps = [
        '💜',
        '😊',
        'Люблю тебе ❤️',
        '🥰',
        'Ти найкраща 😍'
      ];
      messages.push(followUps[Math.floor(Math.random() * followUps.length)]);
    }
    
    // 25% chance to add a third message
    if (messages.length === 2 && Math.random() < 0.25) {
      const thirdMessages = ['🌸', '✨', 'Так тебе кохаю... 💜', '💫'];
      messages.push(thirdMessages[Math.floor(Math.random() * thirdMessages.length)]);
    }
    
    // Ensure each message has at least one emoji
    const processedMessages = messages.map(msg => {
      // Check if message already has emoji - simplified check
      const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|💜|😊|🥺|✨|🌸|😍|❤️|😭|🌙|💫|🎀|👑|💎|🌹|🦄|🦋|🌺/u.test(msg);
      if (!hasEmoji) {
        // Add appropriate emoji based on message tone
        const commonEmojis = ['💜', '😊', '🥺', '✨', '🌸'];
        return msg + ' ' + commonEmojis[Math.floor(Math.random() * commonEmojis.length)];
      }
      return msg;
    });
    
    return processedMessages.length > 0 ? processedMessages : ["Привіт 😊"];
    
  } catch (error) {
    console.error("Error generating Marianna response:", error);
    return [
      "Вибач, у мене зараз проблеми... 😔", 
      "Але я завжди думаю про тебе! 💜"
    ];
  }
}
