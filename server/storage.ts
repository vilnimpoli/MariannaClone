import { 
  conversations, 
  messages,
  type Conversation, 
  type InsertConversation,
  type Message,
  type InsertMessage 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Conversations
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;
  
  // Messages
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  addReactionToMessage(messageId: string, reaction: string): Promise<Message | undefined>;
  removeReactionFromMessage(messageId: string, reaction: string): Promise<Message | undefined>;
}

// In-memory storage for testing without database
class InMemoryStorage implements IStorage {
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private messageMap: Map<string, Message> = new Map();

  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = crypto.randomUUID();
    const now = new Date();
    const conversation: Conversation = {
      id,
      title: insertConversation.title,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(id, conversation);
    this.messages.set(id, []);
    return conversation;
  }

  async deleteConversation(id: string): Promise<void> {
    this.conversations.delete(id);
    this.messages.delete(id);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return this.messages.get(conversationId) || [];
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = crypto.randomUUID();
    const now = new Date();
    const message: Message = {
      id,
      conversationId: insertMessage.conversationId,
      content: insertMessage.content,
      sender: insertMessage.sender,
      mediaUrl: insertMessage.mediaUrl,
      mediaType: insertMessage.mediaType,
      timestamp: now,
      reactions: [],
      aiAvatar: insertMessage.aiAvatar,
      replyToId: insertMessage.replyToId,
    };
    
    this.messageMap.set(id, message);
    const conversationMessages = this.messages.get(insertMessage.conversationId) || [];
    conversationMessages.push(message);
    this.messages.set(insertMessage.conversationId, conversationMessages);
    
    // Update conversation timestamp
    const conversation = this.conversations.get(insertMessage.conversationId);
    if (conversation) {
      conversation.updatedAt = now;
    }
    
    return message;
  }

  async addReactionToMessage(messageId: string, reaction: string): Promise<Message | undefined> {
    const message = this.messageMap.get(messageId);
    if (!message) return undefined;

    const currentReactions = (message.reactions as string[]) || [];
    if (!currentReactions.includes(reaction)) {
      const newReactions = [...currentReactions, reaction];
      message.reactions = newReactions;
    }
    return message;
  }

  async removeReactionFromMessage(messageId: string, reaction: string): Promise<Message | undefined> {
    const message = this.messageMap.get(messageId);
    if (!message) return undefined;

    const currentReactions = (message.reactions as string[]) || [];
    const newReactions = currentReactions.filter(r => r !== reaction);
    message.reactions = newReactions;
    return message;
  }
}

export class DatabaseStorage implements IStorage {
  async getConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations).orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async deleteConversation(id: string): Promise<void> {
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.timestamp);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    
    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, insertMessage.conversationId));
    
    return message;
  }

  async addReactionToMessage(messageId: string, reaction: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, messageId));
    if (!message) return undefined;

    const currentReactions = (message.reactions as string[]) || [];
    if (!currentReactions.includes(reaction)) {
      const newReactions = [...currentReactions, reaction];
      const [updatedMessage] = await db
        .update(messages)
        .set({ reactions: newReactions })
        .where(eq(messages.id, messageId))
        .returning();
      return updatedMessage;
    }
    return message;
  }

  async removeReactionFromMessage(messageId: string, reaction: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, messageId));
    if (!message) return undefined;

    const currentReactions = (message.reactions as string[]) || [];
    const newReactions = currentReactions.filter(r => r !== reaction);
    const [updatedMessage] = await db
      .update(messages)
      .set({ reactions: newReactions })
      .where(eq(messages.id, messageId))
      .returning();
    return updatedMessage;
  }
}

// Use in-memory storage when DATABASE_URL is not set
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new InMemoryStorage();
