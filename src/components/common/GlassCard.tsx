import React, { useState, useRef, useCallback } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'sunken' | 'accent' | 'warning';
  interactive?: boolean;
  tilt?: boolean;
  maxTilt?: number;
  sheen?: boolean;
  haptic?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  interactive = false,
  tilt = false,
  maxTilt = 6,
  sheen = false,
  haptic = true,
  children,
  className = '',
  onClick,
  onTap,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltState, setTiltState] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const { triggerHaptic } = useHapticFeedback();

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (haptic && (interactive || onClick || onTap)) {
      triggerHaptic('light');
    }
    onClick?.(e);
  };

  const handleCardTap = (event: MouseEvent | TouchEvent | PointerEvent, info: any) => {
    if (haptic && (interactive || onClick || onTap)) {
      triggerHaptic('light');
    }
    onTap?.(event, info);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setTiltState({
      x: (y - 0.5) * -maxTilt * 2,
      y: (x - 0.5) * maxTilt * 2
    });
    setGlarePos({
      x: x * 100,
      y: y * 100,
      opacity: 0.35
    });
  }, [tilt, maxTilt]);

  const handleMouseEnter = () => {
    if (tilt) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (tilt) {
      setIsHovered(false);
      setTiltState({ x: 0, y: 0 });
      setGlarePos(prev => ({ ...prev, opacity: 0 }));
    }
  };

  const variantStyles = {
    default: 'glass-card',
    elevated: 'glass-panel shadow-xl shadow-[#46321e]/8',
    sunken: 'bg-white/40 backdrop-blur-md border border-white/60 shadow-inner',
    accent: 'bg-gradient-to-br from-[#FFF5ED]/85 to-white/75 backdrop-blur-xl border border-[#FF6B22]/25 shadow-md shadow-[#FF6B22]/8',
    warning: 'bg-gradient-to-br from-[#FFF2EA]/90 to-[#FFF7F2]/75 backdrop-blur-xl border border-[#FF6B22]/35 shadow-md shadow-[#FF6B22]/12'
  }[variant];

  const hoverStyle = interactive && !tilt ? 'glass-card-hover cursor-pointer active:scale-[0.99]' : '';
  const sheenStyle = sheen ? 'glass-sheen' : '';

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={tilt ? {
        rotateX: tiltState.x,
        rotateY: tiltState.y,
        scale: isHovered ? 1.015 : 1,
      } : undefined}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 24,
        mass: 0.5
      }}
      style={tilt ? {
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      } : undefined}
      className={`rounded-2xl md:rounded-3xl p-5 md:p-6 transition-all duration-200 relative overflow-hidden ${variantStyles} ${hoverStyle} ${sheenStyle} ${className}`}
      onClick={handleCardClick}
      onTap={handleCardTap}
      data-haptic-card={interactive || onClick || onTap ? 'true' : undefined}
      {...props}
    >
      <div style={tilt ? { transformStyle: 'preserve-3d' } : undefined} className="relative z-10 w-full h-full">
        {children}
      </div>

      {/* Dynamic Glare Reflection for Tilt */}
      {tilt && (
        <div
          className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300 rounded-[inherit]"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle 240px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45) 0%, transparent 60%)`,
          }}
        />
      )}
    </motion.div>
  );
};

