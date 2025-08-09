import { useState, useRef, KeyboardEvent } from "react";
import { Paperclip, Send, Smile, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MediaPreview from "./media-preview";

interface MessageInputProps {
  onSendMessage: (content: string, mediaFile?: File) => void;
  isDisabled: boolean;
}

export default function MessageInput({ onSendMessage, isDisabled }: MessageInputProps) {
  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    if (!messageText.trim() && !selectedFile) return;
    
    onSendMessage(messageText, selectedFile || undefined);
    setMessageText("");
    setSelectedFile(null);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert("Файл занадто великий. Максимальний розмір: 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
    }
  };

  return (
    <div className="bg-medium-purple border-t border-bright-purple/20 p-4" data-testid="message-input">
      {selectedFile && (
        <MediaPreview 
          file={selectedFile} 
          onRemove={removeSelectedFile} 
        />
      )}
      
      <div className="flex items-end space-x-3">
        {/* Media Upload Button */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            data-testid="input-file-upload"
          />
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-bright-purple/20 hover:bg-bright-purple/30 text-bright-purple"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled}
            data-testid="button-attach-media"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        </div>

        {/* Text Input Area */}
        <div className="flex-1 relative">
          <div className="bg-dark-purple rounded-2xl border border-bright-purple/30 focus-within:border-bright-purple transition-colors">
            <Textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyPress}
              placeholder="Напишіть повідомлення..."
              className="bg-transparent text-white placeholder-light-purple border-none resize-none focus:ring-0 focus:outline-none min-h-[44px] max-h-32"
              disabled={isDisabled}
              data-testid="textarea-message"
            />
          </div>
          
          {/* Emoji Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-purple hover:text-bright-purple"
            disabled={isDisabled}
            data-testid="button-emoji"
          >
            <Smile className="h-5 w-5" />
          </Button>
        </div>

        {/* Send Button */}
        <Button
          className="w-10 h-10 gradient-purple rounded-full hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          onClick={handleSendMessage}
          disabled={isDisabled || (!messageText.trim() && !selectedFile)}
          data-testid="button-send"
        >
          <Send className="h-4 w-4 text-white" />
        </Button>
      </div>
    </div>
  );
}
