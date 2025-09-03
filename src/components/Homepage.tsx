import React from 'react';
import { Link } from 'react-router-dom';
import { industryDescriptions } from '../industryData';

const Homepage: React.FC = () => {
  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1>Contract Family Relationships</h1>
        <p className="homepage-subtitle">
          Explore industry-specific contract hierarchies and relationships
        </p>
      </header>

      <div className="industry-grid">
        {Object.entries(industryDescriptions).map(([industry, details]) => (
          <Link 
            key={industry} 
            to={`/industry/${industry.toLowerCase()}`}
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
                {details.keyFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="industry-card-footer">
              <span className="explore-link">
                Explore {industry} Contracts →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <footer className="homepage-footer">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">6</div>
            <div className="stat-label">Industries</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24+</div>
            <div className="stat-label">Contract Types</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">4</div>
            <div className="stat-label">Hierarchy Levels</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">Real-time</div>
            <div className="stat-label">Relationship Views</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;