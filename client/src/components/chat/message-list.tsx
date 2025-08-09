import { useEffect, useRef } from "react";
import { CheckCheck, Heart, Flame, Sun, Smile, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import TypingIndicator from "./typing-indicator";
import AvatarSelector from "./avatar-selector";
import type { Message } from "@shared/schema";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onAddReaction: (messageId: string, reaction: string) => void;
  onReplyToMessage: (message: Message) => void;
  currentAiAvatar: string;
  onAvatarChange: (avatar: string) => void;
  isGeneratingResponse: boolean;
}

const REACTION_EMOJIS = ["🥰", "♥️", "🔥", "💩", "☀️"];

export default function MessageList({ 
  messages, 
  isLoading, 
  onAddReaction, 
  onReplyToMessage,
  currentAiAvatar,
  onAvatarChange,
  isGeneratingResponse 
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGeneratingResponse]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center heart-pattern">
        <div className="text-light-purple">Завантаження повідомлень...</div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 space-y-4 heart-pattern" 
      data-testid="messages-container"
    >
      {messages.map((message, index) => {
        const isUser = message.sender === 'user';
        const reactions = (message.reactions as string[]) || [];
        
        return (
          <div
            key={message.id}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} message-enter`}
            data-testid={`message-${message.id}`}
          >
            <div className={`max-w-xs lg:max-w-md ${!isUser ? 'space-y-2' : ''}`}>
              {/* AI Avatar and name (for AI messages only) */}
              {!isUser && (
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-8 h-8 gradient-avatar rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {message.aiAvatar || currentAiAvatar}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-light-purple text-sm font-medium">Маріанна</span>
                    <AvatarSelector 
                      currentAvatar={message.aiAvatar || currentAiAvatar}
                      onAvatarChange={onAvatarChange}
                    />
                  </div>
                </div>
              )}
              <div className="group relative">
                {message.mediaUrl && (
                  <div className={`${isUser ? 'bg-bright-purple border-bright-purple' : 'bg-medium-purple border-bright-purple'} border-2 rounded-2xl ${isUser ? 'rounded-br-md' : 'rounded-bl-md'} overflow-hidden shadow-lg mb-2`}>
                    {message.mediaType === 'image' ? (
                      <img 
                        src={message.mediaUrl} 
                        alt="Shared media" 
                        className="w-full h-40 object-cover"
                        data-testid={`img-media-${message.id}`}
                      />
                    ) : (
                      <video 
                        src={message.mediaUrl} 
                        controls 
                        className="w-full h-40"
                        data-testid={`video-media-${message.id}`}
                      />
                    )}
                  </div>
                )}
                
                {message.content && (
                  <div className={`${isUser ? 'bg-bright-purple border-bright-purple' : 'bg-medium-purple border-bright-purple'} border-2 rounded-2xl ${isUser ? 'rounded-br-md' : 'rounded-bl-md'} p-3 shadow-lg`}>
                    <p className="text-white" data-testid={`text-message-${message.id}`}>
                      {message.content}
                    </p>
                  </div>
                )}

                {/* Reaction and Reply buttons */}
                <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-col space-y-1">
                    {/* Reply button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 bg-medium-purple/80 hover:bg-bright-purple/20"
                      onClick={() => onReplyToMessage(message)}
                      data-testid={`button-reply-${message.id}`}
                    >
                      <Reply className="h-4 w-4 text-light-purple" />
                    </Button>
                    {/* Reaction emojis */}
                    {REACTION_EMOJIS.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 bg-medium-purple/80 hover:bg-bright-purple/20 text-sm"
                        onClick={() => onAddReaction(message.id, emoji)}
                        data-testid={`button-reaction-${emoji}-${message.id}`}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Display reactions */}
              {reactions.length > 0 && (
                <div className="flex space-x-1 mt-1">
                  {reactions.map((reaction, idx) => (
                    <span 
                      key={idx} 
                      className="bg-dark-purple/50 rounded-full px-2 py-1 text-sm"
                      data-testid={`reaction-${reaction}-${message.id}`}
                    >
                      {reaction}
                    </span>
                  ))}
                </div>
              )}

              <div className={`flex items-center mt-1 space-x-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                <span className="text-light-purple text-xs" data-testid={`timestamp-${message.id}`}>
                  {new Date(message.timestamp).toLocaleTimeString('uk-UA', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                {isUser && (
                  <CheckCheck className="w-4 h-4 text-bright-purple" data-testid={`icon-delivered-${message.id}`} />
                )}
              </div>
            </div>
          </div>
        );
      })}

      {isGeneratingResponse && <TypingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
