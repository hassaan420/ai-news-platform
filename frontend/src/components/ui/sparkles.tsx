import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

interface SparklesProps {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
}

const random = (min: number, max: number) => Math.random() * (max - min) + min;

export const SparklesCore = ({
  id,
  background,
  minSize = 0.5,
  maxSize = 1.5,
  particleDensity = 25,
  className,
  particleColor = "#FFFFFF",
}: SparklesProps) => {
  const [particles, setParticles] = useState<any[]>([]);
  const controls = useAnimation();

  useEffect(() => {
    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (prefersReducedMotion) {
      setParticles([]);
      return;
    }

    const generatedParticles = Array.from({ length: particleDensity }).map((_, i) => ({
      id: i,
      x: random(0, 100), // percentage
      y: random(0, 100), // percentage
      size: random(minSize, maxSize),
      duration: random(4, 12),
      delay: random(0, 8),
      opacity: random(0.2, 0.6),
    }));

    setParticles(generatedParticles);
  }, [particleDensity, minSize, maxSize]);

  return (
    <div
      className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}
      style={{ background }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            opacity: 0,
            x: `${particle.x}%`,
            y: `${particle.y}%`,
          }}
          animate={{
            opacity: [0, particle.opacity, 0],
            y: [`${particle.y}%`, `${particle.y - random(10, 20)}%`],
            x: [`${particle.x}%`, `${particle.x + random(-10, 10)}%`],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particleColor,
            boxShadow: `0 0 ${particle.size * 2}px ${particleColor}`,
          }}
        />
      ))}
    </div>
  );
};
