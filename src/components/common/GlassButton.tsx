import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface GlassButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'dark' | 'glass' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-2 rounded-xl gap-1.5',
    md: 'text-sm px-5 py-3 rounded-2xl gap-2',
    lg: 'text-base px-6 py-4 rounded-2xl gap-2.5 font-semibold'
  }[size];

  const variantClasses = {
    primary: 'bg-[#FF6B22] hover:bg-[#F25E12] text-white shadow-lg shadow-[#FF6B22]/25 active:scale-[0.98]',
    secondary: 'bg-white/70 hover:bg-white/90 text-[#151515] border border-white/80 shadow-sm active:scale-[0.98]',
    dark: 'bg-[#151515] hover:bg-[#252525] text-white shadow-lg shadow-black/10 active:scale-[0.98]',
    glass: 'glass-panel hover:bg-white/80 text-[#151515] active:scale-[0.98]',
    outline: 'border border-[#FF6B22]/40 text-[#FF6B22] hover:bg-[#FF6B22]/5 active:scale-[0.98]',
    danger: 'bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 border border-rose-200 active:scale-[0.98]'
  }[variant];

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};
