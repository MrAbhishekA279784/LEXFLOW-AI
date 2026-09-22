import React from 'react';

interface GlassBadgeProps {
  variant?: 'orange' | 'neutral' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  variant = 'orange',
  size = 'sm',
  children,
  icon,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 rounded-full font-medium',
    md: 'text-xs px-3 py-1 rounded-full font-semibold'
  }[size];

  const variantClasses = {
    orange: 'bg-[#FF6B22]/10 text-[#FF6B22] border border-[#FF6B22]/20',
    neutral: 'bg-white/70 text-[#6F6A64] border border-white/80',
    success: 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-800 border border-amber-500/25',
    info: 'bg-blue-500/10 text-blue-700 border border-blue-500/20'
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1 backdrop-blur-md ${sizeClasses} ${variantClasses} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
