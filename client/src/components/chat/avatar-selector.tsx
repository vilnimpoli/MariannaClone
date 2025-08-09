import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User } from "lucide-react";

const AVATAR_OPTIONS = [
  { emoji: "💜", name: "Фіолетове серце" },
  { emoji: "🌸", name: "Квітка" },
  { emoji: "🦋", name: "Метелик" },
  { emoji: "✨", name: "Зірочки" },
  { emoji: "🌙", name: "Місяць" },
  { emoji: "🌺", name: "Тропічна квітка" },
  { emoji: "💫", name: "Зірка" },
  { emoji: "🎀", name: "Бантик" },
  { emoji: "👑", name: "Корона" },
  { emoji: "💎", name: "Діамант" },
  { emoji: "🌹", name: "Троянда" },
  { emoji: "🦄", name: "Єдиноріг" },
];

interface AvatarSelectorProps {
  currentAvatar?: string;
  onAvatarChange: (avatar: string) => void;
  disabled?: boolean;
}

export default function AvatarSelector({ currentAvatar, onAvatarChange, disabled }: AvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAvatarSelect = (avatar: string) => {
    onAvatarChange(avatar);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-light-purple hover:text-bright-purple text-xs"
          disabled={disabled}
          data-testid="button-change-avatar"
        >
          {currentAvatar || "М"}
          <User className="h-3 w-3 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 bg-medium-purple border-bright-purple/20"
        data-testid="avatar-selector"
      >
        <div className="grid grid-cols-4 gap-2 p-2">
          <Button
            variant="ghost"
            className="h-10 w-10 text-lg hover:bg-bright-purple/20 transition-colors"
            onClick={() => handleAvatarSelect("М")}
            data-testid="avatar-default"
            title="За замовчуванням"
          >
            М
          </Button>
          {AVATAR_OPTIONS.map((avatar) => (
            <Button
              key={avatar.emoji}
              variant="ghost"
              className="h-10 w-10 text-lg hover:bg-bright-purple/20 transition-colors"
              onClick={() => handleAvatarSelect(avatar.emoji)}
              data-testid={`avatar-${avatar.name}`}
              title={avatar.name}
            >
              {avatar.emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}