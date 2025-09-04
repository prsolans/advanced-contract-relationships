import { ContractData, ContractFamily } from './types';
import { contractFamilies } from './contractFamilyData';
import { procurementContracts, manufacturingContracts, healthcareContracts, constructionContracts, financialContracts } from './industryData';
import { sampleContracts } from './sampleData';
import { getEnhancedFamilyContracts } from './contractFamilyData';

// Convert ContractData arrays to ContractFamily format
const convertToContractFamily = (contracts: ContractData[], familyId: string): ContractFamily => {
  const masterAgreement = contracts[0];
  // Use the children from the master agreement if they exist, otherwise use the flat array
  const allChildren = masterAgreement.children || contracts.slice(1);
  
  // Helper function to get all contracts in the hierarchy
  const getAllContractsInHierarchy = (contractList: ContractData[]): ContractData[] => {
    const allContracts: ContractData[] = [];
    const processContract = (contract: ContractData) => {
      allContracts.push(contract);
      if (contract.children) {
        contract.children.forEach(processContract);
      }
    };
    contractList.forEach(processContract);
    return allContracts;
  };
  
  const allContractsInFamily = getAllContractsInHierarchy(contracts);
  
  // Calculate family metrics
  const totalFamilyValue = allContractsInFamily.reduce((sum, contract) => sum + (contract.totalValue || 0), 0);
  const totalContracts = allContractsInFamily.length;
  const activeSowCount = allContractsInFamily.filter(c => (c.type === 'Sow' || c.type === 'SOW') && c.status === 'Active').length;
  const totalChangeOrders = allContractsInFamily.filter(c => c.type === 'ChangeOrder').length;
  
  // Calculate family timeline
  const allDates = allContractsInFamily
    .map(c => c.effectiveDate)
    .filter(Boolean)
    .map(d => new Date(d));
  const startDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  
  const expirationDates = allContractsInFamily
    .map(c => c.expirationDate)
    .filter(Boolean)
    .map(d => new Date(d!));
  const endDate = expirationDates.length > 0 ? 
    new Date(Math.max(...expirationDates.map(d => d.getTime()))) : undefined;
  
  // Determine risk level
  const determineRiskLevel = (value: number, isGovernment?: boolean): 'Low' | 'Medium' | 'High' | 'Critical' => {
    if (isGovernment) return 'Critical';
    if (value > 5000000) return 'Critical';
    if (value > 2000000) return 'High';
    if (value > 500000) return 'Medium';
    return 'Low';
  };
  
  const hasGovernmentContract = allContractsInFamily.some(c => 
    c.complianceRequirements?.includes('Government Contract Requirements') ||
    c.complianceRequirements?.includes('Government Contract')
  );
  
  const avgRiskLevel = determineRiskLevel(totalFamilyValue, hasGovernmentContract);
  
  // Extract parties from master agreement
  const parties = [
    { id: '1', name_in_agreement: masterAgreement.firstParty },
    { id: '2', name_in_agreement: masterAgreement.thirdParty }
  ];
  
  // Determine relationship type
  const getRelationshipType = (industry?: string, riskLevel?: string): 'Strategic Partnership' | 'Vendor' | 'Service Provider' | 'Government Contract' => {
    if (hasGovernmentContract) return 'Government Contract';
    if (riskLevel === 'Critical' || totalFamilyValue > 10000000) return 'Strategic Partnership';
    if (industry === 'Procurement' || industry === 'Manufacturing') return 'Service Provider';
    return 'Vendor';
  };
  
  // Extract compliance flags
  const complianceFlags = Array.from(new Set(
    allContractsInFamily.flatMap(c => c.complianceRequirements || [])
  ));
  
  return {
    id: familyId,
    masterAgreement: {
      ...masterAgreement,
      children: allChildren
    },
    familyMetrics: {
      totalFamilyValue,
      totalContracts,
      activeSowCount,
      totalChangeOrders,
      familySpan: {
        start: startDate.toISOString().split('T')[0],
        end: endDate?.toISOString().split('T')[0]
      },
      avgRiskLevel
    },
    governanceFramework: {
      governingLaw: masterAgreement.governingLaw,
      jurisdiction: masterAgreement.jurisdiction || masterAgreement.governingLaw,
      defaultPaymentTerms: masterAgreement.paymentTerms,
      terminationRights: masterAgreement.terminationClause,
      complianceFlags,
      liabilityFramework: masterAgreement.totalValue ? {
        capAmount: masterAgreement.totalValue,
        capCurrency: masterAgreement.currency || 'USD'
      } : undefined
    },
    businessContext: {
      parties,
      businessUnit: masterAgreement.businessUnit,
      contractManager: masterAgreement.contractManager,
      industryCategory: masterAgreement.industry || 'Business Services',
      relationshipType: getRelationshipType(masterAgreement.industry, masterAgreement.riskLevel)
    },
    children: allChildren
  };
};

// Convert industry samples to contract families
const procurementFamily = convertToContractFamily(procurementContracts, 'PROC-MSA-001');
const manufacturingFamily = convertToContractFamily(manufacturingContracts, 'MFG-MSA-001');
const healthcareFamily = convertToContractFamily(healthcareContracts, 'HC-MSA-001');
const constructionFamily = convertToContractFamily(constructionContracts, 'CONST-PC-001');
const financialFamily = convertToContractFamily(financialContracts, 'FIN-MTA-001');
const sampleFamily = convertToContractFamily(sampleContracts, 'MSA-001');

// Get the existing real contract families (MSA-99119, MSA-2024-CI, MSA-2024-MKT)
const existingRealFamilies = contractFamilies;

// Combine all families
export const combinedContractFamilies: ContractFamily[] = [
  // Real multi-tier families (keep these first as they have the most depth)
  ...existingRealFamilies,
  // Industry-specific examples
  procurementFamily,
  manufacturingFamily,
  healthcareFamily,
  constructionFamily,
  financialFamily,
  sampleFamily
];

// Family descriptions for homepage
export const combinedFamilyDescriptions: { [key: string]: any } = {
  'MSA-99119': {
    title: 'MSA-99119 Contract Family',
    hierarchy: 'MSA → SOW → Change Orders',
    description: 'Real contract data showing Master Service Agreement with multiple Statements of Work and Change Orders for comprehensive project management.',
    keyFeatures: [
      'Multi-tier contract hierarchy with real data',
      'Government contract compliance requirements',
      'Complex change order management',
      'Risk assessment and renewal tracking'
    ]
  },
  'MSA-2024-CI': {
    title: 'MSA-2024-CI Contract Family',
    hierarchy: 'MSA → SOW → CO → Amendment',
    description: 'Cloud Infrastructure Services agreement with 4-level deep hierarchy showcasing enterprise-scale contract management.',
    keyFeatures: [
      '4-level contract hierarchy (MSA → SOW → CO → Amendment)',
      '$8.5M total family value',
      'Infrastructure and cloud services focus',
      'Strategic partnership relationship'
    ]
  },
  'MSA-2024-MKT': {
    title: 'MSA-2024-MKT Contract Family',
    hierarchy: 'MSA → SOW → CO → Amendment',
    description: 'Global Marketing Campaign agreement demonstrating complex marketing services contract relationships.',
    keyFeatures: [
      '4-level deep contract structure',
      '$4.2M marketing services portfolio',
      'Global campaign management',
      'Performance-based contract terms'
    ]
  },
  'PROC-MSA-001': {
    title: 'Procurement Services Family',
    hierarchy: 'MSA → SOW → Change Orders',
    description: 'Enterprise software procurement with comprehensive compliance requirements and vendor management.',
    keyFeatures: [
      '$15M enterprise software solutions',
      'SOC 2, ISO 27001, GDPR compliance',
      'Cloud infrastructure migration',
      'Strategic vendor partnership'
    ]
  },
  'MFG-MSA-001': {
    title: 'Defense Manufacturing Family',
    hierarchy: 'Prime Contract → Subcontract MSAs → Purchase Orders',
    description: 'Defense systems manufacturing with federal compliance, subcontractor management, and component procurement.',
    keyFeatures: [
      '$125M defense systems contract',
      'ITAR, DFARS, CMMC Level 3 compliance',
      'Multi-tier subcontracting structure',
      'Federal acquisition regulations (FAR)'
    ]
  },
  'HC-MSA-001': {
    title: 'Healthcare Network Family',
    hierarchy: 'Master Affiliation → Facility Agreements → Physician Agreements',
    description: 'Healthcare network affiliation with facility partnerships and physician service agreements.',
    keyFeatures: [
      'Regional healthcare network integration',
      'HIPAA compliance requirements',
      'Multi-facility service coordination',
      'Physician compensation structures'
    ]
  },
  'CONST-PC-001': {
    title: 'Construction & Infrastructure Family',
    hierarchy: 'Prime Contract → Subcontract → Trade Agreement → Construction Amendment',
    description: 'Large-scale commercial construction project with prime contractors, subcontractors, trade agreements, and specialized construction amendments.',
    keyFeatures: [
      '$85M commercial construction project',
      'AIA Standard forms and Construction Lien Law compliance',
      'Multi-tier subcontracting structure',
      'Construction-specific amendments and change orders'
    ]
  },
  'FIN-MTA-001': {
    title: 'Financial Services & Trading Family',
    hierarchy: 'Master Trading Agreement → Product Schedule → Transaction Confirmation → Novation',
    description: 'Sophisticated financial instruments and trading relationships with ISDA frameworks, product schedules, and transaction confirmations.',
    keyFeatures: [
      'ISDA master agreement frameworks',
      'Multi-asset class product structuring',
      'Real-time transaction confirmation and settlement',
      'Regulatory compliance and risk management'
    ]
  },
  'MSA-001': {
    title: 'Technology Services Family',
    hierarchy: 'MSA → SOW → Change Orders',
    description: 'General technology services agreement showcasing standard contract management practices.',
    keyFeatures: [
      'Software development services',
      'Standard contract terms',
      'Project milestone management',
      'Technology integration'
    ]
  }
};

// Enhanced contract data for detailed view
export const getCombinedEnhancedContracts = (familyId: string): any[] => {
  // First try to get from existing enhanced data
  const existingEnhanced = getEnhancedFamilyContracts(familyId);
  if (existingEnhanced.length > 0) {
    return existingEnhanced;
  }
  
  // For new families, create basic enhanced data
  const family = combinedContractFamilies.find(f => f.id === familyId);
  if (!family) return [];
  
  // Helper function to get all contracts in the hierarchy
  const getAllContractsFromFamily = (contracts: ContractData[]): ContractData[] => {
    const allContracts: ContractData[] = [];
    const processContract = (contract: ContractData) => {
      allContracts.push(contract);
      if (contract.children) {
        contract.children.forEach(processContract);
      }
    };
    contracts.forEach(processContract);
    return allContracts;
  };
  
  const allContracts = getAllContractsFromFamily([family.masterAgreement]);
  
  return allContracts.map(contract => ({
    ...contract,
    familyId,
    inheritedTerms: {
      usesParentGovernance: contract.id !== family.masterAgreement.id,
      governingLaw: contract.governingLaw,
      jurisdiction: contract.jurisdiction || contract.governingLaw,
      paymentTerms: contract.paymentTerms
    },
    documentLevel: (contract.type === 'Msa' || contract.type === 'MSA') ? 'MSA' as const : 
                  (contract.type === 'Sow' || contract.type === 'SOW') ? 'SOW' as const :
                  contract.type === 'ChangeOrder' ? 'ChangeOrder' as const :
                  'Other' as const,
    contractRelationships: {
      parentContractNumber: contract.parentContractId,
      childContractNumbers: contract.children?.map(c => c.id) || []
    }
  }));
};