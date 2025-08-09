import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";

const STICKERS = [
  { emoji: "❤️", name: "Серце" },
  { emoji: "😘", name: "Поцілунок" },
  { emoji: "🥰", name: "Закоханість" },
  { emoji: "😍", name: "Очі-серця" },
  { emoji: "💕", name: "Два серця" },
  { emoji: "💖", name: "Спаркове серце" },
  { emoji: "💝", name: "Подарунок" },
  { emoji: "🌹", name: "Троянда" },
  { emoji: "🎀", name: "Бантик" },
  { emoji: "✨", name: "Спаркс" },
  { emoji: "🦋", name: "Метелик" },
  { emoji: "🌸", name: "Сакура" },
  { emoji: "💋", name: "Губи" },
  { emoji: "🥺", name: "Благальні очі" },
  { emoji: "😊", name: "Усмішка" },
  { emoji: "😉", name: "Підморгування" },
  { emoji: "😋", name: "Смачно" },
  { emoji: "🤗", name: "Обійми" },
  { emoji: "😴", name: "Сон" },
  { emoji: "💤", name: "Хропіння" }
];

interface StickerPanelProps {
  onStickerSelect: (sticker: string) => void;
  disabled?: boolean;
}

export default function StickerPanel({ onStickerSelect, disabled }: StickerPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleStickerClick = (sticker: string) => {
    onStickerSelect(sticker);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-light-purple hover:text-bright-purple"
          disabled={disabled}
          data-testid="button-stickers"
        >
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 bg-medium-purple border-bright-purple/20"
        data-testid="sticker-panel"
      >
        <div className="grid grid-cols-5 gap-2 p-2">
          {STICKERS.map((sticker) => (
            <Button
              key={sticker.emoji}
              variant="ghost"
              className="h-12 w-12 text-2xl hover:bg-bright-purple/20 transition-colors"
              onClick={() => handleStickerClick(sticker.emoji)}
              data-testid={`sticker-${sticker.name}`}
              title={sticker.name}
            >
              {sticker.emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}