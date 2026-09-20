import * as React from "react";
import { NxtqrMark, NxtqrMarkProps } from "./nxtqr-mark";

export interface NxtqrAnimatedMarkProps extends NxtqrMarkProps {
  /** Speed of the routing cycle in milliseconds (default: 1200) */
  duration?: number;
  /** Whether the animation is active */
  active?: boolean;
}

export type NxtqrMarkAnimatedProps = NxtqrAnimatedMarkProps;

/**
 * NXTQR Animated Mark
 * Motion brand mark sharing exact resting geometry with NxtqrMark.
 * Animates a continuous data route pulse through the ribbon paths:
 * Scan (Entry) -> Resolve -> Route -> Destination.
 */
export function NxtqrAnimatedMark({
  size = 32,
  className = "",
  duration = 1200,
  active = true,
  variant = "gradient",
  ...props
}: NxtqrAnimatedMarkProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${active ? "nxtqr-route-motion" : ""} ${className}`}
      style={{ width: size, height: size, animationDuration: `${duration}ms` }}
    >
      <NxtqrMark size={size} variant={variant} animated={active} {...props} />
    </div>
  );
}

// Backward compatibility aliases
export const NytraAnimatedMark = NxtqrAnimatedMark;
export const NytraMarkAnimated = NxtqrAnimatedMark;
export type NytraAnimatedMarkProps = NxtqrAnimatedMarkProps;
export type NytraMarkAnimatedProps = NxtqrAnimatedMarkProps;
