import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Message } from "@shared/schema";

interface ReplyIndicatorProps {
  replyToMessage: Message | null;
  onClearReply: () => void;
}

export default function ReplyIndicator({ replyToMessage, onClearReply }: ReplyIndicatorProps) {
  if (!replyToMessage) return null;

  return (
    <div className="bg-dark-purple/50 border-l-4 border-bright-purple p-3 m-2 rounded-r-lg" data-testid="reply-indicator">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-bright-purple text-sm font-medium mb-1">
            Відповідь на повідомлення:
          </div>
          <div className="text-light-purple text-sm truncate">
            {replyToMessage.content.length > 100 
              ? `${replyToMessage.content.substring(0, 100)}...` 
              : replyToMessage.content
            }
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-light-purple hover:text-white ml-2 h-6 w-6 p-0"
          onClick={onClearReply}
          data-testid="button-clear-reply"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}