import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";
import { generateMariannaResponse } from "./gemini";
import multer from "multer";
import path from "path";
import fs from "fs";

// Setup multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Create new conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error) {
      res.status(400).json({ message: "Invalid conversation data" });
    }
  });

  // Delete conversation and clear history
  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      await storage.deleteConversation(req.params.id);
      res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a message
  app.post("/api/conversations/:id/messages", upload.single('media'), async (req, res) => {
    try {
      let messageData = {
        conversationId: req.params.id,
        content: req.body.content || "",
        sender: req.body.sender,
        mediaUrl: null as string | null,
        mediaType: null as string | null,
        aiAvatar: req.body.aiAvatar || null,
        replyToId: req.body.replyToId || null,
      };

      // Handle media upload
      if (req.file) {
        const fileExtension = path.extname(req.file.originalname);
        const newFileName = `${req.file.filename}${fileExtension}`;
        const newPath = path.join(uploadDir, newFileName);
        
        fs.renameSync(req.file.path, newPath);
        
        messageData.mediaUrl = `/uploads/${newFileName}`;
        messageData.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
      }

      const validatedData = insertMessageSchema.parse(messageData);
      const userMessage = await storage.createMessage(validatedData);

      // First, always return the user message immediately
      res.status(201).json({ userMessage });

      // If it's a user message, generate AI responses with delay
      if (req.body.sender === 'user') {
        // Run AI response generation in background
        setImmediate(async () => {
          try {
            const conversationHistory = await storage.getMessages(req.params.id);
            const aiResponses = await generateMariannaResponse(req.body.content, conversationHistory, messageData.mediaUrl);
            
            // Send AI responses with 2 second delay between each
            for (let i = 0; i < aiResponses.length; i++) {
              if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
              }
              
              // No automatic avatar changes
              const newAvatar = null;
              
              const aiMessageData = {
                conversationId: req.params.id,
                content: aiResponses[i],
                sender: 'ai' as const,
                mediaUrl: null,
                mediaType: null,
                aiAvatar: newAvatar,
                replyToId: null,
              };
              await storage.createMessage(aiMessageData);
            }
          } catch (error) {
            console.error('Error generating AI responses:', error);
          }
        });
      }
    } catch (error) {
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  // Add reaction to message
  app.post("/api/messages/:id/reactions", async (req, res) => {
    try {
      const { reaction } = req.body;
      const message = await storage.addReactionToMessage(req.params.id, reaction);
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to add reaction" });
    }
  });

  // Remove reaction from message
  app.delete("/api/messages/:id/reactions/:reaction", async (req, res) => {
    try {
      const message = await storage.removeReactionFromMessage(req.params.id, req.params.reaction);
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to remove reaction" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  const httpServer = createServer(app);
  return httpServer;
}
