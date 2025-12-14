import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}

export function RatingStars({ rating, onChange, readonly = false, size = "md" }: RatingStarsProps) {
  const sizeClasses = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn(
            "transition-colors",
            !readonly && "hover:scale-110 cursor-pointer",
            readonly && "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeClasses,
              "transition-colors",
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/40"
            )}
          />
        </button>
      ))}
    </div>
  );
}
