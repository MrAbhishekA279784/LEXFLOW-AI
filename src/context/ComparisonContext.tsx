import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ComparisonDiff } from '../types';
import { getAuthToken } from '../utils/apiAuth';

export interface ComparisonContextType {
  comparisonResults: ComparisonDiff[];
  isComparing: boolean;
  runComparison: (docAId: string, docBId: string) => Promise<ComparisonDiff[]>;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [comparisonResults, setComparisonResults] = useState<ComparisonDiff[]>([]);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  const runComparison = async (docAId: string, docBId: string): Promise<ComparisonDiff[]> => {
    setIsComparing(true);
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/v1/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ documentAId: docAId, documentBId: docBId })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setComparisonResults(json.data);
          setIsComparing(false);
          return json.data;
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsComparing(false);
    }

    return comparisonResults;
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparisonResults,
        isComparing,
        runComparison
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparisonContext = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparisonContext must be used within a ComparisonProvider');
  }
  return context;
};
