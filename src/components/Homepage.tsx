import React from 'react';
import { Link } from 'react-router-dom';
import { realContractDescriptions, contractFamilies } from '../realContractData';

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
        {Object.entries(realContractDescriptions).map(([contractFamily, details]) => (
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
            <div className="stat-number">5</div>
            <div className="stat-label">MSA Families</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">17</div>
            <div className="stat-label">Hierarchical Contracts</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">1</div>
            <div className="stat-label">Multi-Tier Chain</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">3</div>
            <div className="stat-label">Contract Types</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;