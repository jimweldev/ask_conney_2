import { useEffect, useRef } from 'react';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from 'motion/react';

type AnimatedNumberProps = {
  value: number;
  duration?: number; // seconds
  className?: string;
  once?: boolean; // whether to animate only once when in view
};

const AnimatedNumber = ({
  value,
  duration = 1.5,
  className,
  once = true,
}: AnimatedNumberProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);

  // Convert motion value to formatted text
  const displayValue = useTransform(motionValue, latest =>
    Math.round(latest).toLocaleString(),
  );

  // Detect when element is in view
  const isInView = useInView(ref, { once });

  useEffect(() => {
    // Only animate when visible
    if (isInView) {
      const controls = animate(motionValue, value || 0, {
        duration,
        ease: 'easeOut',
      });
      return controls.stop;
    }
  }, [isInView, value, duration, motionValue]);

  return (
    <motion.span ref={ref} className={className}>
      {displayValue}
    </motion.span>
  );
};

export default AnimatedNumber;
