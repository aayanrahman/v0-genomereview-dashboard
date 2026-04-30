'use client';

import React, { useState } from 'react';
import { VariantClassificationBadge } from '@/components/variant-classification-badge';
import { LongitudinalDelta } from '@/components/longitudinal-delta';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VariantDelta {
  variantKey: string;
  deltaType: 'upgraded' | 'new_finding' | 'reclassified' | 'unchanged' | null;
  previousClassification?: string;
  currentClassification: string;
}

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
  delta?: VariantDelta | null;
  agSource?: 'alphagenome' | 'estimated' | null;
  alphagenomeScore?: number | null;
}

interface VariantsTableProps {
  variants: Variant[];
  showDelta?: boolean;
}

export function VariantsTable({ variants, showDelta = false }: VariantsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (variants.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        No variants flagged for review yet. Analysis in progress...
      </div>
    );
  }

  // Check for zygosity warnings
  const hasZygosityWarnings = variants.some(v => 
    v.aiReasoning?.includes('Zygosity requires confirmation')
  );

  return (
    <div className="space-y-3">
      {hasZygosityWarnings && (
        <div className="flex items-center gap-2 rounded-md border border-vus/30 bg-vus/10 px-3 py-2 text-sm text-vus">
          <AlertTriangle className="h-4 w-4" />
          <span>Some variants have zygosity warnings that require confirmation.</span>
        </div>
      )}
      
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full min-w-[1100px]">
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
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground" title="AlphaGenome peak log-fold-change in RNA expression">
                AG Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Source
              </th>
              {showDelta && (
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  vs Prior
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {variants.map((variant) => {
              const isExpanded = expandedRow === variant.id;
              const hasZygosityWarning = variant.aiReasoning?.includes('Zygosity requires confirmation');
              
              return (
                <React.Fragment key={variant.id}>
                  <tr
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-muted/20',
                      isExpanded && 'bg-muted/20',
                      hasZygosityWarning && 'bg-vus/5'
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
                        {variant.chromosome.startsWith('chr') ? variant.chromosome : `chr${variant.chromosome}`}:{variant.position}
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
                    <td className="px-4 py-4 text-sm">
                      <span className={cn(
                        'capitalize text-foreground',
                        hasZygosityWarning && 'text-vus'
                      )}>
                        {variant.zygosity}
                        {hasZygosityWarning && (
                          <AlertTriangle className="inline ml-1 h-3 w-3" />
                        )}
                      </span>
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
                    <td className="px-4 py-4">
                      {variant.alphagenomeScore != null ? (
                        <span
                          className={cn(
                            'inline-flex items-center rounded px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums',
                            variant.alphagenomeScore < 0.1
                              ? 'bg-benign/15 text-benign'
                              : variant.alphagenomeScore < 0.5
                              ? 'bg-vus/15 text-vus'
                              : 'bg-pathogenic/15 text-pathogenic'
                          )}
                          title={
                            variant.alphagenomeScore > 1.5
                              ? 'PS3 — strong functional evidence'
                              : variant.alphagenomeScore > 0.5
                              ? 'PP3 — supporting computational evidence'
                              : variant.alphagenomeScore < 0.1
                              ? 'BP4 — benign computational evidence'
                              : 'Intermediate score'
                          }
                        >
                          {variant.alphagenomeScore.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {variant.agSource === 'alphagenome' ? (
                        <span className="inline-flex items-center rounded-full bg-benign/10 px-2 py-0.5 text-[10px] font-semibold text-benign">
                          AlphaGenome
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Estimated
                        </span>
                      )}
                    </td>
                    {showDelta && (
                      <td className="px-4 py-4">
                        <LongitudinalDelta delta={variant.delta || null} />
                      </td>
                    )}
                  </tr>
                  {isExpanded && (
                    <tr key={`${variant.id}-expanded`} className="bg-muted/10">
                      <td colSpan={showDelta ? 11 : 10} className="px-6 py-4">
                        <div className="space-y-4">
                          {hasZygosityWarning && (
                            <div className="rounded-md border border-vus/30 bg-vus/10 px-3 py-2 text-sm text-vus">
                              <strong>Zygosity Warning:</strong> Zygosity requires confirmation — reflexive testing recommended. Homozygous loss of this gene is typically embryonically lethal.
                            </div>
                          )}
                          <div>
                            <h4 className="mb-2 text-sm font-semibold text-foreground flex items-center gap-2">
                              AI Reasoning
                              <span className="text-xs font-normal text-muted-foreground">
                                (Confidence: {(variant.aiConfidence * 100).toFixed(0)}%)
                              </span>
                            </h4>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {variant.aiReasoning?.replace(/⚠️.*$/, '').trim() || 'No reasoning available.'}
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
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
