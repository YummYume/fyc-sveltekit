export const prefersReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  return mediaQuery.matches;
};
