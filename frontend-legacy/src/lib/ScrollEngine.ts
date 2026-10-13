/**
 * Smoothly scrolls a container element to a target scrollTop offset over a specified duration
 * using a custom exponential ease-out curve.
 */
export function animateScrollTo(
  element: HTMLElement,
  to: number,
  duration: number = 1000,
  onComplete?: () => void
) {
  const start = element.scrollTop;
  const change = to - start;
  
  // If difference is tiny, set target immediately and callback
  if (Math.abs(change) < 2) {
    element.scrollTop = to;
    if (onComplete) onComplete();
    return;
  }

  const startTime = performance.now();

  const easeOutExpo = (t: number) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeOutExpo(progress);

    element.scrollTop = start + change * ease;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.scrollTop = to;
      if (onComplete) onComplete();
    }
  };

  requestAnimationFrame(animate);
}
