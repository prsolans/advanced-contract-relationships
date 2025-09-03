import React from 'react';
import { ContractData } from '../types';

interface ContractDetailsProps {
  contract: ContractData;
}

const ContractDetails: React.FC<ContractDetailsProps> = ({ contract }) => {
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

  return (
    <div className="contract-details">
      <div className="contract-header">
        <div className="contract-type-badge">
          <span className={`badge ${contract.type.toLowerCase()}`}>
            {contract.type}
          </span>
        </div>
        <h1 className="contract-title">{contract.title}</h1>
        <div className={`status-indicator ${contract.status.toLowerCase()}`}>
          {contract.status}
        </div>
      </div>

      <div className="details-grid">
        <div className="detail-section">
          <h3>Parties</h3>
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
              <label>Total Value:</label>
              <span className="value-highlight">
                {formatCurrency(contract.totalValue, contract.currency)}
              </span>
            </div>
            <div className="detail-item">
              <label>Payment Terms:</label>
              <span>{contract.paymentTerms}</span>
            </div>
          </div>
        )}

        <div className="detail-section">
          <h3>Legal Terms</h3>
          <div className="detail-item">
            <label>Governing Law:</label>
            <span>{contract.governingLaw}</span>
          </div>
          <div className="detail-item">
            <label>Termination Clause:</label>
            <span>{contract.terminationClause}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>Risk & Compliance</h3>
          <div className="detail-item">
            <label>Confidentiality:</label>
            <span>{contract.confidentialityClause}</span>
          </div>
          <div className="detail-item">
            <label>Indemnification:</label>
            <span>{contract.indemnificationClause}</span>
          </div>
        </div>

        {contract.parentContractId && (
          <div className="detail-section">
            <h3>Relationship</h3>
            <div className="detail-item">
              <label>Parent Contract:</label>
              <span>{contract.parentContractId}</span>
            </div>
          </div>
        )}

        <div className="detail-section">
          <h3>Management & Operations</h3>
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
              <span>{contract.projectCode}</span>
            </div>
          )}
          {contract.riskLevel && (
            <div className="detail-item">
              <label>Risk Level:</label>
              <span className={`risk-level ${contract.riskLevel.toLowerCase()}`}>
                {contract.riskLevel}
              </span>
            </div>
          )}
        </div>

        {contract.performanceMetrics && contract.performanceMetrics.length > 0 && (
          <div className="detail-section">
            <h3>Performance Metrics</h3>
            <div className="metrics-list">
              {contract.performanceMetrics.map((metric, index) => (
                <div key={index} className="metric-item">
                  • {metric}
                </div>
              ))}
            </div>
          </div>
        )}

        {contract.deliverables && contract.deliverables.length > 0 && (
          <div className="detail-section">
            <h3>Key Deliverables</h3>
            <div className="deliverables-list">
              {contract.deliverables.map((deliverable, index) => (
                <div key={index} className="deliverable-item">
                  • {deliverable}
                </div>
              ))}
            </div>
          </div>
        )}

        {contract.complianceRequirements && contract.complianceRequirements.length > 0 && (
          <div className="detail-section">
            <h3>Compliance Requirements</h3>
            <div className="compliance-list">
              {contract.complianceRequirements.map((requirement, index) => (
                <div key={index} className="compliance-item">
                  • {requirement}
                </div>
              ))}
            </div>
          </div>
        )}

        {contract.keyMilestones && contract.keyMilestones.length > 0 && (
          <div className="detail-section">
            <h3>Key Milestones</h3>
            <div className="milestones-list">
              {contract.keyMilestones.map((milestone, index) => (
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

        {(contract.renewalNotice || contract.vendorRating || contract.approvalAuthority) && (
          <div className="detail-section">
            <h3>Additional Information</h3>
            {contract.renewalNotice && (
              <div className="detail-item">
                <label>Renewal Notice:</label>
                <span>{contract.renewalNotice}</span>
              </div>
            )}
            {contract.vendorRating && (
              <div className="detail-item">
                <label>Vendor Rating:</label>
                <span>{contract.vendorRating}</span>
              </div>
            )}
            {contract.approvalAuthority && (
              <div className="detail-item">
                <label>Approval Authority:</label>
                <span>{contract.approvalAuthority}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractDetails;