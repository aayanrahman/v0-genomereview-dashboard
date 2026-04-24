'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VariantsTable } from '@/components/variants-table';
import { ClinicalNarrative } from '@/components/clinical-narrative';
import { Card } from '@/components/ui/card';
import type { Case } from '@/lib/types';
import { FileText, Dna, BookOpen, Database } from 'lucide-react';

interface CaseReviewPanelProps {
  caseData: Case;
}

export function CaseReviewPanel({ caseData }: CaseReviewPanelProps) {
  return (
    <Tabs defaultValue="variants" className="w-full">
      <TabsList className="mb-4 w-full justify-start gap-1 bg-muted/30 p-1">
        <TabsTrigger value="variants" className="gap-2">
          <Dna className="h-4 w-4" />
          Variants
        </TabsTrigger>
        <TabsTrigger value="summary" className="gap-2">
          <FileText className="h-4 w-4" />
          AI Summary
        </TabsTrigger>
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
        <VariantsTable variants={caseData.variants} />
      </TabsContent>

      <TabsContent value="summary" className="mt-0">
        {caseData.aiSummary ? (
          <Card className="border-border/50 p-6">
            <ClinicalNarrative summary={caseData.aiSummary} />
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
                        {variant.coordinates}
                      </code>
                    </div>
                    <div className="grid gap-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">ClinVar</span>
                        <a 
                          href="#" 
                          className="text-accent hover:underline"
                          onClick={(e) => e.preventDefault()}
                        >
                          {variant.clinvarClassification} - View Entry
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">gnomAD Frequency</span>
                        <code className="font-mono text-xs">{variant.gnomadFrequency}</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">OMIM</span>
                        <a 
                          href="#" 
                          className="text-accent hover:underline"
                          onClick={(e) => e.preventDefault()}
                        >
                          View Gene Entry
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
                {caseData.variants.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No variants to display evidence for.
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
            <pre className="overflow-auto rounded-lg bg-muted/50 p-4 text-xs font-mono text-muted-foreground">
{JSON.stringify({
  workflowId: caseData.workflowId,
  patientId: caseData.patientId,
  genePanel: caseData.genePanel,
  variantCount: caseData.variants.length,
  pipelineStatus: caseData.pipelineSteps.map(s => ({
    stage: s.stage,
    status: s.status,
    duration: s.duration
  })),
  variants: caseData.variants.map(v => ({
    id: v.id,
    coordinates: v.coordinates,
    gene: v.gene,
    consequence: v.consequence,
    classification: v.claudeClassification
  }))
}, null, 2)}
            </pre>
            <p className="text-xs text-muted-foreground">
              {"// TODO: Fetch full raw data from WDK workflow endpoint"}
            </p>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
