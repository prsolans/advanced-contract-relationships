import { RealContractData, ContractData } from './types';
import contractsJson from './sample_data.json';

interface SampleDataStructure {
  agreements: RealContractData[];
}

// Import the real contract data
const sampleData = contractsJson as SampleDataStructure;
const rawContracts = sampleData.agreements;

// Helper function to format currency
const formatCurrency = (amount: number | undefined, currency: string | undefined): string => {
  if (!amount) return 'Not specified';
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  });
  return formatter.format(amount);
};

// Helper function to format date
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Not specified';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

// Helper function to get party names
const getPartyNames = (parties: any[]): { first: string; third: string } => {
  if (!parties || parties.length === 0) {
    return { first: 'Unknown Party', third: 'Unknown Party' };
  }
  
  const first = parties[0]?.name_in_agreement || 'Unknown Party';
  const third = parties[1]?.name_in_agreement || parties[0]?.name_in_agreement || 'Unknown Party';
  
  return { first, third };
};

// Helper function to convert payment terms
const formatPaymentTerms = (paymentTerms: string | undefined): string => {
  if (!paymentTerms) return 'Not specified';
  
  const termMap: { [key: string]: string } = {
    'THIRTY_DAYS': 'Net 30 days',
    'FORTY_FIVE_DAYS': 'Net 45 days',
    'SIXTY_DAYS': 'Net 60 days',
    'OTHER': 'As per agreement terms',
  };
  
  return termMap[paymentTerms] || paymentTerms;
};

// Convert real contract data to legacy format for display
const convertToLegacyFormat = (realContract: RealContractData): ContractData => {
  const parties = getPartyNames(realContract.parties);
  
  // Extract contract number from file_name
  const fileNameMatch = realContract.file_name?.match(/(MSA|SOW|CN|CO|NDA|SLA|CONS|PA|CLIENT)-(\d+)/);
  const contractNumber = fileNameMatch ? `${fileNameMatch[1]}-${fileNameMatch[2]}` : undefined;
  
  return {
    id: realContract.id,
    type: realContract.type,
    title: realContract.title,
    firstParty: parties.first,
    thirdParty: parties.third,
    effectiveDate: formatDate(realContract.provisions.effective_date),
    expirationDate: realContract.provisions.renewal_notice_date ? 
      formatDate(realContract.provisions.renewal_notice_date) : undefined,
    governingLaw: realContract.provisions.governing_law || 'Not specified',
    jurisdiction: realContract.provisions.jurisdiction,
    paymentTerms: formatPaymentTerms(realContract.provisions.payment_terms_due_date),
    terminationClause: realContract.provisions.termination_period_for_convenience ? 
      `Termination with ${realContract.provisions.termination_period_for_convenience} notice` : 
      'Standard termination terms apply',
    confidentialityClause: 'Standard confidentiality terms apply',
    indemnificationClause: realContract.provisions.liability_cap_fixed_amount ? 
      `Liability cap: ${formatCurrency(realContract.provisions.liability_cap_fixed_amount, realContract.provisions.liability_cap_currency_code)}` :
      'Standard indemnification terms',
    parentContractId: realContract.custom_provisions.c_ParentContractNumber,
    contractNumber: contractNumber,
    status: realContract.status === 'COMPLETE' ? 'Active' : 'Draft',
    totalValue: realContract.provisions.total_agreement_value,
    currency: realContract.provisions.total_agreement_value_currency_code || 'USD',
    industry: 'Business Services',
    contractManager: 'Contract Administrator',
    complianceRequirements: realContract.custom_provisions.c_GovernmentContract === 'True' ? 
      ['Government Contract Requirements'] : undefined,
    riskLevel: realContract.provisions.total_agreement_value && realContract.provisions.total_agreement_value > 500000 ? 
      'High' : realContract.provisions.total_agreement_value && realContract.provisions.total_agreement_value > 100000 ?
      'Medium' : 'Low',
    businessUnit: realContract.category === 'BusinessServices' ? 'Business Services Division' : 'General Division'
  };
};

// Build hierarchical structure from real contract data
const buildContractHierarchy = (): ContractData[] => {
  console.log('Building contract hierarchy from real data...');
  console.log(`Total contracts: ${rawContracts.length}`);
  
  // Convert all contracts to legacy format
  const allContracts = rawContracts.map(convertToLegacyFormat);
  
  console.log('Contract number mapping:');
  allContracts.forEach(contract => {
    if (contract.contractNumber) {
      console.log(`  ${contract.contractNumber} -> ${contract.title} (${contract.type})`);
    }
  });
  
  // Build parent-child relationships using parentContractId
  const childrenByParent = new Map<string, ContractData[]>();
  
  allContracts.forEach(contract => {
    if (contract.parentContractId) {
      console.log(`Child contract: ${contract.title} -> Parent: ${contract.parentContractId}`);
      if (!childrenByParent.has(contract.parentContractId)) {
        childrenByParent.set(contract.parentContractId, []);
      }
      childrenByParent.get(contract.parentContractId)!.push(contract);
    }
  });
  
  console.log('Parent-child mapping:');
  childrenByParent.forEach((children, parentNumber) => {
    console.log(`  Parent ${parentNumber}: ${children.length} children`);
    children.forEach(child => console.log(`    - ${child.title} (${child.type})`));
  });
  
  // Recursively attach children to all contracts
  const attachChildren = (contract: ContractData): void => {
    // Look for children using contract number as key
    if (contract.contractNumber && childrenByParent.has(contract.contractNumber)) {
      const children = childrenByParent.get(contract.contractNumber)!;
      contract.children = children;
      console.log(`Attached ${children.length} children to ${contract.title} (${contract.contractNumber})`);
      
      // Recursively attach children to each child
      children.forEach(child => attachChildren(child));
    }
  };
  
  // Attach children to ALL contracts
  allContracts.forEach(contract => attachChildren(contract));
  
  // Find top-level contracts (those without parentContractId)
  const topLevelContracts = allContracts.filter(contract => !contract.parentContractId);
  
  console.log(`Found ${topLevelContracts.length} top-level contracts`);
  topLevelContracts.forEach(contract => {
    const childCount = contract.children ? contract.children.length : 0;
    console.log(`  - ${contract.title} (${contract.contractNumber || contract.id}): ${childCount} children`);
  });
  
  // Sort by contract type and title
  return topLevelContracts.sort((a, b) => {
    if (a.type !== b.type) {
      const typeOrder = ['Msa', 'Sow', 'ServicesAgreement', 'Consulting', 'Nda', 'ChangeOrder', 'License', 'Purchase', 'Lease', 'Amendment', 'Other'];
      return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
    }
    return a.title.localeCompare(b.title);
  });
};

// Export the processed contract data
export const realContractFamilies = buildContractHierarchy();

// Get all contracts (including children) for filtering
const getAllContracts = (contracts: ContractData[]): ContractData[] => {
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

const allProcessedContracts = getAllContracts(realContractFamilies);

// Export individual MSA families for better navigation
const msaFamilies = realContractFamilies.filter(c => c.type === 'Msa' && c.children && c.children.length > 0);

export const contractFamilies: Record<string, ContractData[]> = {};

// Create individual entries for each MSA family
msaFamilies.forEach(msa => {
  if (msa.contractNumber) {
    const familyKey = `${msa.contractNumber} Family`;
    contractFamilies[familyKey] = [msa]; // Each family contains just the root MSA (with its children attached)
  }
});

// Create individual descriptions for each MSA family
export const realContractDescriptions: Record<string, any> = {};

msaFamilies.forEach(msa => {
  if (msa.contractNumber) {
    const familyKey = `${msa.contractNumber} Family`;
    const childrenCount = msa.children ? msa.children.length : 0;
    const hasMultiTier = msa.children?.some(child => child.children && child.children.length > 0) || false;
    const multiTierExample = hasMultiTier ? 
      msa.children?.find(child => child.children && child.children.length > 0) : null;
    
    realContractDescriptions[familyKey] = {
      title: `${msa.contractNumber} Contract Family`,
      description: `Master Service Agreement between ${msa.firstParty} and ${msa.thirdParty} with ${childrenCount} related contract${childrenCount !== 1 ? 's' : ''}.${hasMultiTier ? ' Features multi-tier hierarchy.' : ''}`,
      hierarchy: hasMultiTier ? 
        `MSA → SOW → Change Order` : 
        `MSA → SOW`,
      keyFeatures: [
        `Master agreement: ${msa.title}`,
        `${childrenCount} child contract${childrenCount !== 1 ? 's' : ''}`,
        hasMultiTier && multiTierExample ? 
          `Multi-tier chain: ${msa.contractNumber} → ${multiTierExample.contractNumber} → ${multiTierExample.children?.[0]?.contractNumber || 'Child'}` :
          'Single-tier hierarchy',
        `Governing Law: ${msa.governingLaw}`,
        `Payment Terms: ${msa.paymentTerms}`
      ]
    };
  }
});