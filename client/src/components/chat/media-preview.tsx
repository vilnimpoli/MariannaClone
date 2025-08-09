import { X, FileImage, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaPreviewProps {
  file: File;
  onRemove: () => void;
}

export default function MediaPreview({ file, onRemove }: MediaPreviewProps) {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const fileUrl = URL.createObjectURL(file);

  return (
    <div className="mb-3" data-testid="media-preview">
      <div className="flex items-center space-x-3 p-3 bg-dark-purple rounded-lg border border-bright-purple/30">
        <div className="w-12 h-12 bg-bright-purple/20 rounded-lg flex items-center justify-center flex-shrink-0">
          {isImage && <FileImage className="w-6 h-6 text-bright-purple" />}
          {isVideo && <Video className="w-6 h-6 text-bright-purple" />}
        </div>
        
        {isImage && (
          <img 
            src={fileUrl} 
            alt="Preview" 
            className="w-12 h-12 object-cover rounded-lg"
            data-testid="img-preview"
          />
        )}
        
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate" data-testid="text-filename">
            {file.name}
          </p>
          <p className="text-light-purple text-xs" data-testid="text-filesize">
            {(file.size / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="text-light-purple hover:text-white h-8 w-8"
          onClick={onRemove}
          data-testid="button-remove-media"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
