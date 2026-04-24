'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, Loader2, ChevronDown, AlertCircle } from 'lucide-react';

interface PipelineStep {
  name: string;
  status: string;
  duration?: string;
  startedAt?: string;
  completedAt?: string;
  output?: Record<string, any>;
}

interface PipelineProgressProps {
  steps: PipelineStep[];
  variant?: 'horizontal' | 'vertical';
  showDurations?: boolean;
  showStepOutputs?: boolean;
}

export function PipelineProgress({ 
  steps, 
  variant = 'horizontal',
  showDurations = true,
  showStepOutputs = false,
}: PipelineProgressProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStepExpand = (stepName: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepName)) {
        next.delete(stepName);
      } else {
        next.add(stepName);
      }
      return next;
    });
  };

  // If no steps yet, show default pipeline stages
  const displaySteps = steps.length > 0 ? steps : [
    { name: 'VCF Parsing', status: 'pending' },
    { name: 'ClinVar Query', status: 'pending' },
    { name: 'AlphaGenome', status: 'pending' },
    { name: 'ACMG Classification', status: 'pending' },
    { name: 'Report Generation', status: 'pending' },
  ];

  if (variant === 'vertical') {
    return (
      <div className="flex flex-col gap-0">
        {displaySteps.map((step, index) => {
          const status = step.status;
          const isLast = index === displaySteps.length - 1;
          const isExpanded = expandedSteps.has(step.name);
          const hasOutput = status === 'completed' && showStepOutputs && step.output;

          return (
            <div key={step.name} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border transition-colors',
                    status === 'completed' && 'border-benign bg-benign text-white',
                    status === 'running' && 'border-accent bg-accent/10',
                    status === 'failed' && 'border-destructive bg-destructive/10',
                    status === 'pending' && 'border-border bg-background'
                  )}
                >
                  {status === 'completed' && <Check className="h-3.5 w-3.5" />}
                  {status === 'running' && <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />}
                  {status === 'failed' && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
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
                  status === 'running' && 'text-accent',
                  status === 'failed' && 'text-destructive',
                  status === 'pending' && 'text-muted-foreground'
                )}>
                  {step.name}
                </p>
                {showDurations && (status === 'completed' || status === 'running') && (
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {step.startedAt && (
                      <span>{new Date(step.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                    {step.duration && <span className="text-benign">{step.duration}</span>}
                    {status === 'running' && <span className="text-accent">Running...</span>}
                  </div>
                )}
                {status === 'failed' && (
                  <p className="mt-0.5 text-xs text-destructive">Step failed</p>
                )}
                {hasOutput && (
                  <button
                    onClick={() => toggleStepExpand(step.name)}
                    className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronDown className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-180')} />
                    View step output
                  </button>
                )}
                {isExpanded && step.output && (
                  <div className="mt-2 rounded-md bg-primary/5 p-3 font-mono text-xs">
                    <pre className="text-foreground/80 overflow-x-auto">
                      {JSON.stringify(step.output, null, 2)}
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
      {displaySteps.map((step, index) => {
        const status = step.status;
        const isLast = index === displaySteps.length - 1;

        return (
          <div key={step.name} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
                  status === 'completed' && 'border-benign bg-benign text-white',
                  status === 'running' && 'border-accent bg-accent/10',
                  status === 'failed' && 'border-destructive bg-destructive/10',
                  status === 'pending' && 'border-border bg-background'
                )}
                title={step.name}
              >
                {status === 'completed' && <Check className="h-3 w-3" />}
                {status === 'running' && <Loader2 className="h-3 w-3 animate-spin text-accent" />}
                {status === 'failed' && <AlertCircle className="h-3 w-3 text-destructive" />}
                {status === 'pending' && <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />}
              </div>
              {showDurations && (status === 'completed' || status === 'running') && (
                <span className="mt-1 text-[10px] text-muted-foreground whitespace-nowrap">
                  {step.duration || '...'}
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
