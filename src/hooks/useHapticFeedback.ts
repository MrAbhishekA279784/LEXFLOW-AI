import { useCallback, useEffect, useRef } from 'react';

export type HapticPattern = 
  | 'light' 
  | 'selection' 
  | 'medium' 
  | 'heavy' 
  | 'success' 
  | 'warning' 
  | number 
  | number[];

export interface UseHapticOptions {
  enabled?: boolean;
  autoAttach?: boolean;
}

// Preset vibration durations in milliseconds
const HAPTIC_PATTERNS: Record<string, number | number[]> = {
  selection: 8,       // Very subtle tick for tab/menu selection
  light: 10,          // Subtle crisp tap for cards and interactive items
  medium: 18,         // Slightly more defined feedback
  heavy: 28,          // Prominent feedback
  success: [10, 40, 15],
  warning: [15, 60, 20],
};

/**
 * Checks if the Vibration API is supported in the current environment
 */
export const isHapticSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'vibrate' in navigator &&
    typeof navigator.vibrate === 'function'
  );
};

/**
 * Custom React hook for triggering subtle haptic feedback using navigator.vibrate
 */
export const useHapticFeedback = (options: UseHapticOptions = {}) => {
  const { enabled = true, autoAttach = false } = options;
  const lastVibrateTime = useRef<number>(0);

  const triggerHaptic = useCallback(
    (pattern: HapticPattern = 'light') => {
      if (!enabled) return;
      if (!isHapticSupported()) return;

      // Throttle haptic triggers to avoid vibration stacking/jitter
      const now = performance.now();
      if (now - lastVibrateTime.current < 45) {
        return;
      }
      lastVibrateTime.current = now;

      try {
        let vibrationPattern: number | number[];
        if (typeof pattern === 'string') {
          vibrationPattern = HAPTIC_PATTERNS[pattern] ?? 10;
        } else {
          vibrationPattern = pattern;
        }

        navigator.vibrate(vibrationPattern);
      } catch (err) {
        // Silently swallow errors (e.g. if iframe permissions or browser policies block vibration)
      }
    },
    [enabled]
  );

  const selectionHaptic = useCallback(() => triggerHaptic('selection'), [triggerHaptic]);
  const lightHaptic = useCallback(() => triggerHaptic('light'), [triggerHaptic]);
  const mediumHaptic = useCallback(() => triggerHaptic('medium'), [triggerHaptic]);

  // Optional auto-attach listener to automatically give tactile feedback 
  // to glass cards and navigation items when touched on mobile devices
  useEffect(() => {
    if (!autoAttach || !enabled || typeof window === 'undefined') return;

    const handlePointerDown = (event: PointerEvent) => {
      // Prioritize mobile touch and stylus interactions
      const isTouchOrCoarse = 
        event.pointerType === 'touch' || 
        event.pointerType === 'pen' || 
        window.matchMedia('(pointer: coarse)').matches;

      if (!isTouchOrCoarse) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Check if target is inside a navigation element or an interactive glass-card element
      const navItem = target.closest('nav button, .glass-nav button, [data-haptic-nav]');
      if (navItem) {
        triggerHaptic('selection');
        return;
      }

      const glassCardItem = target.closest(
        '.glass-card.cursor-pointer, .glass-card-hover, button.glass-card, [data-haptic-card], [data-haptic]'
      );
      if (glassCardItem) {
        triggerHaptic('light');
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [autoAttach, enabled, triggerHaptic]);

  return {
    triggerHaptic,
    selectionHaptic,
    lightHaptic,
    mediumHaptic,
    isSupported: isHapticSupported(),
  };
};

export default useHapticFeedback;
