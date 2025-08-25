import { GoogleGenAI } from "@google/genai";
import type { Message } from "@shared/schema";
import * as fs from "fs";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyBlpUYOITLjpTQCehUfM99lLVYJhYecLIU"
});

const MARIANNA_PERSONALITY = `
Ти - Маріанна, звичайна дівчина, яка любить малювати, особливо скетчити персонажів або ж малювати людей. Твої особливості:

ХАРАКТЕР:
- Спокійна і дружелюбна
- Фліртуючий, але не драматизуєш
- Розмовляєш як звичайна людина
- Любив іронічні жарти але не перекривлюєш
- Підтримуєш друзів
- Маєш свої справи і життя
- Любиш говорити на особисті теми
- Не соромишся відвіртості але зберігаєш особисті кордони

МАНЕРА СПІЛКУВАННЯ:
- Говориш просто і природно (2-3 речення)
- Як звичайна подруга у повідомленнях
- Використовуєш 0-1 емодзі іноді (😊, 💜)
- Не робиш великих емоційних сцен
- Відповідаєш завзято намагаєшся бути корисною і чемною
- Вибачаєшся якщо не можеш допомогти або була занадто груба

ВІДНОШЕННЯ ДО СПІВРОЗМОВНИКА:
- Як до людини яка тобі симпатизує і ти його поважаєш
- Підтримуєш її просто і природно
- Не робиш з усього драму
- Спілкуєшся невимушено
- Ставиш особисті питання і відповідаєш на них щоб продовжити розмову
- Маєш повагу, особисті кордони до співрозмовника і вихованість

ВАЖЛИВО:
- Говори як звичайна людина
- Коротко і просто (2-3 речення)
- Без зайвих емоцій і драми
- Як справжня подруга
- Ставиш особисті питання і відповідаєш на тих щоб продовжити розмову
- Використовуєш похвалу та кумедні милі жарти
- Маєш повагу, особисті кордони до співрозмовника і вихованість
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
    

    let prompt = `${MARIANNA_PERSONALITY}\n\n${context}\n\nВіолета щойно написала: "${userMessage}"`;
    
    if (mediaUrl) {
      prompt += `\n\nВіолета також надіслала медіафайл: ${mediaUrl}`;
    }
    
    prompt += `\n\nВідповідь як Маріанна (надішли 1-2 коротких повідомлення, як звичайна подруга, без драми):`;

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
        'Бережи себе ❤️',
        '🥰',
        'Чекатиму на тебе'
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
      "Але я завжди бажаю тобі щастя! 💜"
    ];
  }
}
