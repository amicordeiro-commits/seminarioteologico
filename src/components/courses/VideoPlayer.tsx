import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  Settings,
  Subtitles,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  title: string;
  thumbnail?: string;
  duration: string;
  isCompleted?: boolean;
  onComplete?: () => void;
}

export function VideoPlayer({
  title,
  thumbnail,
  duration,
  isCompleted = false,
  onComplete,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [showControls, setShowControls] = useState(true);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Simulated total duration in seconds
  const totalSeconds = 1245; // ~20 minutes
  const currentSeconds = (progress / 100) * totalSeconds;

  return (
    <div
      className="relative bg-foreground rounded-xl overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isPlaying && setShowControls(true)}
    >
      {/* Video Area */}
      <div className="aspect-video relative">
        {/* Thumbnail/Video placeholder */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Play className="w-10 h-10 text-primary ml-1" />
                </div>
                <p className="text-background/80 font-medium">{title}</p>
              </div>
            </div>
          )}
        </div>

        {/* Play button overlay */}
        {!isPlaying && (
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-foreground/30 hover:bg-foreground/40 transition-colors"
          >
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-glow hover:scale-110 transition-transform">
              <Play className="w-10 h-10 text-primary-foreground ml-1" />
            </div>
          </button>
        )}

        {/* Completed badge */}
        {isCompleted && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-green-500/90 text-white rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Concluído
          </div>
        )}
      </div>

      {/* Controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground via-foreground/80 to-transparent transition-opacity",
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress bar */}
        <div className="mb-3">
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={(value) => setProgress(value[0])}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-background/60 mt-1">
            <span>{formatTime(currentSeconds)}</span>
            <span>{duration}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-background hover:text-background hover:bg-background/20"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>

            {/* Skip buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="text-background hover:text-background hover:bg-background/20"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-background hover:text-background hover:bg-background/20"
            >
              <SkipForward className="w-5 h-5" />
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="text-background hover:text-background hover:bg-background/20"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
              <div className="w-20 hidden sm:block">
                <Slider
                  value={isMuted ? [0] : volume}
                  max={100}
                  step={1}
                  onValueChange={(value) => {
                    setVolume(value);
                    if (value[0] > 0) setIsMuted(false);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Subtitles */}
            <Button
              variant="ghost"
              size="icon"
              className="text-background hover:text-background hover:bg-background/20"
            >
              <Subtitles className="w-5 h-5" />
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              className="text-background hover:text-background hover:bg-background/20"
            >
              <Settings className="w-5 h-5" />
            </Button>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              className="text-background hover:text-background hover:bg-background/20"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
