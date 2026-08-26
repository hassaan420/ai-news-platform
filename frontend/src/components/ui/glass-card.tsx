import { cn } from '@/lib/utils';
import { forwardRef, type HTMLAttributes } from 'react';

const glassVariants = {
  subtle: 'bg-white/[0.2] backdrop-blur-xl border border-white/[0.15]',
  default: 'bg-white/[0.12] backdrop-blur-xl border border-white/[0.2] shadow-2xl',
  strong: 'bg-white/[0.2] backdrop-blur-2xl border border-white/[0.12] shadow-2xl',
} as const;

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof glassVariants;
  hover?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', hover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl',
          glassVariants[variant],
          hover && 'hover:-translate-y-1 hover:bg-white/[0.2] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-300',
          className
        )}
        {...props}
      />
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard, glassVariants };
