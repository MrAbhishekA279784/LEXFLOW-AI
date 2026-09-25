import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ComplianceAuditRecord } from '../types/complianceAuditTypes';
import { INITIAL_COMPLIANCE_AUDIT } from '../backend/data/complianceAuditSeedData';
import { getAuthToken } from '../utils/apiAuth';

export interface ComplianceContextType {
  activeComplianceAudit: ComplianceAuditRecord | null;
  complianceAudits: ComplianceAuditRecord[];
  isAuditRunning: boolean;
  startComplianceAudit: (docId?: string) => Promise<ComplianceAuditRecord | null>;
  fetchComplianceAudits: (docId?: string) => Promise<ComplianceAuditRecord[]>;
  selectComplianceAudit: (audit: ComplianceAuditRecord) => void;
}

const ComplianceContext = createContext<ComplianceContextType | undefined>(undefined);

export const ComplianceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeComplianceAudit, setActiveComplianceAudit] = useState<ComplianceAuditRecord | null>(INITIAL_COMPLIANCE_AUDIT);
  const [complianceAudits, setComplianceAudits] = useState<ComplianceAuditRecord[]>([INITIAL_COMPLIANCE_AUDIT]);
  const [isAuditRunning, setIsAuditRunning] = useState<boolean>(false);

  const selectComplianceAudit = (audit: ComplianceAuditRecord) => {
    setActiveComplianceAudit(audit);
  };

  const fetchComplianceAudits = async (docId?: string): Promise<ComplianceAuditRecord[]> => {
    const targetId = docId || 'doc-rental';
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/v1/compliance-audit/${targetId}`, {
        headers: {
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setComplianceAudits(json.data);
          setActiveComplianceAudit(json.data[0]);
          return json.data;
        }
      }
      return complianceAudits;
    } catch {
      return complianceAudits;
    }
  };

  const startComplianceAudit = async (docId?: string): Promise<ComplianceAuditRecord | null> => {
    const targetId = docId || 'doc-rental';
    setIsAuditRunning(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/v1/compliance-audit/${targetId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const newAudit = json.data as ComplianceAuditRecord;
          setComplianceAudits(prev => [newAudit, ...prev.filter(a => a.id !== newAudit.id)]);
          setActiveComplianceAudit(newAudit);
          return newAudit;
        }
      }
    } catch {
      // Local fallback
    } finally {
      setIsAuditRunning(false);
    }

    return activeComplianceAudit;
  };

  return (
    <ComplianceContext.Provider
      value={{
        activeComplianceAudit,
        complianceAudits,
        isAuditRunning,
        startComplianceAudit,
        fetchComplianceAudits,
        selectComplianceAudit
      }}
    >
      {children}
    </ComplianceContext.Provider>
  );
};

export const useComplianceContext = () => {
  const context = useContext(ComplianceContext);
  if (!context) {
    throw new Error('useComplianceContext must be used within a ComplianceProvider');
  }
  return context;
};
