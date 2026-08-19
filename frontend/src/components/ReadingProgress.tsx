import { type RefObject } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

interface ReadingProgressProps {
  /** Ref to the article element whose scroll progress should be tracked. */
  targetRef: RefObject<HTMLElement | null>;
}

/**
 * ReadingProgress — a thin, fixed progress bar pinned to the top of the
 * viewport that fills as the reader scrolls through the article.
 *
 * It uses framer-motion's useScroll bound to the article container for precise 
 * tracking without manual ResizeObserver/RAF loops.
 */
export default function ReadingProgress({ targetRef }: ReadingProgressProps) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    // Start tracking when the top of the article reaches the top of the viewport.
    // Finish when the bottom of the article reaches the bottom of the viewport.
    offset: ["start start", "end end"]
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[5px] pointer-events-none bg-muted/50 backdrop-blur-sm"
      aria-hidden="true"
    >
      <motion.div
        className="h-full w-full origin-left bg-primary shadow-[0_0_12px_2px_rgba(var(--primary),0.6)]"
        style={{ scaleX }}
      />
    </div>
  );
}
