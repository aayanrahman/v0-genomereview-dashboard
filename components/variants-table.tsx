'use client';

import { useState } from 'react';
import { VariantClassificationBadge } from '@/components/variant-classification-badge';
import type { Variant } from '@/lib/types';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
              Consequence
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              AlphaGenome
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
                      {variant.coordinates}
                    </code>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-foreground">{variant.gene}</span>
                    <p className="text-xs text-muted-foreground">{variant.transcript}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">
                    {variant.consequence}
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      'font-mono text-sm font-medium',
                      variant.alphaGenomeScore >= 0.9 && 'text-pathogenic',
                      variant.alphaGenomeScore >= 0.7 && variant.alphaGenomeScore < 0.9 && 'text-vus',
                      variant.alphaGenomeScore < 0.7 && 'text-muted-foreground'
                    )}>
                      {variant.alphaGenomeScore.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">
                    {variant.clinvarClassification}
                  </td>
                  <td className="px-4 py-4">
                    <code className="font-mono text-xs text-muted-foreground">
                      {variant.gnomadFrequency}
                    </code>
                  </td>
                  <td className="px-4 py-4">
                    <VariantClassificationBadge 
                      classification={variant.claudeClassification} 
                      size="sm"
                    />
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${variant.id}-expanded`} className="bg-muted/10">
                    <td colSpan={8} className="px-6 py-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-foreground">
                            Evidence Reasoning
                          </h4>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {variant.evidenceReasoning}
                          </p>
                        </div>
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-foreground">
                            ACMG Criteria
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {variant.acmgCriteria.map((criterion) => (
                              <span
                                key={criterion}
                                className="rounded-md bg-secondary px-2 py-1 font-mono text-xs text-foreground"
                              >
                                {criterion}
                              </span>
                            ))}
                          </div>
                        </div>
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
