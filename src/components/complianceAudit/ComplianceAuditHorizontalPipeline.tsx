import React from 'react';
import { AuditPipeline, AuditPipelineProps } from './AuditPipeline';

export interface ComplianceAuditHorizontalPipelineProps extends AuditPipelineProps {
  // Compatible with previous prop names
}

export const ComplianceAuditHorizontalPipeline: React.FC<ComplianceAuditHorizontalPipelineProps> = (props) => {
  return <AuditPipeline {...props} />;
};

export { AuditPipeline };
export default ComplianceAuditHorizontalPipeline;
