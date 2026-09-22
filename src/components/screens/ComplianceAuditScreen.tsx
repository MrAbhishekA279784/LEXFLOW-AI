import React from 'react';
import { useApp } from '../../context/AppContext';
import { AppHeader } from '../common/AppHeader';
import { ComplianceAuditWorkspace } from '../complianceAudit/ComplianceAuditWorkspace';

export const ComplianceAuditScreen: React.FC = () => {
  const { activeDocument } = useApp();

  return (
    <div className="min-h-screen pb-28 w-full max-w-5xl mx-auto px-4 sm:px-6">
      {/* Mobile Top Header */}
      <div className="lg:hidden">
        <AppHeader title="Compliance Audit" />
      </div>

      <ComplianceAuditWorkspace />
    </div>
  );
};
