import React from 'react';
import { Link } from 'react-router-dom';
import { combinedContractFamilies, combinedFamilyDescriptions } from '../combinedContractData';

const Homepage: React.FC = () => {
  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1>Meet CHARM</h1>
        <p className="homepage-subtitle">
          Contract Hierarchy Analysis and Relationship Mapping
        </p>
        <div className="value-proposition">
          <div className="value-bucket">
            <h3>🔍 Complete Visibility</h3>
            <p>Navigate intricate multi-level document hierarchies spanning from master agreements through statements of work to change orders and amendments with unprecedented clarity.</p>
          </div>
          <div className="value-bucket">
            <h3>⚖️ Smart Governance</h3>
            <p>Discover inheritance patterns, governance frameworks, and compliance requirements that drive your organization's contractual obligations across entire contract families.</p>
          </div>
          <div className="value-bucket">
            <h3>📊 Informed Decisions</h3>
            <p>Empower legal teams, contract managers, and business leaders with instant visibility into risk levels, performance metrics, and financial impacts.</p>
          </div>
        </div>
      </header>

      <section className="family-section">
        <h2 className="section-headline">Explore Hierarchies</h2>
        <div className="industry-grid">
        {Object.entries(combinedFamilyDescriptions).map(([contractFamily, details]) => (
          <Link 
            key={contractFamily} 
            to={`/contracts/${contractFamily.toLowerCase().replace(/\s+/g, '-')}`}
            className="industry-card"
          >
            <div className="industry-card-header">
              <h2>{details.title}</h2>
              <div className="hierarchy-badge">
                {details.hierarchy}
              </div>
            </div>
            
            <p className="industry-description">
              {details.description}
            </p>

            <div className="key-features">
              <h4>Key Features:</h4>
              <ul>
                {details.keyFeatures.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="industry-card-footer">
              <span className="explore-link">
                Explore {contractFamily} →
              </span>
            </div>
          </Link>
        ))}
        </div>
      </section>

      <footer className="homepage-footer">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">{combinedContractFamilies.length}</div>
            <div className="stat-label">MSA Families</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {combinedContractFamilies.reduce((sum, family) => sum + family.familyMetrics.totalContracts, 0)}
            </div>
            <div className="stat-label">Total Contracts</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              ${Math.round(combinedContractFamilies.reduce((sum, family) => sum + family.familyMetrics.totalFamilyValue, 0) / 1000000)}M
            </div>
            <div className="stat-label">Combined Value</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {combinedContractFamilies.reduce((sum, family) => sum + family.familyMetrics.activeSowCount, 0)}
            </div>
            <div className="stat-label">Active SOWs</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;