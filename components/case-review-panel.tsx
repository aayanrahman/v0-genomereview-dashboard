'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VariantsTable } from '@/components/variants-table';
import { ClinicalNarrative } from '@/components/clinical-narrative';
import { Card } from '@/components/ui/card';
import { FileText, Dna, BookOpen, Database, Loader2, Clock, Heart } from 'lucide-react';
import { AISummaryStreaming } from '@/components/streaming-narrative';
import { CaseHistoryTimeline, calculateVariantDelta, LongitudinalDelta } from '@/components/longitudinal-delta';

interface Variant {
  id: string;
  gene: string;
  hgvsC: string;
  hgvsP: string | null;
  chromosome: string;
  position: number;
  refAllele: string;
  altAllele: string;
  zygosity: string;
  classification: string;
  gnomadAf: number | null;
  clinvarId: string | null;
  clinvarSignificance: string | null;
  acmgCriteria: string[];
  aiReasoning: string;
  aiConfidence: number;
  reviewed: boolean;
  reviewerNotes: string | null;
}

interface AiSummary {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  modelUsed: string;
  generatedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

interface PipelineStep {
  name: string;
  status: string;
  duration?: string;
  output?: Record<string, unknown>;
}

interface CaseHistoryEntry {
  caseId: string;
  date: string;
  pathogenicCount: number;
  totalVariants: number;
}

interface CaseData {
  id: string;
  patientName: string;
  mrn: string;
  workflowId: string;
  genePanel: string;
  genePanelArray: string[];
  status: string;
  rawStatus: string;
  variants: Variant[];
  pipelineSteps: PipelineStep[];
  aiSummary: AiSummary | null;
}

interface CaseReviewPanelProps {
  caseData: CaseData;
  priorVariants?: { gene: string; hgvs_c: string; classification: string }[];
  caseHistory?: CaseHistoryEntry[];
  hasPriorCases?: boolean;
}

export function CaseReviewPanel({ caseData, priorVariants = [], caseHistory = [], hasPriorCases = false }: CaseReviewPanelProps) {
  const isLoading = caseData.rawStatus === 'in_progress' || caseData.rawStatus === 'pending';
  const isGeneratingSummary = isLoading && caseData.pipelineSteps.find(s => s.name === 'Report Generation')?.status === 'running';

  // Calculate deltas for variants
  const variantsWithDeltas = caseData.variants.map(v => {
    const delta = priorVariants.length > 0 
      ? calculateVariantDelta(
          { gene: v.gene, hgvs_c: v.hgvsC, classification: v.classification },
          priorVariants
        )
      : null;
    return { ...v, delta };
  });

  return (
    <Tabs defaultValue="variants" className="w-full">
      <TabsList className="mb-4 w-full justify-start gap-1 bg-muted/30 p-1">
        <TabsTrigger value="variants" className="gap-2">
          <Dna className="h-4 w-4" />
          Variants ({caseData.variants.length})
        </TabsTrigger>
        <TabsTrigger value="summary" className="gap-2">
          <FileText className="h-4 w-4" />
          AI Summary
        </TabsTrigger>
        <TabsTrigger value="patient-letter" className="gap-2">
          <Heart className="h-4 w-4" />
          Patient Letter
        </TabsTrigger>
        {hasPriorCases && (
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
        )}
        <TabsTrigger value="evidence" className="gap-2">
          <BookOpen className="h-4 w-4" />
          Evidence
        </TabsTrigger>
        <TabsTrigger value="raw" className="gap-2">
          <Database className="h-4 w-4" />
          Raw Data
        </TabsTrigger>
      </TabsList>

      <TabsContent value="variants" className="mt-0">
        {caseData.variants.length > 0 ? (
          <VariantsTable variants={variantsWithDeltas} showDelta={hasPriorCases} />
        ) : isLoading ? (
          <Card className="border-border/50 p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-4 text-sm font-medium text-foreground">Analyzing variants...</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The pipeline is running. Variants will appear here once analysis is complete.
              </p>
            </div>
          </Card>
        ) : (
          <Card className="border-border/50 p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 rounded-full bg-muted p-3">
                <Dna className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No Variants Found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                No variants were identified in the analyzed gene panel.
              </p>
            </div>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="summary" className="mt-0">
        {caseData.aiSummary ? (
          <Card className="border-border/50 p-6">
            {isGeneratingSummary ? (
              <AISummaryStreaming summary={caseData.aiSummary} isGenerating={true} />
            ) : (
              <ClinicalNarrative summary={caseData.aiSummary} />
            )}
          </Card>
        ) : isLoading ? (
          <Card className="border-border/50 p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-4 text-sm font-medium text-foreground">Generating summary...</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Claude is analyzing the variants and generating a clinical narrative.
              </p>
            </div>
          </Card>
        ) : (
          <Card className="border-border/50 p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 rounded-full bg-muted p-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">AI Summary Not Available</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The AI summary will be generated once variant annotation is complete.
              </p>
            </div>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="patient-letter" className="mt-0">
        <Card className="border-border/50 p-6">
          {caseData.rawStatus === 'completed' || caseData.rawStatus === 'awaiting_review' ? (
            <div className="prose prose-sm max-w-none">
              <div className="rounded-lg border border-border bg-muted/20 p-6">
                <h3 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pathogenic" />
                  Patient-Friendly Letter
                </h3>
                <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                  {/* This would be populated from the generatePatientLetter step */}
                  <p className="mb-4">Dear {caseData.patientName.split(' ')[0]},</p>
                  <p className="mb-4">
                    We have completed your genetic testing and wanted to share the results with you in a way that is easy to understand.
                  </p>
                  <p className="mb-4">
                    {caseData.variants.filter(v => v.classification === 'pathogenic' || v.classification === 'likely_pathogenic').length > 0
                      ? `Our analysis found some genetic changes that are important for your health care. Specifically, we identified changes in the ${[...new Set(caseData.variants.filter(v => v.classification === 'pathogenic' || v.classification === 'likely_pathogenic').map(v => v.gene))].join(' and ')} gene(s) that may be related to your health history.`
                      : `Good news - we did not find any concerning genetic changes in the genes we tested. This is reassuring, though it's important to continue following your doctor's recommendations for regular health screenings.`
                    }
                  </p>
                  <p className="mb-4">
                    Your medical team will discuss these findings with you in detail and explain what they mean for you and your family. They may recommend additional testing or screening based on these results.
                  </p>
                  <p className="mb-4">
                    Please don&apos;t hesitate to contact our office with any questions.
                  </p>
                  <p>
                    Warm regards,<br />
                    Your Genetics Team
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 rounded-full bg-muted p-3">
                <Heart className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Patient Letter Pending</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The patient-friendly letter will be generated after the clinical report is complete.
              </p>
            </div>
          )}
        </Card>
      </TabsContent>

      {hasPriorCases && (
        <TabsContent value="history" className="mt-0">
          <Card className="border-border/50 p-6">
            <CaseHistoryTimeline history={caseHistory} currentCaseId={caseData.id} />
          </Card>
        </TabsContent>
      )}

      <TabsContent value="evidence" className="mt-0">
        <Card className="border-border/50 p-6">
          <div className="space-y-6">
            <section>
              <h3 className="mb-4 text-sm font-semibold text-foreground">External Database References</h3>
              <div className="grid gap-4">
                {caseData.variants.map((variant) => (
                  <div key={variant.id} className="rounded-lg border border-border/50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <code className="font-mono text-sm font-medium text-foreground">
                        {variant.gene}
                      </code>
                      <span className="text-muted-foreground">·</span>
                      <code className="font-mono text-xs text-muted-foreground">
                        {variant.chromosome.startsWith('chr') ? variant.chromosome : `chr${variant.chromosome}`}:{variant.position}
                      </code>
                    </div>
                    <div className="grid gap-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">ClinVar</span>
                        {variant.clinvarId ? (
                          <a 
                            href={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${variant.clinvarId.replace('VCV', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                          >
                            {variant.clinvarSignificance || 'View Entry'}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">No entry</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">gnomAD Frequency</span>
                        <code className="font-mono text-xs">
                          {variant.gnomadAf ? variant.gnomadAf.toExponential(2) : 'Not found'}
                        </code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">ACMG Criteria</span>
                        <span className="font-mono text-xs">
                          {variant.acmgCriteria.length > 0 
                            ? variant.acmgCriteria.join(', ') 
                            : 'None assigned'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {caseData.variants.length === 0 && (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    {isLoading ? 'Waiting for variants...' : 'No variants to display evidence for.'}
                  </p>
                )}
              </div>
            </section>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="raw" className="mt-0">
        <Card className="border-border/50 p-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Pipeline Output</h3>
            <pre className="overflow-auto rounded-lg bg-muted/50 p-4 text-xs font-mono text-muted-foreground max-h-96">
{JSON.stringify({
  workflowId: caseData.workflowId,
  patientMRN: caseData.mrn,
  genePanel: caseData.genePanelArray,
  variantCount: caseData.variants.length,
  pipelineSteps: caseData.pipelineSteps.map(s => ({
    name: s.name,
    status: s.status,
    duration: s.duration,
    output: s.output
  })),
  variants: caseData.variants.map(v => ({
    id: v.id,
    coordinates: `${v.chromosome.startsWith('chr') ? v.chromosome : `chr${v.chromosome}`}:${v.position}`,
    gene: v.gene,
    hgvsC: v.hgvsC,
    hgvsP: v.hgvsP,
    classification: v.classification,
    acmgCriteria: v.acmgCriteria,
    aiConfidence: v.aiConfidence
  })),
  aiSummary: caseData.aiSummary ? {
    model: caseData.aiSummary.modelUsed,
    generatedAt: caseData.aiSummary.generatedAt,
    keyFindings: caseData.aiSummary.keyFindings
  } : null
}, null, 2)}
            </pre>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
