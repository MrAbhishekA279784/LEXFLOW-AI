import React from 'react';

export const BackgroundAura: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#F7F2EC]">
      {/* Top right warm peach orb with slow dynamic float */}
      <div 
        className="ambient-glow ambient-float-1 w-[420px] h-[420px] -top-20 -right-20 bg-gradient-to-br from-[#FF6B22]/18 via-[#FFA868]/15 to-transparent" 
      />
      {/* Center ambient warm soft cream light with breathing pulse */}
      <div 
        className="ambient-glow ambient-float-2 w-[580px] h-[580px] top-1/4 left-1/2 bg-gradient-to-tr from-[#FFF0E2]/70 via-[#FFE7D4]/50 to-transparent" 
      />
      {/* Bottom left soft warm glow */}
      <div 
        className="ambient-glow ambient-float-3 w-[460px] h-[460px] -bottom-24 -left-20 bg-gradient-to-tr from-[#FF6B22]/14 via-[#FFA05A]/15 to-transparent" 
      />
      {/* Subtle top left ambient tint for enhanced glass refraction */}
      <div 
        className="ambient-glow ambient-float-1 w-[320px] h-[320px] top-10 -left-10 bg-gradient-to-br from-amber-200/15 via-orange-100/10 to-transparent" 
      />
    </div>
  );
};

