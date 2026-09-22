import React from 'react';
import { useApp } from '../../context/AppContext';
import { AppHeader } from '../common/AppHeader';
import { DocumentHistoryView } from '../history/DocumentHistoryView';

export const DocumentHistoryScreen: React.FC = () => {
  const { activeDocument, navigateTo } = useApp();

  return (
    <div className="min-h-screen pb-28 w-full max-w-5xl mx-auto px-4 sm:px-6">
      <AppHeader title={`${activeDocument.name} · History`} />
      <div className="pt-3">
        <DocumentHistoryView onBackToOverview={() => navigateTo('legal-graph')} />
      </div>
    </div>
  );
};
