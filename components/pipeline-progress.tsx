'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, Loader2, ChevronDown } from 'lucide-react';
import type { PipelineStep } from '@/lib/types';
import { PIPELINE_STAGES } from '@/lib/types';

interface PipelineProgressProps {
  steps: PipelineStep[];
  variant?: 'horizontal' | 'vertical';
  showDurations?: boolean;
  showStepOutputs?: boolean;
}

// Mock step outputs for demo
const STEP_OUTPUTS: Record<string, object> = {
  ingestion: {
    file_id: 'vcf_8x7k2m',
    total_variants: 4287,
    file_size_mb: 12.4,
    checksum: 'sha256:a7f8b2...',
  },
  qc: {
    pass_rate: 0.987,
    mean_depth: 42.3,
    call_rate: 0.994,
    ti_tv_ratio: 2.08,
    het_hom_ratio: 1.42,
  },
  alphagenome: {
    rna_seq_effect: -0.42,
    splice_effect: 'none',
    protein_stability: -2.1,
    conservation_score: 0.89,
    structural_impact: 'moderate',
  },
  annotation: {
    clinvar_hits: 3,
    gnomad_annotated: 4287,
    acmg_criteria_applied: true,
    literature_refs: 12,
  },
  ai_summary: {
    model: 'claude-opus-4.7',
    tokens_used: 2847,
    key_findings: 3,
    confidence_score: 0.94,
  },
  awaiting_review: {
    assigned_to: 'Dr. Torres',
    queue_position: 1,
    priority_boost: true,
  },
};

export function PipelineProgress({ 
  steps, 
  variant = 'horizontal',
  showDurations = true,
  showStepOutputs = false,
}: PipelineProgressProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const getStepStatus = (stage: string) => {
    const step = steps.find(s => s.stage === stage);
    return step?.status || 'pending';
  };

  const getStepDuration = (stage: string) => {
    const step = steps.find(s => s.stage === stage);
    return step?.duration;
  };

  const toggleStepExpand = (stage: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stage)) {
        next.delete(stage);
      } else {
        next.add(stage);
      }
      return next;
    });
  };

  if (variant === 'vertical') {
    return (
      <div className="flex flex-col gap-0">
        {PIPELINE_STAGES.map((stage, index) => {
          const status = getStepStatus(stage.stage);
          const duration = getStepDuration(stage.stage);
          const step = steps.find(s => s.stage === stage.stage);
          const isLast = index === PIPELINE_STAGES.length - 1;
          const isExpanded = expandedSteps.has(stage.stage);
          const hasOutput = status === 'completed' && showStepOutputs;

          return (
            <div key={stage.stage} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border transition-colors',
                    status === 'completed' && 'border-benign bg-benign text-white',
                    status === 'active' && 'border-accent bg-accent/10',
                    status === 'pending' && 'border-border bg-background'
                  )}
                >
                  {status === 'completed' && <Check className="h-3.5 w-3.5" />}
                  {status === 'active' && <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />}
                  {status === 'pending' && <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />}
                </div>
                {!isLast && (
                  <div 
                    className={cn(
                      'w-0.5 flex-1 min-h-8',
                      status === 'completed' ? 'bg-benign' : 'bg-border',
                      isExpanded && 'min-h-24'
                    )} 
                  />
                )}
              </div>
              <div className={cn('flex-1', isLast ? '' : 'pb-6')}>
                <p className={cn(
                  'text-sm font-medium',
                  status === 'active' && 'text-accent',
                  status === 'pending' && 'text-muted-foreground'
                )}>
                  {stage.label}
                </p>
                {showDurations && (status === 'completed' || status === 'active') && (
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {step?.startedAt && (
                      <span>{new Date(step.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                    {duration && <span className="text-benign">{duration}</span>}
                    {status === 'active' && <span className="text-accent">Running...</span>}
                  </div>
                )}
                {hasOutput && (
                  <button
                    onClick={() => toggleStepExpand(stage.stage)}
                    className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronDown className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-180')} />
                    View step output
                  </button>
                )}
                {isExpanded && STEP_OUTPUTS[stage.stage] && (
                  <div className="mt-2 rounded-md bg-primary/5 p-3 font-mono text-xs">
                    <pre className="text-foreground/80 overflow-x-auto">
                      {JSON.stringify(STEP_OUTPUTS[stage.stage], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {PIPELINE_STAGES.map((stage, index) => {
        const status = getStepStatus(stage.stage);
        const duration = getStepDuration(stage.stage);
        const isLast = index === PIPELINE_STAGES.length - 1;

        return (
          <div key={stage.stage} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
                  status === 'completed' && 'border-benign bg-benign text-white',
                  status === 'active' && 'border-accent bg-accent/10',
                  status === 'pending' && 'border-border bg-background'
                )}
              >
                {status === 'completed' && <Check className="h-3 w-3" />}
                {status === 'active' && <Loader2 className="h-3 w-3 animate-spin text-accent" />}
                {status === 'pending' && <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />}
              </div>
              {showDurations && (status === 'completed' || status === 'active') && (
                <span className="mt-1 text-[10px] text-muted-foreground whitespace-nowrap">
                  {duration || 'Running...'}
                </span>
              )}
            </div>
            {!isLast && (
              <div 
                className={cn(
                  'mx-0.5 h-0.5 w-3',
                  status === 'completed' ? 'bg-benign' : 'bg-border'
                )} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
