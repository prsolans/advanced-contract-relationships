import React, { useState, useEffect } from 'react';
import { ContractFamily } from '../types';
import Tooltip from './Tooltip';

interface FamilyDashboardProps {
  family: ContractFamily;
}

const FamilyDashboard: React.FC<FamilyDashboardProps> = ({ family }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRiskColor = (riskLevel: string) => {
    const colors = {
      'Low': '#10b981',
      'Medium': '#f59e0b', 
      'High': '#ef4444',
      'Critical': '#dc2626',
    };
    return colors[riskLevel as keyof typeof colors] || '#6b7280';
  };

  const getRelationshipColor = (type: string) => {
    const colors = {
      'Strategic Partnership': '#8b5cf6',
      'Service Provider': '#3b82f6',
      'Vendor': '#6b7280',
      'Government Contract': '#dc2626',
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  };

  return (
    <div className="family-dashboard">
      {/* Sticky Header */}
      <div className={`sticky-header ${isScrolled ? 'visible' : ''}`}>
        <div className="sticky-content">
          <div className="sticky-left">
            <h1 className="sticky-family-title">{family.id} Contract Family</h1>
            <div className="sticky-parties">
              <span className="sticky-party">{family.businessContext.parties[0]?.name_in_agreement}</span>
              <span className="sticky-separator">↔</span>
              <span className="sticky-party">{family.businessContext.parties[1]?.name_in_agreement}</span>
            </div>
          </div>
          <div className="sticky-right">
            <div className="sticky-relationship-badge" style={{ backgroundColor: getRelationshipColor(family.businessContext.relationshipType) }}>
              {family.businessContext.relationshipType}
            </div>
          </div>
        </div>
      </div>

      <div className="family-header">
        <div className="header-main-row">
          <div className="family-title-section">
            <h1 className="family-title">{family.id} Contract Family</h1>
            <div className="relationship-badge" style={{ backgroundColor: getRelationshipColor(family.businessContext.relationshipType) }}>
              {family.businessContext.relationshipType}
            </div>
            
            <div className="family-parties">
              <div className="party-info">
                <span className="party-label">First Party:</span>
                <span className="party-name">{family.businessContext.parties[0]?.name_in_agreement}</span>
              </div>
              <div className="party-separator">↔</div>
              <div className="party-info">
                <span className="party-label">Third Party:</span>
                <span className="party-name">{family.businessContext.parties[1]?.name_in_agreement}</span>
              </div>
            </div>
          </div>

          <div className="header-governance-context">
            <div className="governance-section compact">
              <h3>Governance Framework</h3>
              <div className="governance-grid">
                <div className="governance-item">
                  <label>Governing Law:</label>
                  <span>{family.governanceFramework.governingLaw}</span>
                </div>
                <div className="governance-item">
                  <label>Jurisdiction:</label>
                  <span>{family.governanceFramework.jurisdiction}</span>
                </div>
                <div className="governance-item">
                  <label>Payment Terms:</label>
                  <span>{family.governanceFramework.defaultPaymentTerms}</span>
                </div>
                {family.governanceFramework.terminationRights && (
                  <div className="governance-item">
                    <label>Termination:</label>
                    <span>{family.governanceFramework.terminationRights}</span>
                  </div>
                )}
              </div>

              {family.governanceFramework.complianceFlags.length > 0 && (
                <div className="compliance-section">
                  <h4>Compliance Requirements</h4>
                  <div className="compliance-badges">
                    {family.governanceFramework.complianceFlags.map((flag, index) => (
                      <span key={index} className="compliance-badge">
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="business-context compact">
              <h3>Business Context</h3>
              <div className="context-grid">
                {family.businessContext.businessUnit && (
                  <div className="context-item">
                    <label>Business Unit:</label>
                    <span>{family.businessContext.businessUnit}</span>
                  </div>
                )}
                {family.businessContext.contractManager && (
                  <div className="context-item">
                    <label>Contract Manager:</label>
                    <span>{family.businessContext.contractManager}</span>
                  </div>
                )}
                <div className="context-item">
                  <label>Industry Category:</label>
                  <span>{family.businessContext.industryCategory}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="family-metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-value">{formatCurrency(family.familyMetrics.totalFamilyValue)}</div>
            <div className="metric-label">Total Family Value</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📋</div>
          <div className="metric-content">
            <div className="metric-value">{family.familyMetrics.totalContracts}</div>
            <div className="metric-label">Total Contracts</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🔄</div>
          <div className="metric-content">
            <div className="metric-value">{family.familyMetrics.activeSowCount}</div>
            <div className="metric-label">Active SOWs</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📝</div>
          <div className="metric-content">
            <div className="metric-value">{family.familyMetrics.totalChangeOrders}</div>
            <div className="metric-label">Change Orders</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <div className="metric-value risk-level" style={{ color: getRiskColor(family.familyMetrics.avgRiskLevel) }}>
              {family.familyMetrics.avgRiskLevel}
            </div>
            <Tooltip content="Risk level is calculated based on: (1) Total family value - >$2M = High, >$500K = Medium, <$500K = Low; (2) Government contract status - Critical if any contract flagged as government; (3) Compliance requirements - Critical if >2 different types. Compliance requirements are shown in the 'Compliance Requirements' badges below when present (e.g., Government Contract, GDPR, SOX).">
              <div className="tooltip-trigger">
                <div className="metric-label">Risk Level</div>
                <div className="help-icon">?</div>
              </div>
            </Tooltip>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📅</div>
          <div className="metric-content">
            <div className="metric-value timeline">
              {formatDate(family.familyMetrics.familySpan.start)}
              {family.familyMetrics.familySpan.end && (
                <span className="timeline-end"> → {formatDate(family.familyMetrics.familySpan.end)}</span>
              )}
            </div>
            <Tooltip content="Family timeline spans from the earliest effective date across all contracts in the family to the latest expiration date. Start date is the minimum effective date from MSA, SOWs, and Change Orders. End date is the maximum expiration date, if available.">
              <div className="tooltip-trigger">
                <div className="metric-label">Family Timeline</div>
                <div className="help-icon">?</div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyDashboard;