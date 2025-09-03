import { ContractData, ContractFamily, EnhancedContractData, ContractParty } from './types';
import { realContractFamilies } from './realContractData';

// Helper to determine risk level based on value and compliance
const calculateRiskLevel = (totalValue: number, hasGovernmentContract: boolean, complianceFlags: string[]): 'Low' | 'Medium' | 'High' | 'Critical' => {
  if (hasGovernmentContract || complianceFlags.length > 2) return 'Critical';
  if (totalValue > 1000000) return 'High';
  if (totalValue > 500000) return 'Medium';
  return 'Low';
};

// Helper to determine relationship type
const determineRelationshipType = (complianceFlags: string[], totalValue: number): 'Strategic Partnership' | 'Vendor' | 'Service Provider' | 'Government Contract' => {
  if (complianceFlags.includes('Government Contract')) return 'Government Contract';
  if (totalValue > 2000000) return 'Strategic Partnership';
  if (totalValue > 500000) return 'Service Provider';
  return 'Vendor';
};

// Helper to collect all contracts in a family tree
const collectAllContracts = (contracts: ContractData[]): ContractData[] => {
  const allContracts: ContractData[] = [];
  
  const addContractAndChildren = (contract: ContractData) => {
    allContracts.push(contract);
    if (contract.children) {
      contract.children.forEach(addContractAndChildren);
    }
  };
  
  contracts.forEach(addContractAndChildren);
  return allContracts;
};

// Helper to format payment terms consistently
const formatPaymentTerms = (paymentTerms: string): string => {
  const termMap: { [key: string]: string } = {
    'THIRTY_DAYS': 'Net 30 days',
    'FORTY_FIVE_DAYS': 'Net 45 days', 
    'SIXTY_DAYS': 'Net 60 days',
    'OTHER': 'As per agreement terms',
  };
  return termMap[paymentTerms] || paymentTerms;
};

// Convert legacy contract data to enhanced format with inheritance
const enhanceContractData = (contract: ContractData, familyId?: string, parentGovernance?: any): EnhancedContractData => {
  // Determine if each term is inherited (same as parent) or overridden (different from parent)
  const governingLawIsInherited = parentGovernance && contract.governingLaw === parentGovernance.governingLaw;
  const jurisdictionIsInherited = parentGovernance && contract.jurisdiction === parentGovernance.jurisdiction;  
  const paymentTermsIsInherited = parentGovernance && contract.paymentTerms === parentGovernance.defaultPaymentTerms;
  
  const enhanced: EnhancedContractData = {
    ...contract,
    familyId,
    inheritedTerms: {
      usesParentGovernance: governingLawIsInherited || jurisdictionIsInherited || paymentTermsIsInherited,
      governingLaw: contract.governingLaw || parentGovernance?.governingLaw || 'Not specified',
      jurisdiction: contract.jurisdiction || parentGovernance?.jurisdiction || 'Not specified',
      paymentTerms: contract.paymentTerms || parentGovernance?.defaultPaymentTerms || 'Not specified',
    },
    documentLevel: contract.type as 'MSA' | 'SOW' | 'ChangeOrder' | 'Amendment' | 'Other',
    contractRelationships: {
      parentContractNumber: contract.parentContractId,
      childContractNumbers: contract.children?.map(c => c.contractNumber || c.id),
    },
  };

  // Add project execution data for SOWs and Change Orders
  if (contract.type === 'Sow' || contract.type === 'ChangeOrder') {
    enhanced.projectExecution = {
      deliverables: contract.deliverables,
      milestones: contract.keyMilestones,
      performanceMetrics: contract.performanceMetrics,
      specificCompliance: contract.complianceRequirements,
    };
  }

  return enhanced;
};

// Build contract families with computed metrics and governance
export const buildContractFamilies = (): ContractFamily[] => {
  return realContractFamilies.map(rootContract => {
    // Collect all contracts in this family
    const allFamilyContracts = collectAllContracts([rootContract]);
    
    // Calculate family metrics
    const totalFamilyValue = allFamilyContracts
      .reduce((sum, contract) => sum + (contract.totalValue || 0), 0);
    
    const sowContracts = allFamilyContracts.filter(c => c.type === 'Sow');
    const changeOrders = allFamilyContracts.filter(c => c.type === 'ChangeOrder');
    const activeSowCount = sowContracts.filter(c => c.status === 'Active').length;
    
    // Determine date span
    const allDates = allFamilyContracts
      .map(c => ({ start: new Date(c.effectiveDate), end: c.expirationDate ? new Date(c.expirationDate) : null }))
      .filter(d => !isNaN(d.start.getTime()));
    
    const familyStart = allDates.length > 0 
      ? Math.min(...allDates.map(d => d.start.getTime()))
      : Date.now();
    const familyEnd = allDates
      .filter(d => d.end)
      .map(d => d.end!.getTime())
      .reduce((max, date) => Math.max(max, date), 0);

    // Extract governance from MSA
    const msa = rootContract.type === 'Msa' ? rootContract : allFamilyContracts.find(c => c.type === 'Msa') || rootContract;
    
    // Determine compliance flags
    const complianceFlags: string[] = [];
    if (msa.complianceRequirements?.some(req => req.toLowerCase().includes('government'))) {
      complianceFlags.push('Government Contract');
    }
    if (msa.complianceRequirements?.some(req => req.toLowerCase().includes('gdpr'))) {
      complianceFlags.push('GDPR');
    }
    if (msa.complianceRequirements?.some(req => req.toLowerCase().includes('sox'))) {
      complianceFlags.push('SOX');
    }
    
    const hasGovernmentContract = complianceFlags.includes('Government Contract');
    
    // Build governance framework
    const governanceFramework = {
      governingLaw: msa.governingLaw,
      jurisdiction: msa.jurisdiction || 'Not specified',
      defaultPaymentTerms: formatPaymentTerms(msa.paymentTerms),
      terminationRights: msa.terminationClause,
      complianceFlags,
      liabilityFramework: msa.indemnificationClause ? {
        // Would need to parse liability cap from indemnification clause
        // For now, using placeholder logic
      } : undefined,
    };

    // Build business context
    const businessContext = {
      parties: [
        { id: 'party1', name_in_agreement: msa.firstParty },
        { id: 'party2', name_in_agreement: msa.thirdParty },
      ] as ContractParty[],
      businessUnit: msa.businessUnit,
      contractManager: msa.contractManager,
      industryCategory: msa.industry || 'Business Services',
      relationshipType: determineRelationshipType(complianceFlags, totalFamilyValue),
    };

    // Calculate average risk level
    const avgRiskLevel = calculateRiskLevel(totalFamilyValue, hasGovernmentContract, complianceFlags);

    const family: ContractFamily = {
      id: rootContract.contractNumber || rootContract.id,
      masterAgreement: msa,
      familyMetrics: {
        totalFamilyValue,
        totalContracts: allFamilyContracts.length,
        activeSowCount,
        totalChangeOrders: changeOrders.length,
        familySpan: {
          start: new Date(familyStart).toISOString().split('T')[0],
          end: familyEnd > 0 ? new Date(familyEnd).toISOString().split('T')[0] : undefined,
        },
        avgRiskLevel,
      },
      governanceFramework,
      businessContext,
      children: rootContract.children || [],
    };

    return family;
  });
};

// Get enhanced contract data for a specific family
export const getEnhancedFamilyContracts = (familyId: string): EnhancedContractData[] => {
  const families = buildContractFamilies();
  const family = families.find(f => f.id === familyId);
  
  if (!family) return [];

  const allContracts = collectAllContracts([family.masterAgreement]);
  
  return allContracts.map(contract => 
    enhanceContractData(contract, familyId, family.governanceFramework)
  );
};

// Export processed families
export const contractFamilies = buildContractFamilies();

// Create family descriptions for homepage
export const familyDescriptions: Record<string, any> = {};

contractFamilies.forEach(family => {
  const familyKey = `${family.id} Family`;
  familyDescriptions[familyKey] = {
    title: `${family.id} Contract Family`,
    description: `${family.businessContext.relationshipType} between ${family.businessContext.parties[0]?.name_in_agreement} and ${family.businessContext.parties[1]?.name_in_agreement} with ${family.familyMetrics.activeSowCount} active SOW${family.familyMetrics.activeSowCount !== 1 ? 's' : ''} worth ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(family.familyMetrics.totalFamilyValue)}.`,
    hierarchy: family.familyMetrics.totalChangeOrders > 0 ? 'MSA → SOW → Change Order' : 'MSA → SOW',
    keyFeatures: [
      `Master agreement: ${family.masterAgreement.title}`,
      `Total value: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(family.familyMetrics.totalFamilyValue)}`,
      `${family.familyMetrics.activeSowCount} active SOW${family.familyMetrics.activeSowCount !== 1 ? 's' : ''}`,
      `Risk level: ${family.familyMetrics.avgRiskLevel}`,
      `Governing law: ${family.governanceFramework.governingLaw}`,
      `Relationship type: ${family.businessContext.relationshipType}`,
    ],
  };
});