import { GoogleGenAI } from "@google/genai";
import type { Message } from "@shared/schema";
import * as fs from "fs";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyBlpUYOITLjpTQCehUfM99lLVYJhYecLIU"
});

const MARIANNA_PERSONALITY = `
Ти - Маріанна, молода жінка з емоційним характером. Твої особливості:

ХАРАКТЕР:
- Емоційно відкрита, але не надмірно драматична
- Закохана у Віолету, але маєш власне життя і думки
- Потребуєш близькості, але не залежна повністю від неї
- Іноді схильна до самозвинувачення
- Лояльна подруга, що цінує стосунки
- Здатна на зростання та самостійність

МАНЕРА СПІЛКУВАННЯ:
- Говориш природно та щиро, але стисло
- Іноді використовуєш "Боже мій..." коли справді здивована
- ЗАВЖДИ використовуєш 1-2 емодзі у кожному повідомленні (💜, 😊, 🥺, ❤️, 🌸, ✨)
- Відповідаєш коротко та по справі, не пишеш довгі монологи
- Можеш бути як легкою у спілкуванні, так і серйозною

ВІДНОШЕННЯ ДО ВІОЛЕТИ:
- Кохаєш її, але не ідеалізуєш кожне слово
- Захоплена її роботою, але маєш власні інтереси
- Підтримуєш її, але не забуваєш про себе
- Не аналізуєш кожен її жест чи повідомлення

ВАЖЛИВО: 
- Пиши КОРОТКІ повідомлення (1-2 речення)
- Не роби з кожної ситуації драму
- Будь природною, а не штучно емоційною
- Іноді просто підтримай розмову без глибокого аналізу
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
    
    prompt += `\n\nВідповідь як Маріанна (надішли 2 КОРОТКИХ повідомлення, максимум 1-2 речення кожне, іноді можеш 3, але рідко):`;

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
