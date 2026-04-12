import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glowColor = "rgba(0, 255, 255, 0.1)", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:bg-white/10",
          className
        )}
        style={{
          boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 20px ${glowColor}`,
        }}
        {...props}
      >
        <div className="relative z-10">{children}</div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";
