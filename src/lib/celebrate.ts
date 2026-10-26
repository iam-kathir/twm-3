import confetti from "canvas-confetti";

/**
 * Fires full-screen celebratory confetti with TWM brand colors (Emerald, Mint, Gold, Cyan)
 */
export function fireTournamentCelebration() {
  if (typeof window === "undefined") return;

  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;

  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 9999,
    colors: ["#10B981", "#34D399", "#F59E0B", "#38BDF8", "#FFFFFF"],
  };

  const interval: ReturnType<typeof setInterval> = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 40 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.15, 0.35), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.65, 0.85), y: Math.random() - 0.2 },
    });
  }, 250);
}

/**
 * Targeted micro-burst for interactive buttons, badge claims, and copy actions
 */
export function fireMilestoneBurst(x = 0.5, y = 0.5) {
  if (typeof window === "undefined") return;

  confetti({
    particleCount: 50,
    spread: 60,
    origin: { x, y },
    colors: ["#10B981", "#34D399", "#6EE7B7", "#F59E0B"],
    zIndex: 9999,
    disableForReducedMotion: true,
  });
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
