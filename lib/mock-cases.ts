import type { Case } from './types';

export const mockCases: Case[] = [
  // Case 1: BRCA1 Pathogenic - Delivered
  {
    id: 'case-001',
    patientId: 'PT-2024-00147',
    age: 42,
    sex: 'Female',
    indication: 'Family history of breast and ovarian cancer. Mother diagnosed with breast cancer at age 45, maternal aunt with ovarian cancer at age 52.',
    referringClinician: 'Dr. Sarah Chen',
    sampleDate: '2024-01-08',
    submittedAt: '2024-01-10T09:23:00Z',
    genePanel: 'BRCA1/2',
    priority: 'Urgent',
    status: 'Delivered',
    workflowId: 'wf_brca1_a7x92k',
    signingClinician: 'Dr. Michael Torres',
    deliveredAt: '2024-01-12T16:45:00Z',
    pipelineSteps: [
      { stage: 'ingestion', status: 'completed', startedAt: '2024-01-10T09:23:00Z', completedAt: '2024-01-10T09:25:12Z', duration: '2m 12s' },
      { stage: 'qc', status: 'completed', startedAt: '2024-01-10T09:25:12Z', completedAt: '2024-01-10T09:31:45Z', duration: '6m 33s' },
      { stage: 'alphagenome', status: 'completed', startedAt: '2024-01-10T09:31:45Z', completedAt: '2024-01-10T10:15:22Z', duration: '43m 37s' },
      { stage: 'annotation', status: 'completed', startedAt: '2024-01-10T10:15:22Z', completedAt: '2024-01-10T10:23:08Z', duration: '7m 46s' },
      { stage: 'ai_summary', status: 'completed', startedAt: '2024-01-10T10:23:08Z', completedAt: '2024-01-10T10:25:33Z', duration: '2m 25s' },
      { stage: 'awaiting_review', status: 'completed', startedAt: '2024-01-10T10:25:33Z', completedAt: '2024-01-12T16:45:00Z', duration: '2d 6h' },
    ],
    variants: [
      {
        id: 'var-001-1',
        coordinates: 'chr17:43092919 C>T',
        gene: 'BRCA1',
        transcript: 'NM_007294.4',
        consequence: 'Nonsense (p.Arg1443Ter)',
        alphaGenomeScore: 0.98,
        clinvarClassification: 'Pathogenic',
        gnomadFrequency: '0.00002',
        claudeClassification: 'Pathogenic',
        evidenceReasoning: 'This nonsense variant in BRCA1 (c.4327C>T, p.Arg1443Ter) introduces a premature stop codon in exon 13, leading to a truncated protein lacking critical C-terminal domains including the BRCT repeats essential for DNA damage repair. Multiple lines of evidence support pathogenicity: (1) ClinVar reports this variant as Pathogenic with 5 submissions from clinical laboratories; (2) The variant is absent from population databases (gnomAD frequency 0.00002), consistent with strong negative selection; (3) AlphaGenome structural analysis predicts complete loss of the BRCT domain interface; (4) Functional studies demonstrate loss of homologous recombination activity. This variant meets ACMG criteria PVS1 (null variant in gene where LOF is a known mechanism), PS4 (increased prevalence in affected individuals), PM2 (absent from controls), and PP5 (reputable source reports pathogenic).',
        acmgCriteria: ['PVS1', 'PS4', 'PM2', 'PP5'],
      },
    ],
    aiSummary: {
      clinicalNarrative: `This analysis identified a pathogenic variant in BRCA1 (c.4327C>T, p.Arg1443Ter) in a 42-year-old female patient with significant family history of breast and ovarian cancer. The variant introduces a premature stop codon resulting in a truncated protein lacking functional BRCT domains.

The identified variant has been classified as Pathogenic based on multiple independent lines of evidence including population frequency data, computational predictions, and published functional studies. ClinVar aggregates five independent submissions classifying this variant as Pathogenic, with concordant interpretations from major clinical laboratories.

Given this finding, the patient meets criteria for Hereditary Breast and Ovarian Cancer syndrome (HBOC). Current NCCN guidelines recommend enhanced breast surveillance with annual mammography and breast MRI starting at age 25-29, discussion of risk-reducing mastectomy, risk-reducing salpingo-oophorectomy by age 35-40, and consideration of chemoprevention. Cascade genetic testing should be offered to at-risk relatives.`,
      keyFindings: [
        'Pathogenic BRCA1 variant identified: c.4327C>T (p.Arg1443Ter)',
        'Nonsense variant causing premature protein truncation',
        'Patient meets criteria for HBOC syndrome',
        'Recommend enhanced surveillance and discussion of risk-reducing surgery',
        'Cascade testing recommended for first-degree relatives',
      ],
      reviewedBy: 'Dr. Michael Torres',
      generatedAt: '2024-01-10T10:25:33Z',
    },
  },

  // Case 2: CFTR Splice Variant - Awaiting Review
  {
    id: 'case-002',
    patientId: 'PT-2024-00183',
    age: 8,
    sex: 'Male',
    indication: 'Recurrent pulmonary infections, elevated sweat chloride (68 mmol/L), failure to thrive. Clinical suspicion of cystic fibrosis.',
    referringClinician: 'Dr. James Wilson',
    sampleDate: '2024-01-14',
    submittedAt: '2024-01-15T11:07:00Z',
    genePanel: 'Cystic Fibrosis',
    priority: 'Urgent',
    status: 'Awaiting review',
    workflowId: 'wf_cftr_b3m71p',
    pipelineSteps: [
      { stage: 'ingestion', status: 'completed', startedAt: '2024-01-15T11:07:00Z', completedAt: '2024-01-15T11:08:45Z', duration: '1m 45s' },
      { stage: 'qc', status: 'completed', startedAt: '2024-01-15T11:08:45Z', completedAt: '2024-01-15T11:14:22Z', duration: '5m 37s' },
      { stage: 'alphagenome', status: 'completed', startedAt: '2024-01-15T11:14:22Z', completedAt: '2024-01-15T11:58:10Z', duration: '43m 48s' },
      { stage: 'annotation', status: 'completed', startedAt: '2024-01-15T11:58:10Z', completedAt: '2024-01-15T12:05:33Z', duration: '7m 23s' },
      { stage: 'ai_summary', status: 'completed', startedAt: '2024-01-15T12:05:33Z', completedAt: '2024-01-15T12:07:58Z', duration: '2m 25s' },
      { stage: 'awaiting_review', status: 'active', startedAt: '2024-01-15T12:07:58Z' },
    ],
    variants: [
      {
        id: 'var-002-1',
        coordinates: 'chr7:117559590 delCTT',
        gene: 'CFTR',
        transcript: 'NM_000492.4',
        consequence: 'In-frame deletion (p.Phe508del)',
        alphaGenomeScore: 0.96,
        clinvarClassification: 'Pathogenic',
        gnomadFrequency: '0.0108',
        claudeClassification: 'Pathogenic',
        evidenceReasoning: 'The p.Phe508del variant (c.1521_1523delCTT) is the most common cystic fibrosis-causing variant worldwide, accounting for approximately 70% of CF alleles. This in-frame deletion removes phenylalanine at position 508 in the first nucleotide-binding domain (NBD1), causing protein misfolding, impaired chloride channel function, and rapid degradation. The variant is definitively established as pathogenic through decades of clinical correlation, functional studies, and population data. CFTR modulators (elexacaftor/tezacaftor/ivacaftor) have demonstrated significant clinical benefit for patients with at least one F508del allele.',
        acmgCriteria: ['PS3', 'PS4', 'PP5'],
      },
      {
        id: 'var-002-2',
        coordinates: 'chr7:117587811 G>A',
        gene: 'CFTR',
        transcript: 'NM_000492.4',
        consequence: 'Splice donor (c.1585-1G>A)',
        alphaGenomeScore: 0.89,
        clinvarClassification: 'Pathogenic',
        gnomadFrequency: '0.00008',
        claudeClassification: 'Pathogenic',
        evidenceReasoning: 'This canonical splice site variant (c.1585-1G>A) disrupts the invariant splice acceptor site at the intron 10/exon 11 boundary. AlphaGenome predicts complete loss of normal splicing with activation of a cryptic splice site leading to exon skipping. RNA studies in the literature confirm aberrant splicing resulting in a frameshift and premature termination. The variant is extremely rare in population databases and has been reported in compound heterozygosity with other pathogenic CFTR variants in patients with classic cystic fibrosis.',
        acmgCriteria: ['PVS1', 'PM2', 'PP5'],
      },
    ],
    aiSummary: {
      clinicalNarrative: `This analysis of an 8-year-old male patient with clinical features suggestive of cystic fibrosis has identified two pathogenic variants in the CFTR gene in trans, confirming a molecular diagnosis of Cystic Fibrosis.

The patient is compound heterozygous for the common p.Phe508del variant (c.1521_1523delCTT) and a rare canonical splice site variant (c.1585-1G>A). The p.Phe508del variant is the most prevalent CF-causing variant globally and results in CFTR protein misfolding and degradation. The splice site variant disrupts normal mRNA processing at the intron 10/exon 11 boundary, predicted to cause exon skipping and premature protein truncation.

Given the presence of at least one F508del allele, this patient is eligible for CFTR modulator therapy with elexacaftor/tezacaftor/ivacaftor (Trikafta), which has demonstrated significant improvement in lung function and nutritional status in clinical trials. Multidisciplinary CF care including pulmonology, gastroenterology, and nutrition should be coordinated through an accredited CF center.`,
      keyFindings: [
        'Compound heterozygous pathogenic CFTR variants identified',
        'p.Phe508del (c.1521_1523delCTT) - most common CF variant',
        'c.1585-1G>A canonical splice site variant',
        'Molecular diagnosis of Cystic Fibrosis confirmed',
        'Patient eligible for Trikafta (elexacaftor/tezacaftor/ivacaftor) therapy',
      ],
      generatedAt: '2024-01-15T12:07:58Z',
    },
  },

  // Case 3: Cardiomyopathy VUS - Awaiting Review
  {
    id: 'case-003',
    patientId: 'PT-2024-00201',
    age: 35,
    sex: 'Male',
    indication: 'Dilated cardiomyopathy diagnosed at age 33. Left ventricular ejection fraction 35%. No family history of sudden cardiac death. Presenting with progressive dyspnea on exertion.',
    referringClinician: 'Dr. Emily Rodriguez',
    sampleDate: '2024-01-16',
    submittedAt: '2024-01-17T08:42:00Z',
    genePanel: 'Cardiomyopathy',
    priority: 'Routine',
    status: 'Awaiting review',
    workflowId: 'wf_cardio_c9k45r',
    pipelineSteps: [
      { stage: 'ingestion', status: 'completed', startedAt: '2024-01-17T08:42:00Z', completedAt: '2024-01-17T08:44:22Z', duration: '2m 22s' },
      { stage: 'qc', status: 'completed', startedAt: '2024-01-17T08:44:22Z', completedAt: '2024-01-17T08:51:05Z', duration: '6m 43s' },
      { stage: 'alphagenome', status: 'completed', startedAt: '2024-01-17T08:51:05Z', completedAt: '2024-01-17T09:35:41Z', duration: '44m 36s' },
      { stage: 'annotation', status: 'completed', startedAt: '2024-01-17T09:35:41Z', completedAt: '2024-01-17T09:43:18Z', duration: '7m 37s' },
      { stage: 'ai_summary', status: 'completed', startedAt: '2024-01-17T09:43:18Z', completedAt: '2024-01-17T09:45:40Z', duration: '2m 22s' },
      { stage: 'awaiting_review', status: 'active', startedAt: '2024-01-17T09:45:40Z' },
    ],
    variants: [
      {
        id: 'var-003-1',
        coordinates: 'chr14:23431468 C>T',
        gene: 'MYH7',
        transcript: 'NM_000257.4',
        consequence: 'Missense (p.Arg1045Cys)',
        alphaGenomeScore: 0.72,
        clinvarClassification: 'Uncertain significance',
        gnomadFrequency: '0.00004',
        claudeClassification: 'VUS',
        evidenceReasoning: 'This missense variant (c.3133C>T, p.Arg1045Cys) in MYH7 affects a moderately conserved residue in the myosin rod domain. The variant is rare in population databases (gnomAD frequency 0.00004), which is consistent with but not sufficient for pathogenicity. ClinVar reports this variant as Uncertain Significance with conflicting interpretations. AlphaGenome predicts moderate structural perturbation with a score of 0.72, below the threshold typically associated with definitive pathogenicity. While MYH7 variants are a well-established cause of cardiomyopathy, this specific variant lacks sufficient functional evidence or segregation data for a more definitive classification. Periodic reassessment is recommended as additional evidence accrues.',
        acmgCriteria: ['PM2', 'PP3', 'BP1'],
      },
      {
        id: 'var-003-2',
        coordinates: 'chr1:237778237 G>A',
        gene: 'LMNA',
        transcript: 'NM_170707.4',
        consequence: 'Synonymous (p.Ser143=)',
        alphaGenomeScore: 0.15,
        clinvarClassification: 'Benign',
        gnomadFrequency: '0.0234',
        claudeClassification: 'Benign',
        evidenceReasoning: 'This synonymous variant (c.429G>A, p.Ser143=) does not alter the encoded amino acid and is relatively common in population databases (gnomAD frequency 2.34%). Computational splice predictors do not indicate any effect on splicing. This variant is classified as Benign per ACMG guidelines.',
        acmgCriteria: ['BA1'],
      },
    ],
    aiSummary: {
      clinicalNarrative: `Genetic testing of a 35-year-old male patient with dilated cardiomyopathy identified a variant of uncertain significance (VUS) in MYH7 and a benign variant in LMNA. No pathogenic or likely pathogenic variants were identified in the cardiomyopathy gene panel.

The MYH7 variant (c.3133C>T, p.Arg1045Cys) is a missense change affecting the myosin rod domain. While MYH7 is a well-established cardiomyopathy gene, this specific variant has insufficient evidence for a definitive pathogenic classification. The variant is rare in population databases and computational tools predict moderate functional impact, but there are conflicting interpretations in ClinVar and a lack of published functional studies or segregation data.

At this time, clinical management should not be altered based solely on this VUS finding. The patient\'s dilated cardiomyopathy may have a genetic etiology that is not detectable with current testing methodology, may be caused by this VUS, or may have a non-genetic cause. Family screening with echocardiography is recommended regardless of genetic findings given the diagnosis of DCM. Periodic variant reclassification review is advised.`,
      keyFindings: [
        'VUS identified in MYH7: c.3133C>T (p.Arg1045Cys)',
        'No pathogenic or likely pathogenic variants detected',
        'Clinical management should not be altered based on VUS alone',
        'Recommend cardiac screening for first-degree relatives',
        'Periodic variant reclassification review advised',
      ],
      generatedAt: '2024-01-17T09:45:40Z',
    },
  },

  // Case 4: Pending AI Summary
  {
    id: 'case-004',
    patientId: 'PT-2024-00215',
    age: 56,
    sex: 'Female',
    indication: 'Personal history of ovarian cancer at age 54. Requesting hereditary cancer panel to inform treatment decisions and family risk assessment.',
    referringClinician: 'Dr. Amanda Foster',
    sampleDate: '2024-01-18',
    submittedAt: '2024-01-18T14:15:00Z',
    genePanel: 'Comprehensive Cancer',
    priority: 'Stat',
    status: 'In progress',
    workflowId: 'wf_cancer_d2n83s',
    pipelineSteps: [
      { stage: 'ingestion', status: 'completed', startedAt: '2024-01-18T14:15:00Z', completedAt: '2024-01-18T14:17:08Z', duration: '2m 8s' },
      { stage: 'qc', status: 'completed', startedAt: '2024-01-18T14:17:08Z', completedAt: '2024-01-18T14:23:45Z', duration: '6m 37s' },
      { stage: 'alphagenome', status: 'completed', startedAt: '2024-01-18T14:23:45Z', completedAt: '2024-01-18T15:08:22Z', duration: '44m 37s' },
      { stage: 'annotation', status: 'completed', startedAt: '2024-01-18T15:08:22Z', completedAt: '2024-01-18T15:15:59Z', duration: '7m 37s' },
      { stage: 'ai_summary', status: 'active', startedAt: '2024-01-18T15:15:59Z' },
      { stage: 'awaiting_review', status: 'pending' },
    ],
    variants: [
      {
        id: 'var-004-1',
        coordinates: 'chr17:43045726 A>G',
        gene: 'BRCA1',
        transcript: 'NM_007294.4',
        consequence: 'Missense (p.Met1628Thr)',
        alphaGenomeScore: 0.45,
        clinvarClassification: 'Likely benign',
        gnomadFrequency: '0.0089',
        claudeClassification: 'Likely benign',
        evidenceReasoning: 'Pending AI summary generation...',
        acmgCriteria: ['BS1', 'BP4'],
      },
    ],
    aiSummary: undefined,
  },

  // Case 5: In Progress (AlphaGenome running)
  {
    id: 'case-005',
    patientId: 'PT-2024-00228',
    age: 28,
    sex: 'Male',
    indication: 'Family history of Long QT syndrome. Father with ICD placement. Preconception genetic counseling.',
    referringClinician: 'Dr. Robert Kim',
    sampleDate: '2024-01-19',
    submittedAt: '2024-01-19T10:33:00Z',
    genePanel: 'Arrhythmia',
    priority: 'Routine',
    status: 'In progress',
    workflowId: 'wf_arrhy_e5p29t',
    pipelineSteps: [
      { stage: 'ingestion', status: 'completed', startedAt: '2024-01-19T10:33:00Z', completedAt: '2024-01-19T10:35:12Z', duration: '2m 12s' },
      { stage: 'qc', status: 'completed', startedAt: '2024-01-19T10:35:12Z', completedAt: '2024-01-19T10:41:48Z', duration: '6m 36s' },
      { stage: 'alphagenome', status: 'active', startedAt: '2024-01-19T10:41:48Z' },
      { stage: 'annotation', status: 'pending' },
      { stage: 'ai_summary', status: 'pending' },
      { stage: 'awaiting_review', status: 'pending' },
    ],
    variants: [],
    aiSummary: undefined,
  },

  // Case 6: Lynch Syndrome - Under Review
  {
    id: 'case-006',
    patientId: 'PT-2024-00142',
    age: 47,
    sex: 'Female',
    indication: 'Colorectal cancer diagnosed at age 45 with MSI-high tumor. Multiple polyps on colonoscopy. Brother with endometrial cancer.',
    referringClinician: 'Dr. Thomas Wright',
    sampleDate: '2024-01-05',
    submittedAt: '2024-01-06T09:15:00Z',
    genePanel: 'Lynch Syndrome',
    priority: 'Urgent',
    status: 'Under review',
    workflowId: 'wf_lynch_f8q63u',
    pipelineSteps: [
      { stage: 'ingestion', status: 'completed', startedAt: '2024-01-06T09:15:00Z', completedAt: '2024-01-06T09:17:22Z', duration: '2m 22s' },
      { stage: 'qc', status: 'completed', startedAt: '2024-01-06T09:17:22Z', completedAt: '2024-01-06T09:24:05Z', duration: '6m 43s' },
      { stage: 'alphagenome', status: 'completed', startedAt: '2024-01-06T09:24:05Z', completedAt: '2024-01-06T10:08:41Z', duration: '44m 36s' },
      { stage: 'annotation', status: 'completed', startedAt: '2024-01-06T10:08:41Z', completedAt: '2024-01-06T10:16:18Z', duration: '7m 37s' },
      { stage: 'ai_summary', status: 'completed', startedAt: '2024-01-06T10:16:18Z', completedAt: '2024-01-06T10:18:45Z', duration: '2m 27s' },
      { stage: 'awaiting_review', status: 'active', startedAt: '2024-01-06T10:18:45Z' },
    ],
    variants: [
      {
        id: 'var-006-1',
        coordinates: 'chr2:47693823 dupA',
        gene: 'MSH2',
        transcript: 'NM_000251.3',
        consequence: 'Frameshift (p.Asn596LysfsTer5)',
        alphaGenomeScore: 0.97,
        clinvarClassification: 'Pathogenic',
        gnomadFrequency: '0',
        claudeClassification: 'Pathogenic',
        evidenceReasoning: 'This frameshift variant in MSH2 (c.1786dupA, p.Asn596LysfsTer5) introduces a single nucleotide duplication in exon 12, resulting in a frameshift and premature stop codon 5 codons downstream. The truncated protein lacks the C-terminal domain essential for heterodimerization with MSH6 and DNA mismatch repair function. This variant is absent from population databases (gnomAD = 0), consistent with strong negative selection. ClinVar classifies this variant as Pathogenic with 4 concordant submissions. The variant meets ACMG criteria PVS1 (null variant in a gene where LOF is a known mechanism of disease), PM2 (absent from controls), and PP5 (reputable sources report pathogenic).',
        acmgCriteria: ['PVS1', 'PM2', 'PP5'],
      },
      {
        id: 'var-006-2',
        coordinates: 'chr2:47702283 C>T',
        gene: 'MSH2',
        transcript: 'NM_000251.3',
        consequence: 'Synonymous (p.Pro622=)',
        alphaGenomeScore: 0.08,
        clinvarClassification: 'Benign',
        gnomadFrequency: '0.0412',
        claudeClassification: 'Benign',
        evidenceReasoning: 'This synonymous variant does not change the encoded amino acid and is common in population databases (gnomAD frequency 4.12%). No splicing abnormalities are predicted. Classified as Benign per ACMG BA1 criterion.',
        acmgCriteria: ['BA1'],
      },
    ],
    aiSummary: {
      clinicalNarrative: `Genetic analysis of a 47-year-old female patient with MSI-high colorectal cancer has identified a pathogenic frameshift variant in MSH2, establishing a molecular diagnosis of Lynch syndrome (Hereditary Nonpolyposis Colorectal Cancer).

The identified variant (c.1786dupA, p.Asn596LysfsTer5) is a single nucleotide duplication causing a frameshift and premature protein truncation. This results in loss of the critical C-terminal domain required for mismatch repair function. The variant is absent from population databases and has been classified as Pathogenic by multiple clinical laboratories in ClinVar.

Lynch syndrome confers significantly elevated lifetime risks for colorectal cancer (50-80%), endometrial cancer (25-60%), ovarian cancer (4-12%), and other malignancies. NCCN guidelines recommend colonoscopy every 1-2 years beginning at age 20-25, consideration of hysterectomy and bilateral salpingo-oophorectomy after childbearing is complete, and annual gynecologic evaluation. The MSI-high tumor status may indicate eligibility for immune checkpoint inhibitor therapy. Cascade genetic testing should be offered to all first-degree relatives.`,
      keyFindings: [
        'Pathogenic MSH2 variant identified: c.1786dupA (p.Asn596LysfsTer5)',
        'Frameshift causing premature protein truncation',
        'Diagnosis of Lynch syndrome confirmed',
        'Elevated lifetime cancer risks for multiple organ systems',
        'Cascade testing recommended for relatives',
        'Consider immune checkpoint inhibitor therapy eligibility',
      ],
      generatedAt: '2024-01-06T10:18:45Z',
    },
  },
];

export function getCaseById(id: string): Case | undefined {
  return mockCases.find(c => c.id === id);
}

export function getCasesByStatus(status: Case['status']): Case[] {
  return mockCases.filter(c => c.status === status);
}

export function getActiveCases(): Case[] {
  return mockCases.filter(c => c.status !== 'Delivered');
}

export function getDeliveredCases(): Case[] {
  return mockCases.filter(c => c.status === 'Delivered');
}

export function getStats() {
  const pendingReview = mockCases.filter(c => c.status === 'Awaiting review' || c.status === 'Under review').length;
  // Realistic VCF files contain thousands of variants per sample
  const variantsThisWeek = '2,847';
  const totalVariants = '1.2M';
  const avgTurnaround = '1.8 days';
  
  return {
    pendingReview,
    variantsThisWeek,
    totalVariants,
    avgTurnaround,
  };
}
