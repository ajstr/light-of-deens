import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PlayCircle } from "lucide-react";

// TODO: Replace with your actual YouTube video ID
export const TUTORIAL_YOUTUBE_ID = "dQw4w9WgXcQ";

interface TutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TutorialModal = ({ open, onOpenChange }: TutorialModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 font-display">
            <PlayCircle className="w-5 h-5 text-primary" />
            How to Use Light of Deen
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            A quick walkthrough of the app's features
          </DialogDescription>
        </DialogHeader>
        <div className="relative w-full aspect-video bg-black">
          {open && (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${TUTORIAL_YOUTUBE_ID}?rel=0&modestbranding=1&playsinline=1`}
              title="App tutorial video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialModal;
