import React from 'react';
import { EnhancedContractData, ContractFamily } from '../types';
import Tooltip from './Tooltip';

interface EnhancedContractDetailsProps {
  contract: EnhancedContractData;
  family?: ContractFamily;
}

const EnhancedContractDetails: React.FC<EnhancedContractDetailsProps> = ({ contract, family }) => {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isWithin90Days = (dateString: string) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 90;
  };

  const getRiskExplanation = (contractType: string) => {
    const baseExplanation = "Risk levels are calculated using multiple weighted factors: ";
    
    switch (contractType.toLowerCase()) {
      case 'msa':
        return baseExplanation + "For Master Service Agreements (MSA): " +
               "• CONTRACT VALUE: >$5M = Critical, >$2M = High, >$500K = Medium, <$500K = Low " +
               "• STRATEGIC IMPACT: Foundation for all SOWs - inherent Medium+ risk " +
               "• GOVERNANCE SCOPE: Broad legal framework affecting multiple projects " +
               "• COMPLIANCE: Government contracts automatically = Critical " +
               "• VENDOR RELATIONSHIP: Strategic partnerships weighted higher than standard vendors " +
               "• TERMINATION IMPACT: Affects entire contract family";
               
      case 'sow':
        return baseExplanation + "For Statements of Work (SOW): " +
               "• CONTRACT VALUE: >$2M = High, >$1M = Medium, >$250K = Low, <$250K = Low " +
               "• DELIVERY COMPLEXITY: Multiple milestones/deliverables increase risk " +
               "• PERFORMANCE METRICS: SLAs and KPIs with penalties = Higher risk " +
               "• PROJECT DURATION: >12 months = Higher risk due to scope creep potential " +
               "• VENDOR PERFORMANCE: Historical ratings from 1-5 scale affect scoring " +
               "• BUSINESS CRITICALITY: Core business functions = Higher risk";
               
      case 'changeorder':
        return baseExplanation + "For Change Orders: " +
               "• BUDGET IMPACT: >50% of original SOW value = High, >25% = Medium " +
               "• SCOPE CHANGE: Major deliverable changes = Higher risk " +
               "• TIMELINE IMPACT: Schedule extensions >30 days = Medium+ risk " +
               "• CUMULATIVE EFFECT: Multiple COs on same SOW compound risk " +
               "• APPROVAL LEVEL: Executive approval required = Higher inherent risk " +
               "• VENDOR RELATIONSHIP: Performance issues driving changes = Higher risk";
               
      default:
        return baseExplanation + "For this document type: " +
               "• CONTRACT VALUE: Financial thresholds based on document type and industry standards " +
               "• COMPLIANCE REQUIREMENTS: Regulatory obligations increase risk scoring " +
               "• BUSINESS IMPACT: Strategic importance to operations and revenue " +
               "• VENDOR PERFORMANCE: Historical delivery and relationship quality " +
               "• OPERATIONAL COMPLEXITY: Integration requirements and dependencies " +
               "• RENEWAL/TERMINATION: Difficulty of replacement or transition";
    }
  };

  const getDocumentLevelColor = (level: string) => {
    const colors = {
      'MSA': '#8b5cf6',
      'SOW': '#3b82f6',
      'ChangeOrder': '#f59e0b',
      'Amendment': '#10b981',
      'Other': '#6b7280',
    };
    return colors[level as keyof typeof colors] || '#6b7280';
  };

  return (
    <div className="enhanced-contract-details">
      <div className="contract-header">
        <div className="header-badges">
          <div className="contract-type-badge">
            <span className={`badge ${contract.type.toLowerCase()}`}>
              {contract.type}
            </span>
          </div>
        </div>
        
        <div className="title-with-link">
          <h1 className="contract-title">{contract.title}</h1>
          <a 
            href={`https://apps-d.docusign.com/send/navigator/agreements/${contract.id}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-document-link"
            title="View in DocuSign"
          >
            View
          </a>
          <div className={`status-indicator ${contract.status.toLowerCase()}`}>
            {contract.status}
          </div>
        </div>
      </div>

      {/* Inheritance Information */}
      <div className="inheritance-section">
        <h3>Governance & Inheritance</h3>
        <div className="inheritance-grid">
          <div className="inheritance-item">
            <label>Governing Law:</label>
            <span className={
              (!contract.parentContractId) ? 'establishes' : 
              (family && contract.governingLaw === family.governanceFramework.governingLaw ? 'inherited' : 'overridden')
            }>
              {contract.inheritedTerms.governingLaw}
              {(!contract.parentContractId) ? 
                <span className="inheritance-indicator"> (establishes framework)</span> :
                (family && contract.governingLaw === family.governanceFramework.governingLaw ? 
                  <span className="inheritance-indicator"> (inherited from parent)</span> :
                  <span className="inheritance-indicator"> (override)</span>)}
            </span>
          </div>
          <div className="inheritance-item">
            <label>Jurisdiction:</label>
            <span className={
              (!contract.parentContractId) ? 'establishes' : 
              (family && contract.jurisdiction === family.governanceFramework.jurisdiction ? 'inherited' : 'overridden')
            }>
              {contract.inheritedTerms.jurisdiction}
              {(!contract.parentContractId) ? 
                <span className="inheritance-indicator"> (establishes framework)</span> :
                (family && contract.jurisdiction === family.governanceFramework.jurisdiction ? 
                  <span className="inheritance-indicator"> (inherited from parent)</span> :
                  <span className="inheritance-indicator"> (override)</span>)}
            </span>
          </div>
          <div className="inheritance-item">
            <label>Payment Terms:</label>
            <span className={
              (!contract.parentContractId) ? 'establishes' : 
              (family && contract.paymentTerms === family.governanceFramework.defaultPaymentTerms ? 'inherited' : 'overridden')
            }>
              {contract.inheritedTerms.paymentTerms}
              {(!contract.parentContractId) ? 
                <span className="inheritance-indicator"> (establishes framework)</span> :
                (family && contract.paymentTerms === family.governanceFramework.defaultPaymentTerms ? 
                  <span className="inheritance-indicator"> (inherited from parent)</span> :
                  <span className="inheritance-indicator"> (override)</span>)}
            </span>
          </div>
        </div>
      </div>

      {/* Document-Specific Information */}
      <div className="details-grid">
        <div className="detail-section">
          <h3>Contract Parties</h3>
          <div className="detail-item">
            <label>First Party:</label>
            <span>{contract.firstParty}</span>
          </div>
          <div className="detail-item">
            <label>Third Party:</label>
            <span>{contract.thirdParty}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>Contract Dates</h3>
          <div className="detail-item">
            <label>Effective Date:</label>
            <span>{formatDate(contract.effectiveDate)}</span>
          </div>
          {contract.expirationDate && (
            <div className="detail-item">
              <label>Expiration Date:</label>
              <span>{formatDate(contract.expirationDate)}</span>
            </div>
          )}
        </div>

        {contract.totalValue && (
          <div className="detail-section">
            <h3>Financial Terms</h3>
            <div className="detail-item">
              <label>Contract Value:</label>
              <span className="value-highlight">
                {formatCurrency(contract.totalValue, contract.currency)}
              </span>
            </div>
          </div>
        )}

        {/* Project Execution (SOW/Change Order specific) */}
        {contract.projectExecution && (
          <>
            {contract.projectExecution.deliverables && contract.projectExecution.deliverables.length > 0 && (
              <div className="detail-section">
                <h3>Project Deliverables</h3>
                <div className="deliverables-list">
                  {contract.projectExecution.deliverables.map((deliverable, index) => (
                    <div key={index} className="deliverable-item">
                      • {deliverable}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contract.projectExecution.milestones && contract.projectExecution.milestones.length > 0 && (
              <div className="detail-section">
                <h3>Project Milestones</h3>
                <div className="milestones-list">
                  {contract.projectExecution.milestones.map((milestone, index) => (
                    <div key={index} className={`milestone-item ${milestone.completed ? 'completed' : 'pending'}`}>
                      <div className="milestone-date">{formatDate(milestone.date)}</div>
                      <div className="milestone-description">{milestone.description}</div>
                      <div className={`milestone-status ${milestone.completed ? 'completed' : 'pending'}`}>
                        {milestone.completed ? '✓ Completed' : '⏳ Pending'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contract.projectExecution.performanceMetrics && contract.projectExecution.performanceMetrics.length > 0 && (
              <div className="detail-section">
                <h3>Performance Metrics</h3>
                <div className="metrics-list">
                  {contract.projectExecution.performanceMetrics.map((metric, index) => (
                    <div key={index} className="metric-item">
                      • {metric}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contract.projectExecution.specificCompliance && contract.projectExecution.specificCompliance.length > 0 && (
              <div className="detail-section">
                <h3>Specific Compliance Requirements</h3>
                <div className="compliance-list">
                  {contract.projectExecution.specificCompliance.map((requirement, index) => (
                    <div key={index} className="compliance-item">
                      • {requirement}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Contract Management */}
        <div className="detail-section">
          <h3>Contract Management</h3>
          {contract.contractManager && (
            <div className="detail-item">
              <label>Contract Manager:</label>
              <span>{contract.contractManager}</span>
            </div>
          )}
          {contract.businessUnit && (
            <div className="detail-item">
              <label>Business Unit:</label>
              <span>{contract.businessUnit}</span>
            </div>
          )}
          {contract.projectCode && (
            <div className="detail-item">
              <label>Project Code:</label>
              <span className="code-highlight">{contract.projectCode}</span>
            </div>
          )}
        </div>

        {/* Risk Assessment */}
        <div className="detail-section">
          <h3>Risk Assessment</h3>
          {contract.riskLevel && (
            <div className="detail-item">
              <Tooltip content={getRiskExplanation(contract.type)}>
                <div className="tooltip-trigger">
                  <label>Risk Level:</label>
                  <div className="help-icon">?</div>
                </div>
              </Tooltip>
              <span className={`risk-badge ${contract.riskLevel.toLowerCase()}`}>
                {contract.riskLevel}
              </span>
            </div>
          )}
          {contract.vendorRating && (
            <div className="detail-item">
              <Tooltip content="Vendor rating reflects overall performance assessment including delivery quality, timeliness, communication effectiveness, compliance adherence, and relationship management. Ratings are typically updated quarterly based on performance reviews and stakeholder feedback.">
                <div className="tooltip-trigger">
                  <label>Vendor Rating:</label>
                  <div className="help-icon">?</div>
                </div>
              </Tooltip>
              <span className="rating-highlight">{contract.vendorRating}</span>
            </div>
          )}
        </div>

        {/* Legal Terms */}
        <div className="detail-section">
          <h3>Legal Terms</h3>
          <div className="detail-item">
            <label>Termination Clause:</label>
            <span className="legal-text">{contract.terminationClause}</span>
          </div>
          <div className="detail-item">
            <label>Confidentiality:</label>
            <span className="legal-text">{contract.confidentialityClause}</span>
          </div>
          <div className="detail-item">
            <label>Indemnification:</label>
            <span className="legal-text">{contract.indemnificationClause}</span>
          </div>
        </div>

        {/* Renewal & Approval */}
        <div className="detail-section">
          <h3>Renewal & Approval</h3>
          {contract.expirationDate && (
            <div className="detail-item">
              <label>Contract Expiration:</label>
              <span className={contract.expirationDate && isWithin90Days(contract.expirationDate) ? 'expiration-warning' : ''}>
                {formatDate(contract.expirationDate)}
                {contract.expirationDate && isWithin90Days(contract.expirationDate) && (
                  <span className="urgency-indicator"> ⚠️ Expires Soon</span>
                )}
              </span>
            </div>
          )}
          {/* Check for renewal_notice_date from provisions */}
          {(contract as any).provisions?.renewal_notice_date && (
            <div className="detail-item">
              <Tooltip content="Renewal notice date indicates the deadline by which either party must provide notice of intent to renew or terminate the contract. Missing this deadline may result in automatic renewal or termination depending on contract terms.">
                <div className="tooltip-trigger">
                  <label>Renewal Notice Due:</label>
                  <div className="help-icon">?</div>
                </div>
              </Tooltip>
              <span className={(contract as any).provisions.renewal_notice_date && isWithin90Days((contract as any).provisions.renewal_notice_date) ? 'renewal-notice-urgent' : ''}>
                {formatDate((contract as any).provisions.renewal_notice_date)}
                {(contract as any).provisions.renewal_notice_date && isWithin90Days((contract as any).provisions.renewal_notice_date) && (
                  <span className="urgency-indicator"> 🔔 Action Required</span>
                )}
              </span>
            </div>
          )}
          {contract.renewalNotice && (
            <div className="detail-item">
              <label>Renewal Terms:</label>
              <span className="legal-text">{contract.renewalNotice}</span>
            </div>
          )}
          {contract.approvalAuthority && (
            <div className="detail-item">
              <label>Approval Authority:</label>
              <span>{contract.approvalAuthority}</span>
            </div>
          )}
        </div>

        {/* Compliance Requirements */}
        {contract.complianceRequirements && contract.complianceRequirements.length > 0 && (
          <div className="detail-section">
            <h3>Compliance Requirements</h3>
            <div className="compliance-list">
              {contract.complianceRequirements.map((requirement, index) => (
                <div key={index} className="compliance-badge">
                  {requirement}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contract relationships */}
        {contract.contractRelationships && (
          <div className="detail-section">
            <h3>Contract Relationships</h3>
            {contract.contractRelationships.parentContractNumber && (
              <div className="detail-item">
                <label>Parent Contract:</label>
                <span>{contract.contractRelationships.parentContractNumber}</span>
              </div>
            )}
            {contract.contractRelationships.childContractNumbers && contract.contractRelationships.childContractNumbers.length > 0 && (
              <div className="detail-item">
                <label>Child Contracts:</label>
                <span>{contract.contractRelationships.childContractNumbers.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedContractDetails;