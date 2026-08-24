import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLoader() {
  const [stage, setStage] = useState(0);
  const [nodes, setNodes] = useState<{x1: number, y1: number, x2: number, y2: number, delay: number}[]>([]);

  useEffect(() => {
    // Generate static random positions for the constellation so they don't jump on re-renders
    const generatedNodes = Array.from({length: 25}).map(() => ({
      x1: 40 + Math.random() * 20,
      y1: 40 + Math.random() * 20,
      x2: 30 + Math.random() * 40,
      y2: 30 + Math.random() * 40,
      delay: Math.random() * 0.8
    }));
    setNodes(generatedNodes);

    // Sequence timing (Extended Cinematic Version)
    // Stage 0: Initial blank
    // Stage 1: Particles appear and connect slowly (0.3s)
    // Stage 2: 'C' Forms with plasma glow (2.5s)
    // Stage 3: 'Clarion' spells out (4.5s)
    // Stage 4: Subtitle appears (5.5s)
    // Stage 5: Fade out and unmount (7.5s)
    const t1 = setTimeout(() => setStage(1), 300);
    const t2 = setTimeout(() => setStage(2), 2500);
    const t3 = setTimeout(() => setStage(3), 4500);
    const t4 = setTimeout(() => setStage(4), 5500);
    const t5 = setTimeout(() => setStage(5), 7500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, []);

  return (
    <AnimatePresence>
      {stage < 5 && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F9F8F6] overflow-hidden"
        >
           {/* Complex constellation effect built with SVG lines and framer motion */}
           <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
             <svg width="100%" height="100%" className="absolute inset-0">
                {/* Connecting lines that draw themselves */}
                {nodes.map((n, i) => (
                  <motion.line
                    key={`line-${i}`}
                    x1={`${n.x1}%`}
                    y1={`${n.y1}%`}
                    x2={`${n.x2}%`}
                    y2={`${n.y2}%`}
                    stroke="currentColor"
                    className="text-primary"
                    strokeWidth="0.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: stage >= 1 ? 1 : 0, opacity: stage >= 1 ? 0.4 : 0 }}
                    transition={{ duration: 3.5, ease: "easeInOut", delay: n.delay * 1.5 }}
                  />
                ))}
             </svg>
             {/* Glowing nodes with continuous pulse */}
             {nodes.map((n, i) => (
                <motion.div
                  key={`node-${i}`}
                  className="absolute w-1.5 h-1.5 rounded-full bg-primary"
                  style={{
                    left: `${n.x1}%`,
                    top: `${n.y1}%`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: stage >= 1 ? [1, 1.5, 1] : 0, 
                    opacity: stage >= 1 ? [0.6, 0.2, 0.6] : 0 
                  }}
                  transition={{ 
                    scale: { duration: 0.8, delay: n.delay * 1.5 },
                    opacity: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: n.delay * 2 }
                  }}
                />
             ))}
           </div>

           {/* The Core / Logo */}
           <div className="relative z-10 flex flex-col items-center">
             <div className="relative h-24 flex items-center justify-center">
                {/* Background Core Plasma Glow */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: stage >= 1 ? 1.5 : 0, 
                    opacity: stage >= 1 && stage < 3 ? 0.08 : 0 
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute w-32 h-32 rounded-full bg-primary blur-2xl"
                />
                
                {/* Text Logo */}
                <motion.div
                  className="text-primary font-serif text-6xl tracking-tight flex items-center"
                >
                   {/* The C */}
                   <motion.span
                     initial={{ opacity: 0, filter: 'blur(15px)', scale: 0.9 }}
                     animate={{ opacity: stage >= 2 ? 1 : 0, filter: stage >= 2 ? 'blur(0px)' : 'blur(15px)', scale: stage >= 2 ? 1 : 0.9 }}
                     transition={{ duration: 1.8, ease: "easeOut" }}
                   >
                     C
                   </motion.span>
                   
                   {/* The rest of the word */}
                   <motion.span
                     initial={{ width: 0, opacity: 0 }}
                     animate={{ 
                       width: stage >= 3 ? "auto" : 0, 
                       opacity: stage >= 3 ? 1 : 0 
                     }}
                     transition={{ duration: 1.5, ease: "easeInOut" }}
                     className="overflow-hidden whitespace-nowrap"
                   >
                     larion
                   </motion.span>
                </motion.div>
             </div>

             {/* Subtitle */}
             <motion.div
               initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
               animate={{ 
                 opacity: stage >= 4 ? 1 : 0, 
                 y: stage >= 4 ? 0 : 15,
                 filter: stage >= 4 ? 'blur(0px)' : 'blur(8px)'
               }}
               transition={{ duration: 1.2 }}
               className="mt-8 text-[11px] uppercase tracking-[0.4em] text-primary/70 font-semibold"
             >
               Intelligent • Objective • Calm
             </motion.div>
           </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
