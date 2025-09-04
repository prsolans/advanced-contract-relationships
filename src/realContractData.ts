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

// Create additional synthetic contract families with 3+ levels
const createSyntheticContractFamilies = (): ContractData[] => {
  // Family 1: Cloud Infrastructure Services - MSA → SOW → Change Orders → Amendments
  const cloudInfraMSA: ContractData = {
    id: 'MSA-2024-CI-001',
    type: 'Msa',
    title: 'Master Service Agreement - Cloud Infrastructure Services',
    contractNumber: 'MSA-2024-CI',
    firstParty: 'TechCorp Enterprise Solutions',
    thirdParty: 'CloudVault Technologies Inc.',
    effectiveDate: '2024-01-15',
    expirationDate: '2027-01-14',
    governingLaw: 'Delaware',
    jurisdiction: 'Delaware State Courts',
    paymentTerms: 'Net 45 days',
    terminationClause: '90 days written notice required by either party. Immediate termination for material breach after 30-day cure period.',
    confidentialityClause: 'All technical specifications, pricing models, and performance metrics shall remain confidential for 5 years post-termination.',
    indemnificationClause: 'Each party indemnifies against third-party claims arising from their negligent acts or willful misconduct.',
    status: 'Active',
    totalValue: 8500000,
    currency: 'USD',
    industry: 'Business Services',
    contractManager: 'Sarah Chen',
    renewalNotice: 'Either party may provide 180 days written notice of intent not to renew',
    riskLevel: 'Critical',
    vendorRating: 'A+ (4.8/5.0)',
    businessUnit: 'Infrastructure & Operations',
    projectCode: 'INFRA-2024-CI',
    approvalAuthority: 'CTO Office',
    complianceRequirements: ['SOC2 Type II', 'ISO 27001', 'GDPR', 'SOX'],
    children: [
      {
        id: 'SOW-2024-CI-PROD',
        type: 'Sow',
        title: 'Production Environment Migration & Management',
        contractNumber: 'SOW-2024-CI-001',
        parentContractId: 'MSA-2024-CI',
        firstParty: 'TechCorp Enterprise Solutions',
        thirdParty: 'CloudVault Technologies Inc.',
        effectiveDate: '2024-02-01',
        expirationDate: '2026-01-31',
        governingLaw: 'Delaware',
        jurisdiction: 'Delaware State Courts',
        paymentTerms: 'Net 45 days',
        terminationClause: '90 days written notice required by either party. Immediate termination for material breach after 30-day cure period.',
        confidentialityClause: 'All technical specifications, pricing models, and performance metrics shall remain confidential for 5 years post-termination.',
        indemnificationClause: 'Each party indemnifies against third-party claims arising from their negligent acts or willful misconduct.',
        status: 'Active',
        totalValue: 3200000,
        currency: 'USD',
        industry: 'Business Services',
        contractManager: 'Sarah Chen',
        riskLevel: 'High',
        vendorRating: 'A+ (4.8/5.0)',
        businessUnit: 'Infrastructure & Operations',
        projectCode: 'INFRA-2024-CI-PROD',
        deliverables: [
          'Complete migration of 450+ production servers to cloud infrastructure',
          '24/7 monitoring and alerting system implementation',
          'Disaster recovery and backup solutions deployment',
          'Performance optimization and cost management tools'
        ],
        keyMilestones: [
          { date: '2024-03-15', description: 'Phase 1: Core systems migration', completed: true },
          { date: '2024-06-01', description: 'Phase 2: Application tier migration', completed: true },
          { date: '2024-09-15', description: 'Phase 3: Data tier migration', completed: false },
          { date: '2024-12-01', description: 'Final optimization and handover', completed: false }
        ],
        children: [
          {
            id: 'CO-2024-CI-SEC',
            type: 'ChangeOrder',
            title: 'Enhanced Security Compliance Package',
            contractNumber: 'CO-2024-CI-001',
            parentContractId: 'SOW-2024-CI-001',
            firstParty: 'TechCorp Enterprise Solutions',
            thirdParty: 'CloudVault Technologies Inc.',
            effectiveDate: '2024-05-01',
            expirationDate: '2026-01-31',
            governingLaw: 'Delaware',
            jurisdiction: 'Delaware State Courts',
            paymentTerms: 'Net 45 days',
            terminationClause: 'Tied to parent SOW termination provisions',
            confidentialityClause: 'Enhanced confidentiality for security audit data and vulnerability assessments',
            indemnificationClause: 'Enhanced indemnification for security-related incidents',
            status: 'Active',
            totalValue: 750000,
            currency: 'USD',
            industry: 'Business Services',
            contractManager: 'Sarah Chen',
            riskLevel: 'High',
            businessUnit: 'Infrastructure & Operations',
            projectCode: 'INFRA-2024-CI-SEC',
            deliverables: [
              'Advanced threat detection and response system',
              'Zero-trust network architecture implementation',
              'Quarterly penetration testing and vulnerability assessments',
              'Compliance automation for SOC2 and ISO 27001'
            ],
            children: [
              {
                id: 'AMD-2024-CI-SEC-EXT',
                type: 'Amendment',
                title: 'Security Package Timeline Extension',
                contractNumber: 'AMD-2024-CI-001',
                parentContractId: 'CO-2024-CI-001',
                firstParty: 'TechCorp Enterprise Solutions',
                thirdParty: 'CloudVault Technologies Inc.',
                effectiveDate: '2024-08-15',
                expirationDate: '2026-01-31',
                governingLaw: 'Delaware',
                jurisdiction: 'Delaware State Courts',
                paymentTerms: 'Net 45 days',
                terminationClause: 'Follows parent Change Order provisions',
                confidentialityClause: 'Same as parent Change Order',
                indemnificationClause: 'Same as parent Change Order',
                status: 'Active',
                totalValue: 125000,
                currency: 'USD',
                industry: 'Business Services',
                contractManager: 'Sarah Chen',
                riskLevel: 'Medium',
                businessUnit: 'Infrastructure & Operations',
                projectCode: 'INFRA-2024-CI-SEC-EXT',
                renewalNotice: 'No renewal required - one-time amendment'
              }
            ]
          },
          {
            id: 'CO-2024-CI-SCALE',
            type: 'ChangeOrder',
            title: 'Additional Capacity Scaling Package',
            contractNumber: 'CO-2024-CI-002',
            parentContractId: 'SOW-2024-CI-001',
            firstParty: 'TechCorp Enterprise Solutions',
            thirdParty: 'CloudVault Technologies Inc.',
            effectiveDate: '2024-07-01',
            expirationDate: '2026-01-31',
            governingLaw: 'Delaware',
            jurisdiction: 'Delaware State Courts',
            paymentTerms: 'Net 45 days',
            terminationClause: 'Tied to parent SOW termination provisions',
            confidentialityClause: 'Same as parent SOW with additional performance data confidentiality',
            indemnificationClause: 'Standard indemnification per MSA terms',
            status: 'Active',
            totalValue: 450000,
            currency: 'USD',
            industry: 'Business Services',
            contractManager: 'Sarah Chen',
            riskLevel: 'Medium',
            businessUnit: 'Infrastructure & Operations',
            projectCode: 'INFRA-2024-CI-SCALE',
            deliverables: [
              'Auto-scaling infrastructure for peak load management',
              'Additional 200TB of high-performance storage',
              'Geographic load balancing across 3 regions',
              'Enhanced monitoring and analytics dashboard'
            ]
          }
        ]
      },
      {
        id: 'SOW-2024-CI-DEV',
        type: 'Sow',
        title: 'Development & Testing Environment Services',
        contractNumber: 'SOW-2024-CI-002',
        parentContractId: 'MSA-2024-CI',
        firstParty: 'TechCorp Enterprise Solutions',
        thirdParty: 'CloudVault Technologies Inc.',
        effectiveDate: '2024-03-01',
        expirationDate: '2025-12-31',
        governingLaw: 'Delaware',
        jurisdiction: 'Delaware State Courts',
        paymentTerms: 'Net 45 days',
        terminationClause: '60 days written notice for development environments',
        confidentialityClause: 'Development data and testing procedures confidential for 3 years',
        indemnificationClause: 'Limited indemnification for development environment issues',
        status: 'Active',
        totalValue: 850000,
        currency: 'USD',
        industry: 'Business Services',
        contractManager: 'Mike Rodriguez',
        riskLevel: 'Medium',
        businessUnit: 'Software Development',
        projectCode: 'DEV-2024-CI',
        deliverables: [
          'Containerized development environments',
          'CI/CD pipeline integration',
          'Automated testing infrastructure',
          'Developer self-service portal'
        ]
      }
    ]
  };

  // Family 2: Global Marketing Campaign Management - MSA → SOW → Change Orders → Amendments
  const marketingMSA: ContractData = {
    id: 'MSA-2024-MKT-001',
    type: 'Msa',
    title: 'Master Service Agreement - Global Marketing Campaign Management',
    contractNumber: 'MSA-2024-MKT',
    firstParty: 'GlobalBrand Corporation',
    thirdParty: 'CreativeEdge Marketing Solutions',
    effectiveDate: '2024-01-01',
    expirationDate: '2026-12-31',
    governingLaw: 'New York',
    jurisdiction: 'New York State Courts',
    paymentTerms: 'Net 30 days',
    terminationClause: '60 days written notice for convenience; immediate for breach after 15-day cure period',
    confidentialityClause: 'Marketing strategies, customer data, and campaign performance metrics confidential for 7 years',
    indemnificationClause: 'Agency indemnifies against IP infringement claims; Client indemnifies against brand/product liability',
    status: 'Active',
    totalValue: 4200000,
    currency: 'USD',
    industry: 'Business Services',
    contractManager: 'Jessica Park',
    renewalNotice: '120 days written notice of intent not to renew',
    riskLevel: 'High',
    vendorRating: 'A- (4.2/5.0)',
    businessUnit: 'Global Marketing Division',
    projectCode: 'MKT-2024-GLOBAL',
    approvalAuthority: 'CMO Office',
    complianceRequirements: ['GDPR', 'CCPA', 'Brand Compliance Guidelines'],
    children: [
      {
        id: 'SOW-2024-MKT-DIGITAL',
        type: 'Sow',
        title: 'Digital Marketing Campaign Execution',
        contractNumber: 'SOW-2024-MKT-001',
        parentContractId: 'MSA-2024-MKT',
        firstParty: 'GlobalBrand Corporation',
        thirdParty: 'CreativeEdge Marketing Solutions',
        effectiveDate: '2024-02-01',
        expirationDate: '2024-12-31',
        governingLaw: 'New York',
        jurisdiction: 'New York State Courts',
        paymentTerms: 'Net 30 days',
        terminationClause: '30 days written notice during campaign execution',
        confidentialityClause: 'Campaign creative assets and performance data confidential',
        indemnificationClause: 'Enhanced IP indemnification for digital content creation',
        status: 'Active',
        totalValue: 1800000,
        currency: 'USD',
        industry: 'Business Services',
        contractManager: 'Jessica Park',
        riskLevel: 'High',
        vendorRating: 'A- (4.2/5.0)',
        businessUnit: 'Global Marketing Division',
        projectCode: 'MKT-2024-DIGITAL',
        deliverables: [
          'Multi-platform digital advertising campaigns',
          'Social media content creation and management',
          'Search engine optimization and marketing',
          'Influencer partnership coordination',
          'Real-time performance analytics and reporting'
        ],
        keyMilestones: [
          { date: '2024-03-01', description: 'Campaign strategy finalization', completed: true },
          { date: '2024-04-15', description: 'Creative asset development', completed: true },
          { date: '2024-05-01', description: 'Phase 1 launch (Americas)', completed: true },
          { date: '2024-07-01', description: 'Phase 2 launch (EMEA)', completed: false },
          { date: '2024-09-01', description: 'Phase 3 launch (APAC)', completed: false }
        ],
        children: [
          {
            id: 'CO-2024-MKT-INFLU',
            type: 'ChangeOrder',
            title: 'Premium Influencer Partnership Program',
            contractNumber: 'CO-2024-MKT-001',
            parentContractId: 'SOW-2024-MKT-001',
            firstParty: 'GlobalBrand Corporation',
            thirdParty: 'CreativeEdge Marketing Solutions',
            effectiveDate: '2024-06-01',
            expirationDate: '2024-12-31',
            governingLaw: 'New York',
            jurisdiction: 'New York State Courts',
            paymentTerms: 'Net 30 days',
            terminationClause: 'Tied to parent SOW termination, with 14-day notice for influencer contracts',
            confidentialityClause: 'Enhanced confidentiality for influencer agreements and performance metrics',
            indemnificationClause: 'Additional indemnification for influencer content and FTC compliance',
            status: 'Active',
            totalValue: 650000,
            currency: 'USD',
            industry: 'Business Services',
            contractManager: 'Jessica Park',
            riskLevel: 'High',
            businessUnit: 'Global Marketing Division',
            projectCode: 'MKT-2024-INFLU',
            deliverables: [
              'Tier-1 celebrity influencer partnerships',
              'Micro-influencer network management',
              'Content authenticity verification',
              'FTC compliance monitoring and reporting'
            ],
            children: [
              {
                id: 'AMD-2024-MKT-INFLU-INT',
                type: 'Amendment',
                title: 'International Influencer Expansion',
                contractNumber: 'AMD-2024-MKT-001',
                parentContractId: 'CO-2024-MKT-001',
                firstParty: 'GlobalBrand Corporation',
                thirdParty: 'CreativeEdge Marketing Solutions',
                effectiveDate: '2024-08-01',
                expirationDate: '2024-12-31',
                governingLaw: 'New York',
                jurisdiction: 'New York State Courts',
                paymentTerms: 'Net 30 days',
                terminationClause: 'Follows parent Change Order provisions',
                confidentialityClause: 'Additional confidentiality for international market strategies',
                indemnificationClause: 'Expanded indemnification for international compliance requirements',
                status: 'Active',
                totalValue: 280000,
                currency: 'USD',
                industry: 'Business Services',
                contractManager: 'Jessica Park',
                riskLevel: 'High',
                businessUnit: 'Global Marketing Division',
                projectCode: 'MKT-2024-INFLU-INT',
                complianceRequirements: ['GDPR', 'Local Advertising Standards'],
                deliverables: [
                  'European influencer network expansion',
                  'APAC market influencer partnerships',
                  'Multi-language content localization',
                  'Regional compliance verification'
                ]
              },
              {
                id: 'AMD-2024-MKT-INFLU-PERF',
                type: 'Amendment',
                title: 'Performance Bonus Structure Enhancement',
                contractNumber: 'AMD-2024-MKT-002',
                parentContractId: 'CO-2024-MKT-001',
                firstParty: 'GlobalBrand Corporation',
                thirdParty: 'CreativeEdge Marketing Solutions',
                effectiveDate: '2024-09-15',
                expirationDate: '2024-12-31',
                governingLaw: 'New York',
                jurisdiction: 'New York State Courts',
                paymentTerms: 'Net 30 days for base; Net 15 days for performance bonuses',
                terminationClause: 'Performance metrics evaluation required before termination',
                confidentialityClause: 'Performance benchmarks and bonus calculations confidential',
                indemnificationClause: 'Standard per parent Change Order',
                status: 'Active',
                totalValue: 150000,
                currency: 'USD',
                industry: 'Business Services',
                contractManager: 'Jessica Park',
                riskLevel: 'Medium',
                businessUnit: 'Global Marketing Division',
                projectCode: 'MKT-2024-INFLU-PERF',
                performanceMetrics: [
                  'Engagement rate targets >4.5%',
                  'Conversion rate targets >2.8%',
                  'Brand awareness lift targets >15%',
                  'Cost per acquisition targets <$125'
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  return [cloudInfraMSA, marketingMSA];
};

// Export the processed contract data with synthetic families
export const realContractFamilies = [...buildContractHierarchy(), ...createSyntheticContractFamilies()];

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