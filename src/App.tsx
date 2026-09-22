import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BackgroundAura } from './components/common/BackgroundAura';
import { EvidenceModal } from './components/common/EvidenceModal';
import { PdfPreviewModal } from './components/common/PdfPreviewModal';
import { GraphExportModal } from './components/common/GraphExportModal';
import { PageTransition } from './components/common/PageTransition';
import { DesktopShell } from './components/desktop/DesktopShell';
import { BottomNav } from './components/common/BottomNav';
import { useHapticFeedback } from './hooks/useHapticFeedback';

// Mobile Screen Views
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { UploadScreen } from './components/screens/UploadScreen';
import { AnalyzingScreen } from './components/screens/AnalyzingScreen';
import { LegalGraphScreen } from './components/screens/LegalGraphScreen';
import { ScenarioInputScreen } from './components/screens/ScenarioInputScreen';
import { ScenarioResultScreen } from './components/screens/ScenarioResultScreen';
import { LawyerKitScreen } from './components/screens/LawyerKitScreen';
import { CompareScreen } from './components/screens/CompareScreen';
import { AssistantScreen } from './components/screens/AssistantScreen';
import { MoreMenuScreen } from './components/screens/MoreMenuScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { HelpScreen } from './components/screens/HelpScreen';
import { TermsScreen } from './components/screens/TermsScreen';
import { DocumentHistoryScreen } from './components/screens/DocumentHistoryScreen';
import { ComplianceAuditScreen } from './components/screens/ComplianceAuditScreen';

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
          {renderActiveScreen()}
        </PageTransition>

        {/* Viewport-fixed Mobile Bottom Navigation */}
        {showMobileNav && <BottomNav />}
      </div>

      {/* 2. Desktop Product View (>=1024px) */}
      <div className="hidden lg:block w-full min-h-screen">
        <DesktopShell />
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
