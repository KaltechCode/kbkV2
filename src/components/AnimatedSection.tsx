import { ReactNode } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

type AnimationVariant = 
  | 'fade-up' 
  | 'fade-down' 
  | 'fade-left' 
  | 'fade-right' 
  | 'scale-up' 
  | 'slide-up' 
  | 'zoom-in';

type AnimationDuration = 'fast' | 'normal' | 'slow';

interface AnimatedSectionProps {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: AnimationDuration;
  threshold?: number;
  className?: string;
}

const durationClasses: Record<AnimationDuration, string> = {
  fast: 'duration-300',
  normal: 'duration-600',
  slow: 'duration-1000',
};

const AnimatedSection = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 'normal',
  threshold = 0.1,
  className = '',
}: AnimatedSectionProps) => {
  const { ref, isVisible } = useScrollAnimation({ threshold, triggerOnce: true });

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all',
        durationClasses[duration],
        !isVisible && 'opacity-0',
        !isVisible && variant === 'fade-up' && 'translate-y-8',
        !isVisible && variant === 'fade-down' && '-translate-y-8',
        !isVisible && variant === 'fade-left' && 'translate-x-8',
        !isVisible && variant === 'fade-right' && '-translate-x-8',
        !isVisible && variant === 'scale-up' && 'scale-95',
        !isVisible && variant === 'slide-up' && 'translate-y-12',
        !isVisible && variant === 'zoom-in' && 'scale-90',
        isVisible && 'opacity-100 translate-x-0 translate-y-0 scale-100',
        className
      )}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
