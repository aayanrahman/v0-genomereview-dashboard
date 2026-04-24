export type PipelineStage = 
  | 'ingestion'
  | 'qc'
  | 'alphagenome'
  | 'annotation'
  | 'ai_summary'
  | 'awaiting_review';

export type PipelineStageStatus = 'pending' | 'active' | 'completed';

export interface PipelineStep {
  stage: PipelineStage;
  status: PipelineStageStatus;
  startedAt?: string;
  completedAt?: string;
  duration?: string;
}

export type Classification = 
  | 'Pathogenic'
  | 'Likely pathogenic'
  | 'VUS'
  | 'Likely benign'
  | 'Benign';

export type CaseStatus = 
  | 'In progress'
  | 'Awaiting review'
  | 'Under review'
  | 'Delivered';

export interface Variant {
  id: string;
  coordinates: string;
  gene: string;
  transcript: string;
  consequence: string;
  alphaGenomeScore: number;
  clinvarClassification: string;
  gnomadFrequency: string;
  claudeClassification: Classification;
  evidenceReasoning: string;
  acmgCriteria: string[];
}

export interface AISummary {
  clinicalNarrative: string;
  keyFindings: string[];
  reviewedBy?: string;
  generatedAt: string;
}

export interface Case {
  id: string;
  patientId: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  indication: string;
  referringClinician: string;
  sampleDate: string;
  submittedAt: string;
  genePanel: string;
  priority: 'Routine' | 'Urgent' | 'Stat';
  status: CaseStatus;
  pipelineSteps: PipelineStep[];
  variants: Variant[];
  aiSummary?: AISummary;
  workflowId: string;
  signingClinician?: string;
  deliveredAt?: string;
}

export interface GenePanel {
  id: string;
  name: string;
  genes: string[];
}

export const PIPELINE_STAGES: { stage: PipelineStage; label: string }[] = [
  { stage: 'ingestion', label: 'Ingestion' },
  { stage: 'qc', label: 'QC' },
  { stage: 'alphagenome', label: 'AlphaGenome' },
  { stage: 'annotation', label: 'Annotation' },
  { stage: 'ai_summary', label: 'AI Summary' },
  { stage: 'awaiting_review', label: 'Awaiting Review' },
];

export const GENE_PANELS: GenePanel[] = [
  { 
    id: 'brca', 
    name: 'BRCA1/2', 
    genes: ['BRCA1', 'BRCA2'] 
  },
  { 
    id: 'cardio', 
    name: 'Cardiomyopathy', 
    genes: ['MYH7', 'MYBPC3', 'TNNT2', 'TNNI3', 'TPM1', 'ACTC1', 'MYL2', 'MYL3', 'LMNA', 'PLN'] 
  },
  { 
    id: 'cf', 
    name: 'Cystic Fibrosis', 
    genes: ['CFTR'] 
  },
  { 
    id: 'lynch', 
    name: 'Lynch Syndrome', 
    genes: ['MLH1', 'MSH2', 'MSH6', 'PMS2', 'EPCAM'] 
  },
  { 
    id: 'comprehensive', 
    name: 'Comprehensive Cancer', 
    genes: ['BRCA1', 'BRCA2', 'TP53', 'PTEN', 'STK11', 'CDH1', 'PALB2', 'CHEK2', 'ATM', 'NBN'] 
  },
  { 
    id: 'arrhythmia', 
    name: 'Arrhythmia', 
    genes: ['SCN5A', 'KCNQ1', 'KCNH2', 'RYR2', 'CASQ2', 'CALM1', 'CALM2', 'CALM3'] 
  },
];
