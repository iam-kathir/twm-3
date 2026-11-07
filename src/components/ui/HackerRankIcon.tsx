import React, { forwardRef } from "react";

export interface HackerRankIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  variant?: "square" | "wide";
}

/**
 * Official TWM HackerRank Brand Icon Component
 * Renders the authentic HackerRank emblem across all platform surfaces.
 */
export const HackerRankIcon = forwardRef<HTMLImageElement, HackerRankIconProps>(
  function HackerRankIcon(
    { className = "h-4 w-4", variant = "square", alt = "HackerRank", style, ...props },
    ref
  ) {
    const src = variant === "wide" ? "/hackerrank-logo.png" : "/hackerrank-icon.png";
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={`inline-block object-contain shrink-0 ${className}`}
        style={{ display: "inline-block", verticalAlign: "middle", ...style }}
        {...props}
      />
    );
  }
);

HackerRankIcon.displayName = "HackerRankIcon";

export { HackerRankIcon as HackerRank };
export default HackerRankIcon;

