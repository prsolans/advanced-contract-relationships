import React from 'react';

const AppFooter: React.FC = () => {
  const version = '1.0.0';
  const lastUpdated = 'September 2025';

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-info">
          <span className="app-name">CHARM</span>
          <span className="version">v{version}</span>
        </div>
        <div className="footer-meta">
          <span className="last-updated">Last updated: {lastUpdated}</span>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;