import React from 'react';
import { Link } from 'react-router-dom';
import { familyDescriptions, contractFamilies } from '../contractFamilyData';

const Homepage: React.FC = () => {
  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1>Master Service Agreement Families</h1>
        <p className="homepage-subtitle">
          Explore multi-tier MSA contract hierarchies with SOWs and Change Orders
        </p>
      </header>

      <div className="industry-grid">
        {Object.entries(familyDescriptions).map(([contractFamily, details]) => (
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

      <footer className="homepage-footer">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">{contractFamilies.length}</div>
            <div className="stat-label">MSA Families</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {contractFamilies.reduce((sum, family) => sum + family.familyMetrics.totalContracts, 0)}
            </div>
            <div className="stat-label">Total Contracts</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              ${Math.round(contractFamilies.reduce((sum, family) => sum + family.familyMetrics.totalFamilyValue, 0) / 1000000)}M
            </div>
            <div className="stat-label">Combined Value</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {contractFamilies.reduce((sum, family) => sum + family.familyMetrics.activeSowCount, 0)}
            </div>
            <div className="stat-label">Active SOWs</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;