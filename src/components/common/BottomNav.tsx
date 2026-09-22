import React from 'react';
import { Home, FileText, Bot, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { ScreenId } from '../../types';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigateTo } = useApp();
  const { triggerHaptic } = useHapticFeedback();

  // Highlight active bottom tab
  const getActiveTab = (): 'home' | 'documents' | 'assistant' | 'more' => {
    if (currentScreen === 'home') return 'home';
    if (['upload', 'analyzing', 'legal-graph', 'compare'].includes(currentScreen)) return 'documents';
    if (currentScreen === 'assistant') return 'assistant';
    if (currentScreen === 'more') return 'more';
    if (['scenario-input', 'scenario-result', 'lawyer-kit'].includes(currentScreen)) return 'home';
    return 'home';
  };

  const activeTab = getActiveTab();

  const navItems: { id: 'home' | 'documents' | 'assistant' | 'more'; label: string; icon: React.ReactNode; target: ScreenId }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
      target: 'home'
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <FileText className="w-5 h-5" />,
      target: 'legal-graph'
    },
    {
      id: 'assistant',
      label: 'Assistant',
      icon: <Bot className="w-5 h-5" />,
      target: 'assistant'
    },
    {
      id: 'more',
      label: 'More',
      icon: <Menu className="w-5 h-5" />,
      target: 'more'
    }
  ];

  return (
    <nav 
      aria-label="Main Navigation" 
      className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto px-4 pt-1 pointer-events-auto lg:hidden"
      style={{
        paddingBottom: 'max(0.75rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))'
      }}
    >
      <div className="glass-nav rounded-2xl px-3 py-2 flex items-center justify-around shadow-lg shadow-[#46321e]/8">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                triggerHaptic('selection');
                navigateTo(item.target);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'text-[#FF6B22] font-semibold' 
                  : 'text-[#6F6A64] hover:text-[#151515]'
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-[#FF6B22] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
