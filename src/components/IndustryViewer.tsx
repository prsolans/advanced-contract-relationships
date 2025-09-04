import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const IndustryViewer: React.FC = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="industry-not-found">
      <h2>Legacy Industry View</h2>
      <p>This view has been replaced with real contract data. Please use the contract family views.</p>
      <Link to="/" className="back-link">← Back to Homepage</Link>
    </div>
  );
};

export default IndustryViewer;