// Real contract types from sample_data.json analysis
export type ContractType = 
  | 'Msa'
  | 'MSA' // Legacy format
  | 'ServicesAgreement' 
  | 'Sow'
  | 'SOW' // Legacy format
  | 'Nda'
  | 'ChangeOrder'
  | 'Consulting'
  | 'License'
  | 'Purchase'
  | 'PurchaseOrder'
  | 'Lease'
  | 'Amendment'
  | 'PrimeContract'
  | 'PrimeConstruction'
  | 'Subcontract'
  | 'SubcontractMSA'
  | 'FlowdownAmendment'
  | 'MasterAffiliation'
  | 'FacilityAgreement'
  | 'PhysicianAgreement'
  | 'CompensationSchedule'
  | 'SLA'
  | 'TradeAgreement'
  | 'ConstructionAmendment'
  | 'EnergyMSA'
  | 'ProjectAgreement'
  | 'WorkOrder'
  | 'FieldTicket'
  | 'MasterTradingAgreement'
  | 'ProductSchedule'
  | 'TransactionConfirmation'
  | 'Novation'
  | 'Other';

// Real contract data interface based on sample_data.json structure
export interface ContractParty {
  id: string;
  name_in_agreement: string;
}

export interface ContractProvisions {
  effective_date?: string;
  execution_date?: string;
  governing_law?: string;
  jurisdiction?: string;
  total_agreement_value?: number;
  total_agreement_value_currency_code?: string;
  payment_terms_due_date?: string;
  term_length?: string;
  termination_period_for_convenience?: string;
  renewal_notice_date?: string;
  liability_cap_fixed_amount?: number;
  liability_cap_currency_code?: string;
}

export interface CustomProvisions {
  c_ParentContractNumber?: string;
  c_ParentContractEffectiveDate?: string;
  c_MSANumber?: string;
  c_MSAEffectiveDate?: string;
  c_GovernmentContract?: string;
  [key: string]: any; // Allow additional custom fields
}

export interface ContractMetadata {
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
}

export interface RealContractData {
  id: string;
  title: string;
  file_name: string;
  type: ContractType;
  category: 'BusinessServices' | 'Miscellaneous';
  status: 'COMPLETE' | 'DRAFT' | 'IN_PROGRESS';
  review_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  parties: ContractParty[];
  provisions: ContractProvisions;
  custom_provisions: CustomProvisions;
  related_agreement_documents: Record<string, any>;
  languages: string[];
  source_name: string;
  source_id: string;
  source_account_id: string;
  metadata: ContractMetadata;
  // Derived fields for hierarchy display
  parentContractId?: string;
  children?: RealContractData[];
}

// Legacy interface for backward compatibility
export interface ContractData {
  id: string;
  type: ContractType;
  title: string;
  firstParty: string;
  thirdParty: string;
  effectiveDate: string;
  expirationDate?: string;
  governingLaw: string;
  jurisdiction?: string;
  paymentTerms: string;
  terminationClause: string;
  confidentialityClause: string;
  indemnificationClause: string;
  parentContractId?: string;
  contractNumber?: string;
  children?: ContractData[];
  status: 'Active' | 'Expired' | 'Draft' | 'Terminated';
  totalValue?: number;
  currency?: string;
  industry?: 'Procurement' | 'Manufacturing' | 'Healthcare' | 'Construction' | 'Energy' | 'Financial' | 'Business Services' | 'General' | 'Human Resources';
  // Additional data fields
  contractManager?: string;
  renewalNotice?: string;
  performanceMetrics?: string[];
  complianceRequirements?: string[];
  deliverables?: string[];
  keyMilestones?: { date: string; description: string; completed: boolean }[];
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  vendorRating?: string;
  businessUnit?: string;
  projectCode?: string;
  approvalAuthority?: string;
}

export interface ContractHierarchy {
  contracts: ContractData[];
  selectedContractId?: string;
}

// New family-level data architecture
export interface ContractFamily {
  id: string; // MSA contract number
  masterAgreement: ContractData;
  familyMetrics: {
    totalFamilyValue: number; // Sum of all SOW/CO values
    totalContracts: number;
    activeSowCount: number;
    totalChangeOrders: number;
    familySpan: { start: string; end?: string }; // Min effective to max expiration
    avgRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  };
  governanceFramework: {
    governingLaw: string; // From MSA
    jurisdiction: string; // From MSA
    defaultPaymentTerms: string; // From MSA
    terminationRights?: string; // From MSA if available
    complianceFlags: string[]; // Government contract, regulations, etc.
    liabilityFramework?: {
      capAmount?: number;
      capCurrency?: string;
      capDuration?: string;
    };
  };
  businessContext: {
    parties: ContractParty[]; // Primary contracting entities
    businessUnit?: string;
    contractManager?: string;
    industryCategory: string;
    relationshipType: 'Strategic Partnership' | 'Vendor' | 'Service Provider' | 'Government Contract';
  };
  children: ContractData[];
}

// Enhanced contract document with inheritance
export interface EnhancedContractData extends ContractData {
  familyId?: string; // Reference to parent family
  inheritedTerms: {
    usesParentGovernance: boolean;
    governingLaw: string; // Inherited or overridden
    jurisdiction: string; // Inherited or overridden  
    paymentTerms: string; // Inherited or overridden
  };
  projectExecution?: {
    deliverables?: string[];
    milestones?: { date: string; description: string; completed: boolean }[];
    performanceMetrics?: string[];
    specificCompliance?: string[];
  };
  documentLevel: 'MSA' | 'SOW' | 'ChangeOrder' | 'Amendment' | 'Other';
  contractRelationships?: {
    parentContractNumber?: string;
    childContractNumbers?: string[];
    amendmentNumbers?: string[];
  };
}