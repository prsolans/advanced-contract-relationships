import React, { useState } from 'react';
import { ContractData } from '../types';

interface ContractTreeProps {
  contracts: ContractData[];
  selectedContract: ContractData | null;
  onContractSelect: (contract: ContractData) => void;
}

interface TreeNodeProps {
  contract: ContractData;
  level: number;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleExpand: (contractId: string) => void;
  onSelect: (contract: ContractData) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  contract,
  level,
  isSelected,
  isExpanded,
  onToggleExpand,
  onSelect,
}) => {
  const hasChildren = contract.children && contract.children.length > 0;
  
  const formatValue = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="tree-node">
      <div
        className={`tree-node-content ${isSelected ? 'selected' : ''} level-${level}`}
        onClick={() => onSelect(contract)}
      >
        <div className="node-left">
          {hasChildren && (
            <button
              className={`expand-button ${isExpanded ? 'expanded' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(contract.id);
              }}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
          {!hasChildren && <div className="expand-spacer" />}
          
          <div className="node-info">
            <span className={`node-type level-${level}`}>
              {contract.type}
            </span>
            <div className="node-title">{contract.title}</div>
            <div className="node-parties">
              {contract.firstParty} ↔ {contract.thirdParty}
            </div>
            {contract.totalValue && (
              <div className="node-value">
                {formatValue(contract.totalValue, contract.currency)}
              </div>
            )}
          </div>
        </div>
        
        <div className="node-right">
          <a 
            href={`https://apps-d.docusign.com/send/navigator/agreements/${contract.id}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="tree-document-link"
            title="View in DocuSign"
            onClick={(e) => e.stopPropagation()}
          >
            View
          </a>
          <span className={`status-dot ${contract.status.toLowerCase()}`} />
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="tree-children">
          {contract.children!.map((child) => (
            <ConnectedTreeNode
              key={child.id}
              contract={child}
              level={level + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ConnectedTreeNodeProps {
  contract: ContractData;
  level: number;
  onSelect: (contract: ContractData) => void;
}

const ConnectedTreeNode: React.FC<ConnectedTreeNodeProps> = (props) => {
  const { expandedNodes, selectedContract, toggleExpand } = React.useContext(TreeContext);
  
  return (
    <TreeNode
      {...props}
      isSelected={selectedContract?.id === props.contract.id}
      isExpanded={expandedNodes.has(props.contract.id)}
      onToggleExpand={toggleExpand}
    />
  );
};

const TreeContext = React.createContext<{
  expandedNodes: Set<string>;
  selectedContract: ContractData | null;
  toggleExpand: (contractId: string) => void;
}>({
  expandedNodes: new Set(),
  selectedContract: null,
  toggleExpand: () => {},
});

const ContractTree: React.FC<ContractTreeProps> = ({
  contracts,
  selectedContract,
  onContractSelect,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(contracts.map(c => c.id))
  );

  const toggleExpand = (contractId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contractId)) {
        newSet.delete(contractId);
      } else {
        newSet.add(contractId);
      }
      return newSet;
    });
  };

  const contextValue = {
    expandedNodes,
    selectedContract,
    toggleExpand,
  };

  return (
    <TreeContext.Provider value={contextValue}>
      <div className="contract-tree">
        <div className="tree-header">
          <h2>Contract Hierarchy</h2>
          <div className="tree-legend">
            <div className="legend-item">
              <span className="legend-dot level-0" />
              <span>Level 1</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot level-1" />
              <span>Level 2</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot level-2" />
              <span>Level 3</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot level-3" />
              <span>Level 4</span>
            </div>
          </div>
        </div>
        
        <div className="tree-content">
          {contracts.map((contract) => (
            <ConnectedTreeNode
              key={contract.id}
              contract={contract}
              level={0}
              onSelect={onContractSelect}
            />
          ))}
        </div>
      </div>
    </TreeContext.Provider>
  );
};

export default ContractTree;