import React, { lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BackgroundAura } from './components/common/BackgroundAura';
import { EvidenceModal } from './components/common/EvidenceModal';
import { PdfPreviewModal } from './components/common/PdfPreviewModal';
import { GraphExportModal } from './components/common/GraphExportModal';
import { PageTransition } from './components/common/PageTransition';
import { BottomNav } from './components/common/BottomNav';
import { useHapticFeedback } from './hooks/useHapticFeedback';

// Lightweight core screens imported synchronously
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { UploadScreen } from './components/screens/UploadScreen';
import { AnalyzingScreen } from './components/screens/AnalyzingScreen';
import { MoreMenuScreen } from './components/screens/MoreMenuScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { HelpScreen } from './components/screens/HelpScreen';
import { TermsScreen } from './components/screens/TermsScreen';

// Heavy feature screens and desktop shell lazy-loaded on demand
const DesktopShell = lazy(() => import('./components/desktop/DesktopShell').then(m => ({ default: m.DesktopShell })));
const LegalGraphScreen = lazy(() => import('./components/screens/LegalGraphScreen').then(m => ({ default: m.LegalGraphScreen })));
const ComplianceAuditScreen = lazy(() => import('./components/screens/ComplianceAuditScreen').then(m => ({ default: m.ComplianceAuditScreen })));
const LawyerKitScreen = lazy(() => import('./components/screens/LawyerKitScreen').then(m => ({ default: m.LawyerKitScreen })));
const CompareScreen = lazy(() => import('./components/screens/CompareScreen').then(m => ({ default: m.CompareScreen })));
const ScenarioInputScreen = lazy(() => import('./components/screens/ScenarioInputScreen').then(m => ({ default: m.ScenarioInputScreen })));
const ScenarioResultScreen = lazy(() => import('./components/screens/ScenarioResultScreen').then(m => ({ default: m.ScenarioResultScreen })));
const AssistantScreen = lazy(() => import('./components/screens/AssistantScreen').then(m => ({ default: m.AssistantScreen })));
const DocumentHistoryScreen = lazy(() => import('./components/screens/DocumentHistoryScreen').then(m => ({ default: m.DocumentHistoryScreen })));

const SuspenseFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[300px] w-full p-6 text-center text-stone-500 font-serif italic">
    Loading feature module...
  </div>
);

const MainRouter: React.FC = () => {
  const { currentScreen } = useApp();
  useHapticFeedback({ autoAttach: true });

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'auth':
        return <AuthScreen />;
      case 'home':
        return <HomeScreen />;
      case 'upload':
        return <UploadScreen />;
      case 'analyzing':
        return <AnalyzingScreen />;
      case 'legal-graph':
        return <LegalGraphScreen />;
      case 'scenario-input':
        return <ScenarioInputScreen />;
      case 'scenario-result':
        return <ScenarioResultScreen />;
      case 'lawyer-kit':
        return <LawyerKitScreen />;
      case 'compare':
        return <CompareScreen />;
      case 'assistant':
        return <AssistantScreen />;
      case 'more':
        return <MoreMenuScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'help':
        return <HelpScreen />;
      case 'terms':
        return <TermsScreen />;
      case 'document-history':
        return <DocumentHistoryScreen />;
      case 'compliance-audit':
        return <ComplianceAuditScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const showMobileNav = currentScreen !== 'welcome' && currentScreen !== 'auth';

  return (
    <div className="relative min-h-screen w-full bg-[#F7F2EC] text-[#151515] overflow-x-hidden">
      {/* Background warm ambient atmosphere */}
      <BackgroundAura />

      {/* Pure Product Interface */}
      {/* 1. Mobile & Small Screen Product View (<1024px) */}
      <div className="lg:hidden w-full max-w-md mx-auto min-h-screen flex flex-col">
        <PageTransition pageKey={currentScreen}>
          <Suspense fallback={<SuspenseFallback />}>
            {renderActiveScreen()}
          </Suspense>
        </PageTransition>

        {/* Viewport-fixed Mobile Bottom Navigation */}
        {showMobileNav && <BottomNav />}
      </div>

      {/* 2. Desktop Product View (>=1024px) */}
      <div className="hidden lg:block w-full min-h-screen">
        <Suspense fallback={<SuspenseFallback />}>
          <DesktopShell />
        </Suspense>
      </div>

      {/* Traceable Evidence Modal */}
      <EvidenceModal />

      {/* Lawyer Prep-Kit Printable Brief Modal */}
      <PdfPreviewModal />

      {/* Legal Action Graph Export Modal (SVG & High-Res PNG) */}
      <GraphExportModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
