import { MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHeaderProps {
  onClearChat: () => void;
  isClearing: boolean;
  isGeneratingResponse: boolean;
}

export default function ChatHeader({ onClearChat, isClearing, isGeneratingResponse }: ChatHeaderProps) {
  return (
    <div className="bg-medium-purple border-b border-bright-purple/20 p-4" data-testid="chat-header">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-avatar rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">М</span>
          </div>
          <div>
            <h2 className="font-semibold text-white" data-testid="text-contact-name">Маріанна</h2>
            <p className="text-light-purple text-sm">
              <span className="text-bright-purple" data-testid="status-online">
                {isGeneratingResponse ? "пише..." : "в мережі"}
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-light-purple hover:text-white hover:bg-bright-purple/10"
            data-testid="button-call"
          >
            <Phone className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-light-purple hover:text-white hover:bg-bright-purple/10"
            data-testid="button-video"
          >
            <Video className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-light-purple hover:text-white hover:bg-bright-purple/10"
                data-testid="button-menu"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="bg-medium-purple border-bright-purple/20"
            >
              <DropdownMenuItem 
                onClick={onClearChat}
                disabled={isClearing}
                className="text-light-purple hover:text-white hover:bg-bright-purple/10"
                data-testid="menu-clear-chat"
              >
                {isClearing ? "Очищення..." : "Очистити чат"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
