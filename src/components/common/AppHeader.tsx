import React from 'react';
import { ArrowLeft, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showLogo?: boolean;
  subtitle?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = true,
  onBack,
  rightAction,
  showLogo = false,
  subtitle
}) => {
  const { goBack, user, navigateTo } = useApp();
  const { triggerHaptic } = useHapticFeedback();

  const handleBack = () => {
    triggerHaptic('selection');
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full px-4 py-3 backdrop-blur-md bg-[#F7F2EC]/80 border-b border-white/50">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="w-9 h-9 rounded-full bg-white/70 border border-white/80 flex items-center justify-center text-[#151515] hover:bg-white transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {showLogo ? (
            <div 
              className="flex items-center gap-1 cursor-pointer" 
              onClick={() => {
                triggerHaptic('selection');
                navigateTo('home');
              }}
            >
              <span className="text-xl font-extrabold tracking-tight text-[#151515]">LEX</span>
              <span className="text-xl font-extrabold tracking-tight text-[#FF6B22]">FLOW</span>
            </div>
          ) : (
            <div>
              {title && (
                <h1 className="text-lg font-bold text-[#151515] tracking-tight leading-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs text-[#6F6A64]">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {rightAction ? (
            rightAction
          ) : showLogo ? (
            <button
              onClick={() => navigateTo('more')}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/90 shadow-sm cursor-pointer hover:ring-2 hover:ring-[#FF6B22]/30 transition-all"
            >
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
