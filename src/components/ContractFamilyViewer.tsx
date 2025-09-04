import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ContractData, EnhancedContractData } from '../types';
import { combinedContractFamilies, getCombinedEnhancedContracts } from '../combinedContractData';
import EnhancedContractDetails from './EnhancedContractDetails';
import ContractTree from './ContractTree';
import FamilyDashboard from './FamilyDashboard';

const ContractFamilyViewer: React.FC = () => {
  const { family } = useParams<{ family: string }>();
  
  // Convert URL parameter to family ID (e.g., "msa-99119-family" -> "MSA-99119" or "msa-2024-ci-family" -> "MSA-2024-CI")
  const familyId = family ? 
    family.split('-')
      .map((part, index, array) => {
        if (index === array.length - 1 && part.toLowerCase() === 'family') {
          return ''; // Remove "family" suffix
        }
        if (index === 0) return part.toUpperCase(); // MSA, CN, etc.
        // Keep numbers as-is, uppercase letters for other parts
        return isNaN(Number(part)) ? part.toUpperCase() : part;
      })
      .filter(Boolean)
      .join('-') : '';
  
  const contractFamily = combinedContractFamilies.find(f => f.id === familyId);
  
  const contracts = contractFamily ? [contractFamily.masterAgreement] : [];
  const enhancedContracts = contractFamily ? getCombinedEnhancedContracts(contractFamily.id) : [];

  const [selectedContract, setSelectedContract] = useState<ContractData | null>(
    contracts[0] || null
  );
  const [selectedEnhancedContract, setSelectedEnhancedContract] = useState<EnhancedContractData | null>(
    enhancedContracts[0] || null
  );

  // Scroll to top when component mounts or family changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [family]);


  const handleContractSelect = (contract: ContractData) => {
    setSelectedContract(contract);
    // Find the corresponding enhanced contract
    if (Array.isArray(enhancedContracts)) {
      const enhanced = enhancedContracts.find((ec: any) => ec.id === contract.id);
      if (enhanced) {
        setSelectedEnhancedContract(enhanced);
      }
    }
  };

  if (!contractFamily || contracts.length === 0) {
    return (
      <div className="industry-not-found">
        <h2>Contract family not found</h2>
        <p>The contract family "{familyId}" could not be found or contains no contracts.</p>
        <Link to="/" className="back-link">← Back to Homepage</Link>
      </div>
    );
  }

  return (
    <div className="integrated-family-viewer">
      {/* Sticky Header */}
      <div className="sticky-header visible">
        <div className="sticky-content">
          <Link to="/" className="sticky-charm-link">CHARM</Link>
          <div className="sticky-family-info">
            <span className="sticky-family-name">{contractFamily.id} Family</span>
            <span className="sticky-parties">
              {contractFamily.businessContext.parties[0]?.name_in_agreement} ↔ {contractFamily.businessContext.parties[1]?.name_in_agreement}
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="family-header">
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">→</span>
          <span className="breadcrumb-current">{contractFamily.id} Contract Family</span>
        </div>
      </div>

      {/* Family Dashboard - Full Width Above the Fold */}
      <div className="dashboard-section">
        <FamilyDashboard family={contractFamily} />
      </div>

      {/* Contract Details Section - Sidebar Layout */}
      <div className="contracts-section">
        <div className="contracts-sidebar">
          <ContractTree 
            contracts={contracts}
            selectedContract={selectedContract}
            onContractSelect={handleContractSelect}
          />
        </div>
        <div className="contract-details-pane">
          {selectedEnhancedContract && (
            <EnhancedContractDetails 
              contract={selectedEnhancedContract} 
              family={contractFamily}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractFamilyViewer;