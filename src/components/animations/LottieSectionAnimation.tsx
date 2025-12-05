// src/components/animations/LottieSectionAnimation.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import lottie, { AnimationItem } from 'lottie-web';

interface LottieSectionAnimationProps {
  animationPath: string;
  className?: string;
  delay?: number;
}

const LottieSectionAnimation: React.FC<LottieSectionAnimationProps> = ({ 
  animationPath, 
  className = '', 
  delay = 0 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load from public folder using fetch
    const loadAnimation = async () => {
      try {
        const response = await fetch(`/animations/about_section/${animationPath}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch animation: ${animationPath}`);
        }
        
        const animationData = await response.json();
        
        if (!containerRef.current) return;
        
        animationRef.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
            progressiveLoad: true,
            hideOnTransparent: true,
          },
        });

        // Premium feel - slower animation
        animationRef.current.setSpeed(0.75);
        
        // Mark as loaded
        setIsLoaded(true);

      } catch (error) {
        console.error(`Lottie animation error: ${animationPath}`, error);
        // Still mark as loaded to avoid blocking UI
        setIsLoaded(true);
      }
    };

    loadAnimation();

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, [animationPath]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0, 
          scale: isLoaded ? 1 : 0.9 
        }}
        transition={{ 
          duration: 0.6, 
          delay: delay,
          ease: [0.25, 0.46, 0.45, 0.94],
          type: "spring",
          stiffness: 100,
          damping: 15,
        }}
        className={`relative w-full h-80 ${className}`}
      >
        <div 
          ref={containerRef} 
          className="absolute inset-0"
          aria-hidden="true"
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default LottieSectionAnimation;