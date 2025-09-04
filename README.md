# Contract Relationship Management System

A React-based application for visualizing and managing complex contract hierarchies across multiple industries. Supports any multi-level document structure from traditional MSA/SOW patterns to specialized industry frameworks like ISDA trading agreements, construction contracts, and healthcare affiliations.

## 🚀 Features

- **Multi-Level Document Hierarchies**: Visualize relationships between any contract types (MSAs, SOWs, Prime Contracts, Trading Agreements, etc.)
- **Industry-Agnostic Framework**: Adaptable to any industry's document structures and terminology
- **Interactive Contract Tree**: Navigate complex document families with expandable tree views
- **Term Inheritance Visualization**: Track how governance and terms cascade through document hierarchies
- **Risk Assessment**: Visual risk indicators and detailed explanations
- **Enhanced Document Details**: Comprehensive contract information with tooltips and help text
- **Cross-Industry Examples**: Real-world structures across procurement, healthcare, construction, financial services, and more
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

### Multi-Level Document Hierarchies

The system supports flexible hierarchy structures that adapt to different industries:

**Traditional Services Model:**
```
MSA (Master Service Agreement)
├── SOW (Statement of Work)
│   ├── Change Order
│   │   └── Amendment
│   └── Change Order
└── SOW
    └── Change Order
```

**Healthcare Network Model:**
```
Master Affiliation Agreement
├── Facility Service Agreement
│   ├── Physician Agreement
│   └── Compensation Schedule
└── Facility Service Agreement
    └── Physician Agreement
```

**Financial Services Model:**
```
Master Trading Agreement
├── Product Schedule
│   ├── Transaction Confirmation
│   │   └── Novation
│   └── Transaction Confirmation
└── Product Schedule
```

### Cross-Industry Applications
- **Procurement**: MSA → SOW → Change Order → Amendment patterns ($15M family)
- **Defense Manufacturing**: Prime Contract → Subcontract → Purchase Order structures ($125M family)
- **Healthcare**: Master Affiliation → Facility Agreement → Physician Agreement hierarchies
- **Construction**: Prime Contract → Subcontract → Trade Agreement → Amendment chains ($85M)
- **Financial Services**: Master Trading Agreement → Product Schedule → Transaction Confirmation frameworks
- **Multi-Tier Examples**: Real contract data demonstrating 4+ level hierarchies across industries

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: CSS3 with custom design system
- **Build Tool**: Create React App
- **Data**: JSON-based document structure definitions
- **Documents**: Sample contract templates demonstrating various industry patterns in Word/PDF formats

## 📦 Installation

```bash
# Clone the repository
git clone [repository-url]
cd contract-relationships

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 🗂️ Project Structure

```
src/
├── components/           # React components
│   ├── Homepage.tsx     # Landing page with family overview
│   ├── ContractHierarchy.tsx  # Main contract visualization
│   ├── EnhancedContractDetails.tsx  # Detailed contract view
│   └── Tooltip.tsx      # Interactive help tooltips
├── data/                # Contract data files
│   ├── combinedContractData.ts  # Main data orchestrator
│   ├── industryData.ts  # Industry-specific examples
│   ├── contractFamilyData.ts    # Real contract families
│   └── sampleData.ts    # Basic examples
├── types.ts             # TypeScript interfaces
└── App.css             # Styling and design system

contracts/              # Sample contract documents
├── MSA-Enterprise-Software-Solutions.docx
├── SOW-Cloud-Infrastructure-Migration-Phase1.docx
├── CO-001-Additional-Security-Compliance.docx
└── Amendment-001-Extended-Compliance-Testing.docx
```

## 📋 Data Architecture

### Inbound Document Structure (Raw Data Feed)

The system receives individual documents as a flat array, each with this structure:

```typescript
interface RawContractData {
  // === CORE IDENTITY ===
  id: string;                           // UUID for document
  title: string;                        // Document display name  
  file_name: string;                    // Original filename
  type: string;                         // Document type (Msa, Sow, ChangeOrder, etc.)
  category: string;                     // Business category
  status: "COMPLETE" | "DRAFT" | "IN_PROGRESS";
  review_status: "PENDING" | "APPROVED" | "REJECTED";
  
  // === PARTIES ===
  parties: Array<{
    id: string;
    name_in_agreement: string;
  }>;
  
  // === FINANCIAL & LEGAL PROVISIONS ===
  provisions: {
    effective_date?: string;            // ISO date string
    expiration_date?: string;           // ISO date string
    governing_law?: string;
    jurisdiction?: string;
    total_agreement_value?: number;     // Contract value
    total_agreement_value_currency_code?: string;
    payment_terms_due_date?: string;    // THIRTY_DAYS, FORTY_FIVE_DAYS, etc.
    renewal_notice_date?: string;
    termination_period_for_convenience?: string;
    // ... many other provision fields
  };
  
  // === HIERARCHY CONSTRUCTION ===
  custom_provisions: {
    c_ParentContractNumber?: string;    // 🔑 KEY FIELD: Links to parent document
    c_ParentContractEffectiveDate?: string;
    c_MSANumber?: string;               // Reference to root MSA
    c_MSAEffectiveDate?: string;
    c_GovernmentContract?: string;
    // ... other custom fields
  };
  
  // === METADATA ===
  languages: string[];
  source_name: string;
  metadata: {
    created_at: string;
    created_by: string;
    modified_at: string;
    modified_by: string;
  };
}
```

### Hierarchy Construction Process

The application transforms flat document arrays into hierarchical families:

```typescript
// Input: Flat array of individual documents
const rawDocuments = [
  {
    id: "msa-001",
    title: "Master Service Agreement MSA-99119", 
    type: "Msa",
    custom_provisions: {}  // No parent = root document
  },
  {
    id: "sow-001", 
    title: "Statement of Work SOW-45723",
    type: "Sow",
    custom_provisions: {
      c_ParentContractNumber: "MSA-99119",  // 🔑 Links to parent
      c_MSANumber: "MSA-99119"
    }
  },
  {
    id: "co-001",
    title: "Change Order CO-001", 
    type: "ChangeOrder",
    custom_provisions: {
      c_ParentContractNumber: "SOW-45723"  // 🔑 Links to SOW parent
    }
  }
];

// Output: Hierarchical family structure
const contractFamily = buildHierarchy(rawDocuments);
```

### Family Metrics Aggregation

From the flat document array, the system calculates:

```typescript
interface ContractFamily {
  id: string;                    // Derived from root document number
  masterAgreement: ContractData; // Root document (no c_ParentContractNumber)
  familyMetrics: {               // Calculated from all related documents
    totalFamilyValue: number;    // Sum of provisions.total_agreement_value
    totalContracts: number;      // Count of all documents in hierarchy
    activeSowCount: number;      // Count of active Level 2 documents
    avgRiskLevel: string;        // Assessed based on values and compliance
    familySpan: {
      start: string;             // Min provisions.effective_date
      end?: string;              // Max provisions.expiration_date  
    }
  };
  governanceFramework: {         // Inherited from root document
    governingLaw: string;        // From root provisions.governing_law
    jurisdiction: string;        // From root provisions.jurisdiction
    defaultPaymentTerms: string; // From root provisions.payment_terms_due_date
    complianceFlags: string[];   // Aggregated custom_provisions flags
  };
  businessContext: {
    parties: ContractParty[];    // From root document parties
    relationshipType: string;    // Derived from document types and values
    industryCategory: string;    // From document category
  };
}
```

### Key Construction Rules

1. **Root Document Identification**: Documents without `c_ParentContractNumber` are Level 1 (root)
2. **Parent-Child Linking**: `c_ParentContractNumber` value matches title or contract number of parent
3. **Recursive Nesting**: Process continues through multiple levels (SOW → Change Order → Amendment)
4. **Term Inheritance**: Child documents inherit governance from root, can override specific provisions
5. **Aggregation**: Family metrics calculated across entire hierarchy tree

### Data Transformation Pipeline

```typescript
// Step 1: Ingest flat document array
const rawDocuments: RawContractData[] = await fetchDocuments();

// Step 2: Group documents by family (using c_MSANumber or root document detection)
const documentFamilies = groupByFamily(rawDocuments);

// Step 3: Build hierarchical structure using c_ParentContractNumber
const hierarchicalFamilies = documentFamilies.map(docs => {
  const root = docs.find(d => !d.custom_provisions.c_ParentContractNumber);
  const children = buildChildHierarchy(docs, root.title);
  return { root, children };
});

// Step 4: Calculate family metrics and create presentation structure
const contractFamilies = hierarchicalFamilies.map(family => ({
  id: extractFamilyId(family.root),
  masterAgreement: transformToContractData(family.root),
  familyMetrics: calculateMetrics(family.allDocuments),
  governanceFramework: extractGovernance(family.root),
  businessContext: extractBusinessContext(family.root),
  children: transformChildren(family.children)
}));

// Step 5: Present in UI with interactive hierarchy
render(<ContractHierarchy families={contractFamilies} />);
```

This transformation enables any contract management system to feed raw document data into the visualization, regardless of industry or document types.

## 🎯 Use Cases

### Document/Contract Managers
- Visualize multi-level document relationships across any industry
- Track compliance requirements across hierarchies
- Monitor document values and risk levels
- Manage renewal dates and milestones regardless of document type

### Legal Teams
- Understand term inheritance patterns in any contract structure
- Review governance frameworks across different industries
- Track liability and compliance obligations
- Analyze document amendment/modification chains

### Business Stakeholders
- Assess relationships and classifications (vendors, partners, affiliates, etc.)
- Review performance metrics and SLAs
- Understand industry-specific document structures
- Evaluate risk profiles across document families

### Industry-Specific Applications
- **Healthcare**: Visualize provider network agreements and physician relationships
- **Financial Services**: Track trading agreement hierarchies and derivative structures
- **Construction**: Monitor prime contractor and subcontractor relationships
- **Manufacturing**: Understand supply chain contract dependencies

## 📄 Sample Documents

The `/contracts` folder contains fully-formed contract documents that demonstrate how real document language maps to the data structures. These documents include:

- Precise contract language designed for data extraction
- Hierarchical references between documents at different levels
- Industry-standard terms and conditions
- Compliance and risk assessment criteria
- Examples of how any document type can establish governance frameworks that cascade through hierarchies

## 🚀 Getting Started

1. **Explore the Homepage**: Browse different document family examples across industries
2. **Select a Family**: Click on any industry example to see their specific hierarchy structure
3. **Navigate the Tree**: Use the left sidebar to explore multi-level document relationships
4. **View Details**: Click documents to see detailed information and inheritance patterns
5. **Learn from Tooltips**: Hover over risk levels and terms for explanations
6. **Compare Industries**: Notice how different industries use different terminology but similar structural patterns

## Available Scripts

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
The build is minified and optimized for the best performance.

## 🤝 Contributing

This project serves as a demonstration of multi-level document relationship modeling. To contribute:

1. Fork the repository
2. Create a feature branch
3. Add new industry examples with their specific document hierarchies
4. Enhance existing functionality to support additional document types
5. Submit a pull request

**Adding New Industries:**
- Define the document hierarchy structure specific to your industry
- Create sample data following the existing patterns
- Add appropriate terminology and compliance requirements
- Update the homepage descriptions with industry-specific language

## 📝 License

[License information]

## 🆘 Support

For questions about document structures or data modeling patterns, please review the sample documents in the `/contracts` folder or examine the data structures in `/src/data`. The system is designed to be adaptable to any industry's document hierarchy needs.

---

*Built to demonstrate flexible multi-level document relationship management and cross-industry data visualization patterns.*
