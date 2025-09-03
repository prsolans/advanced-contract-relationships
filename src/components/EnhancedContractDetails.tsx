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
      {/* Family Context */}
      {family && (
        <div className="family-context-section">
          <h3>Family Context</h3>
          <div className="context-summary">
            <div className="context-item">
              <label>Family ID:</label>
              <span>{family.id}</span>
            </div>
            <div className="context-item">
              <label>Relationship Type:</label>
              <span>{family.businessContext.relationshipType}</span>
            </div>
            <div className="context-item">
              <label>Family Total Value:</label>
              <span>{formatCurrency(family.familyMetrics.totalFamilyValue)}</span>
            </div>
            <div className="context-item">
              <Tooltip content="Risk level is calculated based on: (1) Total family value - >$2M = High, >$500K = Medium, <$500K = Low; (2) Government contract status - Critical if any contract flagged as government; (3) Compliance requirements - Critical if >2 different types. Compliance requirements are shown in the 'Compliance Requirements' badges below when present (e.g., Government Contract, GDPR, SOX).">
                <div className="tooltip-trigger">
                  <label>Family Risk Level:</label>
                  <div className="help-icon">?</div>
                </div>
              </Tooltip>
              <span className={`risk-level ${family.familyMetrics.avgRiskLevel.toLowerCase()}`}>
                {family.familyMetrics.avgRiskLevel}
              </span>
            </div>
          </div>
        </div>
      )}

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
            <span className={family && contract.governingLaw === family.governanceFramework.governingLaw ? 'inherited' : 'overridden'}>
              {contract.inheritedTerms.governingLaw}
              {family && contract.governingLaw === family.governanceFramework.governingLaw ? 
                <span className="inheritance-indicator"> (inherited from MSA)</span> :
                <span className="inheritance-indicator"> (override)</span>}
            </span>
          </div>
          <div className="inheritance-item">
            <label>Jurisdiction:</label>
            <span className={family && contract.jurisdiction === family.governanceFramework.jurisdiction ? 'inherited' : 'overridden'}>
              {contract.inheritedTerms.jurisdiction}
              {family && contract.jurisdiction === family.governanceFramework.jurisdiction ? 
                <span className="inheritance-indicator"> (inherited from MSA)</span> :
                <span className="inheritance-indicator"> (override)</span>}
            </span>
          </div>
          <div className="inheritance-item">
            <label>Payment Terms:</label>
            <span className={family && contract.paymentTerms === family.governanceFramework.defaultPaymentTerms ? 'inherited' : 'overridden'}>
              {contract.inheritedTerms.paymentTerms}
              {family && contract.paymentTerms === family.governanceFramework.defaultPaymentTerms ? 
                <span className="inheritance-indicator"> (inherited from MSA)</span> :
                <span className="inheritance-indicator"> (override)</span>}
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