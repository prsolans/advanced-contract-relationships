import { ContractData } from './types';

export const sampleContracts: ContractData[] = [
  {
    id: 'msa-001',
    type: 'MSA',
    title: 'Master Services Agreement - TechCorp Solutions',
    firstParty: 'Acme Corporation',
    thirdParty: 'TechCorp Solutions LLC',
    effectiveDate: '2023-01-15',
    expirationDate: '2025-01-15',
    governingLaw: 'Delaware State Law',
    paymentTerms: 'Net 30 days from invoice date',
    terminationClause: 'Either party may terminate with 90 days written notice',
    confidentialityClause: 'Standard NDA terms with 5-year post-termination period',
    indemnificationClause: 'Mutual indemnification for third-party claims',
    status: 'Active',
    totalValue: 2500000,
    currency: 'USD',
    children: [
      {
        id: 'sow-001',
        type: 'SOW',
        title: 'Software Development Services - Q1 2024',
        firstParty: 'Acme Corporation',
        thirdParty: 'TechCorp Solutions LLC',
        effectiveDate: '2024-01-01',
        expirationDate: '2024-03-31',
        governingLaw: 'Delaware State Law',
        paymentTerms: 'Milestone-based payments within 15 days',
        terminationClause: 'Termination for convenience with 30 days notice',
        confidentialityClause: 'Governed by MSA confidentiality terms',
        indemnificationClause: 'Per MSA indemnification clause',
        parentContractId: 'msa-001',
        status: 'Active',
        totalValue: 350000,
        currency: 'USD',
        children: [
          {
            id: 'co-001',
            type: 'ChangeOrder',
            title: 'Additional UI Components - Mobile Optimization',
            firstParty: 'Acme Corporation',
            thirdParty: 'TechCorp Solutions LLC',
            effectiveDate: '2024-02-15',
            governingLaw: 'Delaware State Law',
            paymentTerms: 'Payment due within 15 days of completion',
            terminationClause: 'As per parent SOW terms',
            confidentialityClause: 'As per parent SOW terms',
            indemnificationClause: 'As per parent SOW terms',
            parentContractId: 'sow-001',
            status: 'Active',
            totalValue: 45000,
            currency: 'USD'
          },
          {
            id: 'co-002',
            type: 'ChangeOrder',
            title: 'Performance Testing Services',
            firstParty: 'Acme Corporation',
            thirdParty: 'TechCorp Solutions LLC',
            effectiveDate: '2024-03-01',
            governingLaw: 'Delaware State Law',
            paymentTerms: 'Payment due within 15 days of completion',
            terminationClause: 'As per parent SOW terms',
            confidentialityClause: 'As per parent SOW terms',
            indemnificationClause: 'As per parent SOW terms',
            parentContractId: 'sow-001',
            status: 'Active',
            totalValue: 28000,
            currency: 'USD'
          }
        ]
      },
      {
        id: 'sow-002',
        type: 'SOW',
        title: 'Infrastructure Consulting - Q2 2024',
        firstParty: 'Acme Corporation',
        thirdParty: 'TechCorp Solutions LLC',
        effectiveDate: '2024-04-01',
        expirationDate: '2024-06-30',
        governingLaw: 'Delaware State Law',
        paymentTerms: 'Monthly payments within 30 days',
        terminationClause: 'Termination for convenience with 45 days notice',
        confidentialityClause: 'Governed by MSA confidentiality terms',
        indemnificationClause: 'Per MSA indemnification clause',
        parentContractId: 'msa-001',
        status: 'Active',
        totalValue: 180000,
        currency: 'USD'
      }
    ]
  }
];