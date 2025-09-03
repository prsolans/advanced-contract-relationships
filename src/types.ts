export type ContractType = 
  // Procurement
  | 'MSA' | 'SOW' | 'ChangeOrder' | 'Amendment'
  // Manufacturing
  | 'PrimeContract' | 'SubcontractMSA' | 'PurchaseOrder' | 'FlowdownAmendment'
  // Healthcare
  | 'MasterAffiliation' | 'FacilityAgreement' | 'PhysicianAgreement' | 'CompensationSchedule' | 'SLA'
  // Construction
  | 'PrimeConstruction' | 'Subcontract' | 'TradeAgreement' | 'ConstructionAmendment'
  // Energy & Oil/Gas
  | 'EnergyMSA' | 'ProjectAgreement' | 'WorkOrder' | 'FieldTicket'
  // Financial Services
  | 'MasterTradingAgreement' | 'ProductSchedule' | 'TransactionConfirmation' | 'Novation';

export interface ContractData {
  id: string;
  type: ContractType;
  title: string;
  firstParty: string;
  thirdParty: string;
  effectiveDate: string;
  expirationDate?: string;
  governingLaw: string;
  paymentTerms: string;
  terminationClause: string;
  confidentialityClause: string;
  indemnificationClause: string;
  parentContractId?: string;
  children?: ContractData[];
  status: 'Active' | 'Expired' | 'Draft' | 'Terminated';
  totalValue?: number;
  currency?: string;
  industry?: 'Procurement' | 'Manufacturing' | 'Healthcare' | 'Construction' | 'Energy' | 'Financial';
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