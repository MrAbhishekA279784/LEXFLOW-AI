import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';

interface PageTransitionProps {
  children: React.ReactNode;
  pageKey: string;
  className?: string;
}

/**
 * High-craft, Framer Motion-based page transition component.
 * Features a refined cubic-bezier spring transition with subtle spatial drift,
 * scale preservation, and opacity cross-fade for seamless screen swapping.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  pageKey,
  className = 'w-full flex-1 flex flex-col',
}) => {
  const { navigationDirection } = useApp();

  const isBack = navigationDirection === 'back';

  // Sophisticated direction-aware variants with subtle translation and depth scaling
  const variants = {
    initial: (isBackward: boolean) => ({
      opacity: 0,
      y: isBackward ? -10 : 12,
      scale: 0.992,
      filter: 'blur(3px)',
    }),
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: (isBackward: boolean) => ({
      opacity: 0,
      y: isBackward ? 10 : -8,
      scale: 0.992,
      filter: 'blur(3px)',
      transition: {
        duration: 0.18,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <AnimatePresence mode="wait" custom={isBack}>
      <motion.div
        key={pageKey}
        custom={isBack}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={`w-full ${className}`}
        style={{ willChange: 'transform, opacity, filter' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
