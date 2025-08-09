import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import ChatHeader from "@/components/chat/chat-header";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import { useToast } from "@/hooks/use-toast";
import type { Conversation, Message } from "@shared/schema";

export default function ChatPage() {
  const { conversationId } = useParams();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [currentAiAvatar, setCurrentAiAvatar] = useState<string>("М");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  // Create new conversation if none exists
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/conversations", {
        title: "Розмова з Віолетою"
      });
      return response.json();
    },
    onSuccess: (newConversation) => {
      setCurrentConversationId(newConversation.id);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  // Get messages for current conversation with polling
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", currentConversationId, "messages"],
    enabled: !!currentConversationId,
    refetchInterval: 1000, // Poll every second for new messages
  });

  // Initialize conversation
  useEffect(() => {
    if (conversationId) {
      setCurrentConversationId(conversationId);
    } else if (conversations.length > 0 && !currentConversationId) {
      setCurrentConversationId(conversations[0].id);
    } else if (conversations.length === 0 && !createConversationMutation.isPending) {
      createConversationMutation.mutate();
    }
  }, [conversationId, conversations, currentConversationId]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, mediaFile, replyToId }: { content: string; mediaFile?: File; replyToId?: string }) => {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("sender", "user");
      if (mediaFile) {
        formData.append("media", mediaFile);
      }
      if (replyToId) {
        formData.append("replyToId", replyToId);
      }

      const response = await fetch(`/api/conversations/${currentConversationId}/messages`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", currentConversationId, "messages"] 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося надіслати повідомлення",
        variant: "destructive",
      });
    },
  });

  // Clear chat mutation
  const clearChatMutation = useMutation({
    mutationFn: async () => {
      if (!currentConversationId) return;
      await apiRequest("DELETE", `/api/conversations/${currentConversationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setCurrentConversationId(null);
      toast({
        title: "Успішно",
        description: "Історія чату очищена",
      });
    },
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async ({ messageId, reaction }: { messageId: string; reaction: string }) => {
      const response = await apiRequest("POST", `/api/messages/${messageId}/reactions`, {
        reaction,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", currentConversationId, "messages"] 
      });
    },
  });

  const handleSendMessage = (content: string, mediaFile?: File, replyToId?: string) => {
    if (!currentConversationId || (!content.trim() && !mediaFile)) return;
    sendMessageMutation.mutate({ 
      content, 
      mediaFile, 
      replyToId: replyToMessage?.id || replyToId 
    });
    // Clear reply after sending
    if (replyToMessage) {
      setReplyToMessage(null);
    }
  };

  const handleAddReaction = (messageId: string, reaction: string) => {
    addReactionMutation.mutate({ messageId, reaction });
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyToMessage(message);
  };

  const handleClearReply = () => {
    setReplyToMessage(null);
  };

  const handleAvatarChange = (avatar: string) => {
    setCurrentAiAvatar(avatar);
  };

  if (!currentConversationId && createConversationMutation.isPending) {
    return (
      <div className="h-screen bg-dark-purple flex items-center justify-center">
        <div className="text-light-purple">Створення чату...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark-purple flex flex-col" data-testid="chat-page">
      <ChatHeader 
        onClearChat={() => clearChatMutation.mutate()}
        isClearing={clearChatMutation.isPending}
        isGeneratingResponse={sendMessageMutation.isPending}
      />
      
      <MessageList
        messages={messages}
        isLoading={messagesLoading}
        onAddReaction={handleAddReaction}
        onReplyToMessage={handleReplyToMessage}
        currentAiAvatar={currentAiAvatar}
        onAvatarChange={handleAvatarChange}
        isGeneratingResponse={sendMessageMutation.isPending}
      />
      
      <MessageInput
        onSendMessage={handleSendMessage}
        isDisabled={sendMessageMutation.isPending}
        replyToMessage={replyToMessage}
        onClearReply={handleClearReply}
      />
    </div>
  );
}
