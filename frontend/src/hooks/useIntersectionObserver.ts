import { useEffect, useRef, useState } from 'react';

export function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = { root: null, rootMargin: '0px 0px 400px 0px', threshold: 0 }
) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting) {
        callback();
      }
    }, options);

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [callback, options.root, options.rootMargin, options.threshold]);

  return { targetRef, isIntersecting };
}

