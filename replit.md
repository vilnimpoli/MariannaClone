# Overview

This is a Ukrainian AI chatbot application that simulates conversations with "Marianna," an AI personality designed to mimic a friend who is in love with the user "Violeta." The application uses Google AI Studio (Gemini) to generate responses that match Marianna's emotional, loving personality. It features a Telegram-style chat interface with media sharing capabilities, conversation history, and message reactions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Single-page application using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI components
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Comprehensive set of reusable components based on Radix UI primitives

## Backend Architecture
- **Express.js Server**: RESTful API with TypeScript support
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **File Upload**: Multer middleware for handling media uploads (images and videos up to 10MB)
- **API Structure**: Clean separation of routes, storage layer, and business logic

## Database Schema
- **Conversations Table**: Stores chat sessions with title, timestamps
- **Messages Table**: Stores individual messages with content, sender type, media attachments, reactions, and foreign key relationship to conversations
- **Relationships**: One-to-many relationship between conversations and messages with cascade deletion

## AI Integration
- **Google Gemini AI**: Primary AI service for generating Marianna's personality-driven responses
- **Personality System**: Detailed personality prompts that define Marianna's emotional, loving character traits
- **Context Awareness**: Uses conversation history (last 10 messages) to maintain context
- **Multiple Response Generation**: Capability to generate multiple response options

## External Dependencies
- **Database**: PostgreSQL with Neon serverless for cloud hosting
- **AI Service**: Google AI Studio (Gemini) with hardcoded API key
- **UI Framework**: shadcn/ui component system built on Radix UI
- **Styling**: Tailwind CSS with custom purple/pink theme variables
- **State Management**: TanStack Query for API calls and caching
- **File Handling**: Multer for media upload processing
- **Development Tools**: Vite with React plugin and Replit integration plugins