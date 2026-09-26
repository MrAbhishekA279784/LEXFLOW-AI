import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { PageTransition } from '../common/PageTransition';
import { DesktopSidebar } from './DesktopSidebar';
import { DesktopTopBar } from './DesktopTopBar';
import { DesktopDashboard } from './DesktopDashboard';
import { DesktopRightPanel } from './DesktopRightPanel';

// All Screen Components
import { UploadScreen } from '../screens/UploadScreen';
import { AnalyzingScreen } from '../screens/AnalyzingScreen';
import { LegalGraphScreen } from '../screens/LegalGraphScreen';
import { ScenarioInputScreen } from '../screens/ScenarioInputScreen';
import { ScenarioResultScreen } from '../screens/ScenarioResultScreen';
import { LawyerKitScreen } from '../screens/LawyerKitScreen';
import { CompareScreen } from '../screens/CompareScreen';
import { AssistantScreen } from '../screens/AssistantScreen';
import { MoreMenuScreen } from '../screens/MoreMenuScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { DocumentHistoryScreen } from '../screens/DocumentHistoryScreen';
import { ComplianceAuditWorkspace } from '../complianceAudit/ComplianceAuditWorkspace';
import { SettingsScreen } from '../screens/SettingsScreen';
import { HelpScreen } from '../screens/HelpScreen';
import { TermsScreen } from '../screens/TermsScreen';

export const DesktopShell: React.FC = () => {
  const { currentScreen } = useApp();

  // For welcome or auth, render in full centered card
  if (currentScreen === 'welcome' || currentScreen === 'auth') {
    return (
      <div className="w-full max-w-md mx-auto py-10 min-h-screen flex items-center justify-center">
        <PageTransition pageKey={currentScreen}>
          {currentScreen === 'welcome' ? <WelcomeScreen /> : <AuthScreen />}
        </PageTransition>
      </div>
    );
  }

  const renderScreenContent = () => {
    switch (currentScreen) {
      case 'home':
        return <DesktopDashboard />;
      case 'upload':
        return (
          <div className="w-full max-w-4xl mx-auto py-2">
            <UploadScreen />
          </div>
        );
      case 'analyzing':
        return (
          <div className="w-full max-w-3xl mx-auto py-6">
            <AnalyzingScreen />
          </div>
        );
      case 'legal-graph':
        return (
          <div className="w-full max-w-5xl mx-auto">
            <LegalGraphScreen />
          </div>
        );
      case 'scenario-input':
        return (
          <div className="w-full max-w-4xl mx-auto py-4">
            <ScenarioInputScreen />
          </div>
        );
      case 'scenario-result':
        return (
          <div className="w-full max-w-5xl mx-auto py-4">
            <ScenarioResultScreen />
          </div>
        );
      case 'lawyer-kit':
        return (
          <div className="w-full max-w-5xl mx-auto py-4">
            <LawyerKitScreen />
          </div>
        );
      case 'compare':
        return (
          <div className="w-full max-w-5xl mx-auto py-4">
            <CompareScreen />
          </div>
        );
      case 'assistant':
        return (
          <div className="w-full max-w-5xl mx-auto py-4">
            <AssistantScreen />
          </div>
        );
      case 'more':
        return (
          <div className="w-full max-w-3xl mx-auto py-4">
            <MoreMenuScreen />
          </div>
        );
      case 'settings':
        return (
          <div className="w-full max-w-4xl mx-auto py-2">
            <SettingsScreen />
          </div>
        );
      case 'help':
        return (
          <div className="w-full max-w-4xl mx-auto py-2">
            <HelpScreen />
          </div>
        );
      case 'terms':
        return (
          <div className="w-full max-w-4xl mx-auto py-2">
            <TermsScreen />
          </div>
        );
      case 'document-history':
        return (
          <div className="w-full max-w-5xl mx-auto py-2">
            <DocumentHistoryScreen />
          </div>
        );
      case 'compliance-audit':
        return (
          <div className="w-full max-w-5xl mx-auto py-1">
            <ComplianceAuditWorkspace />
          </div>
        );
      default:
        return <DesktopDashboard />;
    }
  };

  const showRightPanel = currentScreen === 'home';

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 py-6 min-h-screen flex items-start gap-6 select-none">
      {/* 1. Left Persistent Glass Sidebar */}
      <DesktopSidebar />

      {/* 2. Main Center Workspace + Optional Utility Column */}
      <div className="flex-1 flex flex-col min-w-0 space-y-5">
        {/* Top Search & Command Bar */}
        <DesktopTopBar />

        {/* Workspace Layout */}
        <div className="flex items-start gap-5 min-w-0">
          {/* Center Main Dynamic Workspace Area with Page Transition */}
          <div className="flex-1 min-w-0">
            <PageTransition pageKey={currentScreen}>
              {renderScreenContent()}
            </PageTransition>
          </div>

          {/* Right Utility Column on Home Dashboard */}
          {showRightPanel && <DesktopRightPanel />}
        </div>
      </div>
    </div>
  );
};
