import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DocumentItem, DocumentVersion, VersionChangeItem } from '../types';
import { LegalGraph } from '../backend/types/backendTypes';
import { INITIAL_DOCUMENTS } from '../data/initialData';
import { INITIAL_DOCUMENT_VERSIONS } from '../data/documentVersionsData';
import { getAuthToken } from '../utils/apiAuth';

export interface DocumentContextType {
  documents: DocumentItem[];
  activeDocument: DocumentItem;
  setActiveDocument: (doc: DocumentItem) => void;
  addDocument: (file: { name: string; size: string; type: 'pdf' | 'docx'; rawFile?: File }) => Promise<void>;
  removeDocument: (id: string) => void;
  activeDocTab: 'Overview' | 'Graph' | 'Clauses' | 'Risks' | 'Audit' | 'History';
  setActiveDocTab: (tab: 'Overview' | 'Graph' | 'Clauses' | 'Risks' | 'Audit' | 'History') => void;
  currentGraph: LegalGraph | null;
  isGraphLoading: boolean;
  graphError: string | null;
  fetchDocumentGraph: (docId?: string) => Promise<LegalGraph | null>;
  regenerateDocumentGraph: (docId?: string) => Promise<LegalGraph | null>;
  documentVersions: DocumentVersion[];
  revertToVersion: (versionId: string, note?: string) => Promise<boolean>;
  createVersionRevision: (revision: {
    title: string;
    summary: string;
    changeType: 'clause_amendment' | 'counter_offer' | 'signed_addendum' | 'ai_redline';
    changes: VersionChangeItem[];
  }) => Promise<DocumentVersion>;
  fetchDocumentVersions: (docId: string) => Promise<DocumentVersion[]>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [activeDocument, setActiveDocument] = useState<DocumentItem>(INITIAL_DOCUMENTS[0]);
  const [activeDocTab, setActiveDocTab] = useState<'Overview' | 'Graph' | 'Clauses' | 'Risks' | 'Audit' | 'History'>('Graph');
  const [versionsMap, setVersionsMap] = useState<Record<string, DocumentVersion[]>>(INITIAL_DOCUMENT_VERSIONS);
  const [currentGraph, setCurrentGraph] = useState<LegalGraph | null>(null);
  const [isGraphLoading, setIsGraphLoading] = useState<boolean>(false);
  const [graphError, setGraphError] = useState<string | null>(null);

  const fetchDocumentGraph = async (docId?: string): Promise<LegalGraph | null> => {
    const targetId = docId || activeDocument?.id || 'doc-rental';
    setIsGraphLoading(true);
    setGraphError(null);
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/v1/documents/${targetId}/graph`, {
        headers: {
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || errJson.message || `Failed to fetch legal graph (${res.status})`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setCurrentGraph(json.data);
        return json.data;
      }
      return null;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load legal action graph';
      setGraphError(msg);
      return null;
    } finally {
      setIsGraphLoading(false);
    }
  };

  const regenerateDocumentGraph = async (docId?: string): Promise<LegalGraph | null> => {
    const targetId = docId || activeDocument?.id || 'doc-rental';
    setIsGraphLoading(true);
    setGraphError(null);
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/v1/documents/${targetId}/graph/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || errJson.message || `Failed to regenerate legal graph (${res.status})`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setCurrentGraph(json.data);
        return json.data;
      }
      return null;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to regenerate legal action graph';
      setGraphError(msg);
      return null;
    } finally {
      setIsGraphLoading(false);
    }
  };

  useEffect(() => {
    if (activeDocument?.id) {
      fetchDocumentGraph(activeDocument.id);
    }
  }, [activeDocument?.id]);

  const addDocument = async (fileInput: { name: string; size: string; type: 'pdf' | 'docx'; rawFile?: File }) => {
    try {
      const token = await getAuthToken();
      let res: Response;

      if (fileInput.rawFile) {
        const formData = new FormData();
        formData.append('file', fileInput.rawFile);
        res = await fetch('/api/v1/documents', {
          method: 'POST',
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: formData
        });
      } else {
        res = await fetch('/api/v1/documents', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({
            name: fileInput.name,
            type: fileInput.type,
            size: fileInput.size,
          }),
        });
      }

      if (res.ok) {
        const json = await res.json();
        const created = json.data;
        const newDoc: DocumentItem = {
          id: created.id,
          name: created.name,
          type: created.type,
          size: created.size,
          uploadedAt: 'Just now',
          status: 'analyzed',
          color: 'blue',
          riskCount: created.riskCount || 0,
          clauseCount: created.clauseCount || 0,
          summary: created.summary || 'Uploaded legal agreement.'
        };
        setDocuments(prev => [newDoc, ...prev]);
        setActiveDocument(newDoc);
        if (created.id) {
          fetchDocumentGraph(created.id);
        }
      } else {
        const localDoc: DocumentItem = {
          id: `doc-${Date.now()}`,
          name: fileInput.name,
          type: fileInput.type,
          size: fileInput.size,
          uploadedAt: 'Just now',
          status: 'analyzed',
          color: 'blue',
          riskCount: 3,
          clauseCount: 8,
          summary: 'Uploaded legal agreement.'
        };
        setDocuments(prev => [localDoc, ...prev]);
        setActiveDocument(localDoc);
      }
    } catch {
      const localDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        name: fileInput.name,
        type: fileInput.type,
        size: fileInput.size,
        uploadedAt: 'Just now',
        status: 'analyzed',
        color: 'blue',
        riskCount: 3,
        clauseCount: 8,
        summary: 'Uploaded legal agreement.'
      };
      setDocuments(prev => [localDoc, ...prev]);
      setActiveDocument(localDoc);
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (activeDocument.id === id && documents.length > 1) {
      setActiveDocument(documents.find(d => d.id !== id) || documents[0]);
    }
  };

  const documentVersions = versionsMap[activeDocument?.id] || [];

  const fetchDocumentVersions = async (docId: string): Promise<DocumentVersion[]> => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/v1/documents/${docId}/versions`, {
        headers: {
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setVersionsMap(prev => ({
            ...prev,
            [docId]: json.data
          }));
          return json.data;
        }
      }
      return versionsMap[docId] || [];
    } catch {
      return versionsMap[docId] || [];
    }
  };

  const revertToVersion = async (versionId: string, note?: string): Promise<boolean> => {
    const docId = activeDocument?.id;
    if (!docId) return false;

    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/v1/documents/${docId}/revert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ versionId, note })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.version) {
          await fetchDocumentVersions(docId);
          await fetchDocumentGraph(docId);
          return true;
        }
      }
    } catch {
      // Local fallback
    }

    const versions = versionsMap[docId] || [];
    const target = versions.find(v => v.id === versionId);
    if (!target) return false;

    const currentRevCount = versions.length + 1;
    const newVersion: DocumentVersion = {
      id: `ver-${docId}-v${currentRevCount}`,
      documentId: docId,
      versionNumber: `v${currentRevCount}.0`,
      title: `Reverted to ${target.versionNumber}`,
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
      author: {
        name: 'Ahamed Khan',
        role: 'Counsel'
      },
      summary: note ? `Reverted: ${note}` : `Reverted workspace state back to snapshot ${target.versionNumber}`,
      changeType: 'reverted',
      changeCount: target.changeCount,
      riskCount: target.riskCount,
      clauseCount: target.clauseCount,
      changes: [
        {
          id: `chg-${Date.now()}`,
          clauseSection: 'ALL',
          clauseTitle: 'Full Agreement Rollback',
          changeType: 'modified',
          riskImpact: 'neutral',
          explanation: `Rolled back entire document structure to version ${target.versionNumber}`
        }
      ],
      snapshotClauses: target.snapshotClauses,
      isCurrent: true,
      revertedFromVersion: target.versionNumber
    };

    setVersionsMap(prev => ({
      ...prev,
      [docId]: [newVersion, ...versions.map(v => ({ ...v, isCurrent: false }))]
    }));

    return true;
  };

  const createVersionRevision = async (revision: {
    title: string;
    summary: string;
    changeType: 'clause_amendment' | 'counter_offer' | 'signed_addendum' | 'ai_redline';
    changes: VersionChangeItem[];
  }): Promise<DocumentVersion> => {
    const docId = activeDocument?.id || 'doc-rental';
    const versions = versionsMap[docId] || [];

    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/v1/documents/${docId}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(revision)
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          await fetchDocumentVersions(docId);
          await fetchDocumentGraph(docId);
          return json.data;
        }
      }
    } catch {
      // Local fallback
    }

    const currentRevCount = versions.length + 1;
    const newVersion: DocumentVersion = {
      id: `ver-${docId}-v${currentRevCount}`,
      documentId: docId,
      versionNumber: `v${currentRevCount}.0`,
      title: revision.title,
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
      author: {
        name: 'Ahamed Khan',
        role: revision.changeType === 'ai_redline' ? 'AI Assistant' : 'Counsel'
      },
      summary: revision.summary,
      changeType: revision.changeType,
      changeCount: revision.changes.length,
      riskCount: activeDocument.riskCount || 0,
      clauseCount: activeDocument.clauseCount || 8,
      changes: revision.changes,
      isCurrent: true
    };

    setVersionsMap(prev => ({
      ...prev,
      [docId]: [newVersion, ...versions.map(v => ({ ...v, isCurrent: false }))]
    }));

    return newVersion;
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        activeDocument,
        setActiveDocument,
        addDocument,
        removeDocument,
        activeDocTab,
        setActiveDocTab,
        currentGraph,
        isGraphLoading,
        graphError,
        fetchDocumentGraph,
        regenerateDocumentGraph,
        documentVersions,
        revertToVersion,
        createVersionRevision,
        fetchDocumentVersions
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
};
