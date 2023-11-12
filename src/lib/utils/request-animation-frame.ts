export const requestAnimationFrame = (callback: () => void | Promise<void>): number | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (typeof window.requestAnimationFrame === 'function') {
    return window.requestAnimationFrame(callback);
  }

  // Safari
  return window.setTimeout(callback, 1);
};
