import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  FileText, 
  Scale, 
  Briefcase, 
  Settings, 
  HelpCircle, 
  ShieldCheck, 
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

export const MoreMenuScreen: React.FC = () => {
  const { user, goBack, navigateTo } = useApp();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigateTo('welcome');
    } catch (error) {
      console.error('Error signing out:', error);
      navigateTo('welcome'); // Fallback to welcome screen anyway
    }
  };

  const menuItems = [
    { label: 'My Documents', icon: <FileText className="w-5 h-5 text-stone-600" />, action: () => navigateTo('upload') },
    { label: 'Compliance Audit', icon: <ShieldCheck className="w-5 h-5 text-[#FF6B22]" />, action: () => navigateTo('compliance-audit') },
    { label: 'Scenarios', icon: <Scale className="w-5 h-5 text-stone-600" />, action: () => navigateTo('scenario-input') },
    { label: 'Lawyer Kits', icon: <Briefcase className="w-5 h-5 text-stone-600" />, action: () => navigateTo('lawyer-kit') },
    { label: 'Settings', icon: <Settings className="w-5 h-5 text-stone-600" />, action: () => navigateTo('settings') },
    { label: 'Help & Support', icon: <HelpCircle className="w-5 h-5 text-stone-600" />, action: () => navigateTo('help') },
    { label: 'Terms & Privacy', icon: <ShieldCheck className="w-5 h-5 text-stone-600" />, action: () => navigateTo('terms') },
    { label: 'Sign Out', icon: <LogOut className="w-5 h-5 text-rose-600" />, action: handleSignOut },
  ];

  return (
    <div className="min-h-screen pb-28 max-w-md mx-auto px-6 py-6 flex flex-col justify-between text-left">
      <div>
        {/* Close Button at top left */}
        <div className="flex items-center justify-between pb-4">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white/80 border border-white/90 flex items-center justify-center text-stone-700 hover:bg-white transition-all shadow-xs cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card p-5 rounded-3xl border border-white/90 shadow-sm mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="text-sm font-bold text-[#151515] leading-tight">
                  {user.name}
                </h3>
                <p className="text-xs text-[#6F6A64] mt-0.5">{user.email}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Menu Navigation Links */}
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full px-4 py-3.5 rounded-2xl hover:bg-white/70 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                {item.icon}
                <span className={`text-sm font-semibold ${item.label === 'Sign Out' ? 'text-rose-600' : 'text-[#151515]'}`}>
                  {item.label}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="pt-8 text-center space-y-1">
        <div className="flex items-center justify-center">
          <span className="text-xl font-extrabold tracking-tight text-[#151515]">LEX</span>
          <span className="text-xl font-extrabold tracking-tight text-[#FF6B22]">FLOW</span>
        </div>
        <p className="text-xs text-[#6F6A64]">
          Legal clarity for a fairer tomorrow.
        </p>
      </div>
    </div>
  );
};
