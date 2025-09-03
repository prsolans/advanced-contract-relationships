import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ContractData } from '../types';
import { industryData, industryDescriptions } from '../industryData';
import ContractDetails from './ContractDetails';
import ContractTree from './ContractTree';

const IndustryViewer: React.FC = () => {
  const { industry } = useParams<{ industry: string }>();
  
  const industryKey = (industry ? industry.charAt(0).toUpperCase() + industry.slice(1) : '') as keyof typeof industryData;
  const contracts = industryData[industryKey] || [];
  const description = industryDescriptions[industryKey as keyof typeof industryDescriptions];

  const [selectedContract, setSelectedContract] = useState<ContractData | null>(
    contracts[0] || null
  );

  const handleContractSelect = (contract: ContractData) => {
    setSelectedContract(contract);
  };

  if (!description || contracts.length === 0) {
    return (
      <div className="industry-not-found">
        <h2>Industry not found</h2>
        <Link to="/" className="back-link">← Back to Homepage</Link>
      </div>
    );
  }

  return (
    <div className="industry-viewer">
      <div className="industry-header">
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">→</span>
          <span className="breadcrumb-current">{description.title}</span>
        </div>
        
        <div className="industry-info">
          <h1>{description.title}</h1>
          <p className="industry-subtitle">{description.description}</p>
          <div className="hierarchy-flow">
            <span className="hierarchy-label">Hierarchy:</span>
            <span className="hierarchy-text">{description.hierarchy}</span>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="left-column">
          {selectedContract && (
            <ContractDetails contract={selectedContract} />
          )}
        </div>
        <div className="right-sidebar">
          <ContractTree 
            contracts={contracts}
            selectedContract={selectedContract}
            onContractSelect={handleContractSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default IndustryViewer;