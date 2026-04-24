'use client';

import { useState } from 'react';
import { VariantClassificationBadge } from '@/components/variant-classification-badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface VariantsTableProps {
  variants: Variant[];
}

export function VariantsTable({ variants }: VariantsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (variants.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        No variants flagged for review yet. Analysis in progress...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border/50">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/50 bg-muted/30">
            <th className="w-8 px-2 py-3"></th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Coordinates
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Gene
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              HGVS
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Zygosity
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              ClinVar
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              gnomAD
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Classification
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {variants.map((variant) => {
            const isExpanded = expandedRow === variant.id;
            
            return (
              <>
                <tr 
                  key={variant.id}
                  className={cn(
                    'cursor-pointer transition-colors hover:bg-muted/20',
                    isExpanded && 'bg-muted/20'
                  )}
                  onClick={() => setExpandedRow(isExpanded ? null : variant.id)}
                >
                  <td className="px-2 py-4 text-muted-foreground">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <code className="font-mono text-sm text-foreground">
                      chr{variant.chromosome}:{variant.position}
                    </code>
                    <p className="text-xs text-muted-foreground">
                      {variant.refAllele} &gt; {variant.altAllele}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-foreground">{variant.gene}</span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <code className="font-mono text-xs text-foreground">{variant.hgvsC}</code>
                    {variant.hgvsP && (
                      <p className="text-xs text-muted-foreground mt-0.5">{variant.hgvsP}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground capitalize">
                    {variant.zygosity}
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">
                    {variant.clinvarSignificance || '-'}
                  </td>
                  <td className="px-4 py-4">
                    <code className="font-mono text-xs text-muted-foreground">
                      {variant.gnomadAf ? variant.gnomadAf.toExponential(2) : 'Not found'}
                    </code>
                  </td>
                  <td className="px-4 py-4">
                    <VariantClassificationBadge 
                      classification={variant.classification} 
                      size="sm"
                    />
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${variant.id}-expanded`} className="bg-muted/10">
                    <td colSpan={8} className="px-6 py-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-foreground flex items-center gap-2">
                            AI Reasoning
                            <span className="text-xs font-normal text-muted-foreground">
                              (Confidence: {(variant.aiConfidence * 100).toFixed(0)}%)
                            </span>
                          </h4>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {variant.aiReasoning || 'No reasoning available.'}
                          </p>
                        </div>
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-foreground">
                            ACMG Criteria Applied
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {variant.acmgCriteria.length > 0 ? (
                              variant.acmgCriteria.map((criterion) => (
                                <span
                                  key={criterion}
                                  className={cn(
                                    'rounded-md px-2 py-1 font-mono text-xs',
                                    criterion.startsWith('P') && 'bg-pathogenic/10 text-pathogenic',
                                    criterion.startsWith('B') && 'bg-benign/10 text-benign',
                                    !criterion.startsWith('P') && !criterion.startsWith('B') && 'bg-secondary text-foreground'
                                  )}
                                >
                                  {criterion}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">No criteria assigned</span>
                            )}
                          </div>
                        </div>
                        {variant.reviewerNotes && (
                          <div>
                            <h4 className="mb-2 text-sm font-semibold text-foreground">
                              Reviewer Notes
                            </h4>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {variant.reviewerNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
