import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ContractData } from '../types';
import { realContractDescriptions, contractFamilies } from '../realContractData';
import ContractDetails from './ContractDetails';
import ContractTree from './ContractTree';

const ContractFamilyViewer: React.FC = () => {
  const { family } = useParams<{ family: string }>();
  
  // Convert URL parameter to family key (e.g., "msa-99119-family" -> "MSA-99119 Family")
  const familyKey = family ? 
    family.split('-')
      .map((part, index) => {
        if (index === 0) return part.toUpperCase(); // MSA, CN, etc.
        if (index === family.split('-').length - 1) return 'Family'; // Last part is always "family"
        return part; // Keep numbers as-is
      })
      .join('-')
      .replace(/-Family$/, ' Family') : '';
  
  const contracts = contractFamilies[familyKey as keyof typeof contractFamilies] || [];
  const description = realContractDescriptions[familyKey as keyof typeof realContractDescriptions];

  const [selectedContract, setSelectedContract] = useState<ContractData | null>(
    contracts[0] || null
  );

  const handleContractSelect = (contract: ContractData) => {
    setSelectedContract(contract);
  };

  if (!description || contracts.length === 0) {
    return (
      <div className="industry-not-found">
        <h2>Contract family not found</h2>
        <p>The contract family "{familyKey}" could not be found or contains no contracts.</p>
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
          <div className="contract-stats">
            <span className="stat-badge">
              {contracts.length} {contracts.length === 1 ? 'Contract' : 'Contracts'}
            </span>
            <span className="stat-badge">
              {contracts.filter(c => c.children && c.children.length > 0).length} 
              {' '}Hierarchical Relationships
            </span>
            <span className="stat-badge">
              Real Contract Data
            </span>
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

export default ContractFamilyViewer;