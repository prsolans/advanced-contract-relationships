import React from 'react';
import { Link } from 'react-router-dom';

const IndustryViewer: React.FC = () => {
  return (
    <div className="industry-not-found">
      <h2>Legacy Industry View</h2>
      <p>This view has been replaced with real contract data. Please use the contract family views.</p>
      <Link to="/" className="back-link">← Back to Homepage</Link>
    </div>
  );
};

export default IndustryViewer;