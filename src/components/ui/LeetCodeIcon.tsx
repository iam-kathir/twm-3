import React, { forwardRef } from "react";

export interface LeetCodeIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

/**
 * Official TWM 3D LeetCode Emblem Component
 * Displays the high-resolution glossy 3D LeetCode emblem across all platform surfaces.
 */
export const LeetCodeIcon = forwardRef<HTMLImageElement, LeetCodeIconProps>(
  function LeetCodeIcon(
    { className = "h-4 w-4", alt = "LeetCode", style, ...props },
    ref
  ) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={ref}
        src="/leetcode-3d.png"
        alt={alt}
        className={`inline-block object-contain shrink-0 ${className}`}
        style={{ display: "inline-block", verticalAlign: "middle", ...style }}
        {...props}
      />
    );
  }
);

LeetCodeIcon.displayName = "LeetCodeIcon";

export { LeetCodeIcon as LeetCode, LeetCodeIcon as Code2 };
export default LeetCodeIcon;
