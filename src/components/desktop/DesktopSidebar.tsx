import React from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  FileText, 
  Scale, 
  Layers, 
  Bot, 
  AlertTriangle, 
  Briefcase, 
  Settings, 
  ArrowRight,
  Sparkles,
  History,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenId } from '../../types';

interface NavItem {
  id: ScreenId | 'settings' | 'risks';
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

export const DesktopSidebar: React.FC = () => {
  const { currentScreen, navigateTo, setActiveDocTab } = useApp();

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-4 h-4" />,
      action: () => navigateTo('home'),
    },
    {
      id: 'upload',
      label: 'Documents',
      icon: <FileText className="w-4 h-4" />,
      action: () => navigateTo('upload'),
    },
    {
      id: 'document-history',
      label: 'Document History',
      icon: <History className="w-4 h-4" />,
      action: () => navigateTo('document-history'),
    },
    {
      id: 'compliance-audit',
      label: 'Compliance Audit',
      icon: <ShieldCheck className="w-4 h-4 text-[#FF6B22]" />,
      action: () => navigateTo('compliance-audit'),
    },
    {
      id: 'scenario-input',
      label: 'What-If Simulator',
      icon: <Scale className="w-4 h-4" />,
      action: () => navigateTo('scenario-input'),
    },
    {
      id: 'compare',
      label: 'Compare Documents',
      icon: <Layers className="w-4 h-4" />,
      action: () => navigateTo('compare'),
    },
    {
      id: 'assistant',
      label: 'Legal Assistant',
      icon: <Bot className="w-4 h-4" />,
      action: () => navigateTo('assistant'),
    },
    {
      id: 'risks',
      label: 'Risks & Insights',
      icon: <AlertTriangle className="w-4 h-4" />,
      action: () => {
        setActiveDocTab('Risks');
        navigateTo('legal-graph');
      },
    },
    {
      id: 'lawyer-kit',
      label: 'Lawyer Prep-Kit',
      icon: <Briefcase className="w-4 h-4" />,
      action: () => navigateTo('lawyer-kit'),
    },
  ];

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between p-5 rounded-[32px] glass-panel border border-white/80 shadow-lg shadow-[#46321e]/5 select-none h-[calc(100vh-5rem)] sticky top-6">
      <div className="space-y-6">
        {/* Top Logo */}
        <div 
          onClick={() => navigateTo('home')}
          className="flex items-center gap-1 cursor-pointer px-3 pt-2 group"
        >
          <span className="text-2xl font-extrabold tracking-tight text-[#151515]">LEX</span>
          <span className="text-2xl font-extrabold tracking-tight text-[#FF6B22] group-hover:opacity-90 transition-opacity">FLOW</span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id || (item.id === 'risks' && currentScreen === 'legal-graph');
            return (
              <button
                key={item.label}
                onClick={item.action}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#FFF2EA] text-[#FF6B22] font-bold border border-[#FF6B22]/20 shadow-xs'
                    : 'text-[#6F6A64] hover:text-[#151515] hover:bg-white/60'
                }`}
              >
                <span className={isActive ? 'text-[#FF6B22]' : 'text-stone-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 pb-1">
            <div className="border-t border-stone-200/60" />
          </div>

          {/* Settings */}
          <button
            onClick={() => navigateTo('more')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left ${
              currentScreen === 'more'
                ? 'bg-[#FFF2EA] text-[#FF6B22] font-bold border border-[#FF6B22]/20 shadow-xs'
                : 'text-[#6F6A64] hover:text-[#151515] hover:bg-white/60'
            }`}
          >
            <Settings className="w-4 h-4 text-stone-500" />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Bottom CTA Card in Sidebar with 3D Sphere Orb Visual */}
      <div className="relative pt-4 overflow-hidden rounded-2xl">
        {/* Glowing glass sphere background visual with 3D animation */}
        <div className="relative mb-3 flex justify-center items-center">
          <motion.div 
            animate={{ 
              y: [0, -6, 0],
              rotate: [0, 4, 0, -4, 0]
            }}
            transition={{ 
              duration: 7, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="relative w-20 h-20 flex items-center justify-center cursor-pointer"
          >
            {/* Ambient orange glow breathing */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF6B22]/50 via-[#FF8A3D]/35 to-amber-200/30 blur-md animate-pulse" />
            {/* 3D Glass Sphere with specular reflections */}
            <div className="relative w-18 h-18 rounded-full bg-gradient-to-br from-[#FFA066] via-[#FF6B22] to-[#9C3502] shadow-xl shadow-[#FF6B22]/35 flex items-center justify-center overflow-hidden border border-white/60">
              <div className="absolute top-2 left-3 w-7 h-4 rounded-full bg-white/50 blur-2xs rotate-[-25deg]" />
              <div className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-orange-950/25 blur-xs" />
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.8),transparent_65%)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>

        {/* CTA Text & Action Button with 3D Depth */}
        <motion.div 
          whileHover={{ y: -2, scale: 1.01 }}
          className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/95 shadow-xs flex items-center justify-between gap-2 transition-all hover:border-[#FF6B22]/30"
        >
          <p className="text-xs font-bold text-[#151515] leading-snug text-left">
            Turn Legal Complexity Into Clear Next Steps.
          </p>
          <button
            onClick={() => navigateTo('scenario-input')}
            aria-label="Get Started"
            className="w-8 h-8 rounded-full bg-[#FF6B22] hover:bg-[#F25E12] text-white flex items-center justify-center shadow-md shadow-[#FF6B22]/30 shrink-0 transition-all hover:scale-108 active:scale-95 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </aside>
  );
};
