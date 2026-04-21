import { useEffect } from 'react';
import { useStore } from '../store/useStore';

const ACCENT_HUES = {
  blue: 230,
  graphite: 260,
  green: 150,
  amber: 75,
  red: 25,
};

/**
 * Applies tweak state (theme, density, accent, typography) to the <html> root.
 * Single source of truth — mount <TweaksProvider /> once near the app root.
 */
export function useTweaksEffect() {
  const { tweaks } = useStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', tweaks.theme === 'dark');
    root.classList.toggle('density-compact', tweaks.density === 'compact');
    root.dataset.view = tweaks.view;
    root.dataset.typepair = tweaks.typePair;

    const hue = ACCENT_HUES[tweaks.accent] ?? 230;
    root.style.setProperty('--accent-h', String(hue));
    // Graphite uses near-zero chroma
    if (tweaks.accent === 'graphite') {
      root.style.setProperty('--accent', 'oklch(0.42 0.02 260)');
      root.style.setProperty('--accent-soft', 'oklch(0.94 0.005 260)');
      root.style.setProperty('--accent-ink', 'oklch(0.22 0.008 260)');
      if (tweaks.theme === 'dark') {
        root.style.setProperty('--accent', 'oklch(0.78 0.02 260)');
        root.style.setProperty('--accent-soft', 'oklch(0.26 0.006 260)');
        root.style.setProperty('--accent-ink', 'oklch(0.95 0.004 260)');
      }
    } else {
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-soft');
      root.style.removeProperty('--accent-ink');
    }

    // Typography pairings
    if (tweaks.typePair === 'sans-mono') {
      root.style.setProperty('--display-font', "'Inter', system-ui, sans-serif");
    } else if (tweaks.typePair === 'all-sans') {
      root.style.setProperty('--display-font', "'Inter', system-ui, sans-serif");
    } else {
      root.style.setProperty('--display-font', "'Instrument Serif', Georgia, serif");
    }
  }, [tweaks]);
}

export default useTweaksEffect;
