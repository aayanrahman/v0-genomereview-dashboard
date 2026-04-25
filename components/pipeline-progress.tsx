'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, Loader2, ChevronDown, AlertCircle, XCircle } from 'lucide-react';
import { useCrashContext } from './crash-context';

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
  const { isCrashed, crashedAtStep, frozenSteps } = useCrashContext();

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
  const defaultSteps = [
    { name: 'VCF Parsing', status: 'pending' },
    { name: 'ClinVar Query', status: 'pending' },
    { name: 'AlphaGenome', status: 'pending' },
    { name: 'ACMG Classification', status: 'pending' },
    { name: 'Report Generation', status: 'pending' },
  ];

  // Use frozen steps if crashed, otherwise use actual steps
  const displaySteps = isCrashed && frozenSteps 
    ? frozenSteps 
    : (steps.length > 0 ? steps : defaultSteps);

  if (variant === 'vertical') {
    return (
      <div className="flex flex-col gap-0">
        {displaySteps.map((step, index) => {
          const status = step.status;
          const isLast = index === displaySteps.length - 1;
          const isExpanded = expandedSteps.has(step.name);
          const isCrashedStep = status === 'crashed';
          // Only show output for completed steps from actual data, not frozen steps
          const actualStep = steps.find(s => s.name === step.name);
          const hasOutput = status === 'completed' && showStepOutputs && actualStep?.output;

          return (
            <div key={step.name} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border transition-colors',
                    status === 'completed' && 'border-benign bg-benign text-white',
                    status === 'running' && 'border-accent bg-accent/10',
                    status === 'failed' && 'border-destructive bg-destructive/10',
                    status === 'crashed' && 'border-pathogenic bg-pathogenic text-white',
                    status === 'pending' && 'border-border bg-background'
                  )}
                >
                  {status === 'completed' && <Check className="h-3.5 w-3.5" />}
                  {status === 'running' && <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />}
                  {status === 'failed' && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                  {status === 'crashed' && <XCircle className="h-3.5 w-3.5" />}
                  {status === 'pending' && <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />}
                </div>
                {!isLast && (
                  <div 
                    className={cn(
                      'w-0.5 flex-1 min-h-8',
                      status === 'completed' ? 'bg-benign' : 'bg-border',
                      status === 'crashed' && 'bg-pathogenic',
                      isExpanded && 'min-h-24'
                    )} 
                  />
                )}
              </div>
              <div className={cn('flex-1', isLast ? '' : 'pb-6')}>
                <div className="flex items-center gap-2">
                  <p className={cn(
                    'text-sm font-medium',
                    status === 'running' && 'text-accent',
                    status === 'failed' && 'text-destructive',
                    status === 'crashed' && 'text-pathogenic',
                    status === 'pending' && 'text-muted-foreground'
                  )}>
                    {step.name}
                  </p>
                  {isCrashedStep && (
                    <span className="rounded bg-pathogenic px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                      Crashed
                    </span>
                  )}
                </div>
                {showDurations && (status === 'completed' || status === 'running') && !isCrashed && (
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {actualStep?.startedAt && (
                      <span>{new Date(actualStep.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                    {actualStep?.duration && <span className="text-benign">{actualStep.duration}</span>}
                    {status === 'running' && <span className="text-accent">Running...</span>}
                  </div>
                )}
                {isCrashedStep && (
                  <p className="mt-0.5 text-xs text-pathogenic">Checkpoint saved - ready to resume</p>
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
                {isExpanded && actualStep?.output && (
                  <div className="mt-2 rounded-md bg-primary/5 p-3 font-mono text-xs">
                    <pre className="text-foreground/80 overflow-x-auto">
                      {JSON.stringify(actualStep.output, null, 2)}
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
        const actualStep = steps.find(s => s.name === step.name);

        return (
          <div key={step.name} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
                  status === 'completed' && 'border-benign bg-benign text-white',
                  status === 'running' && 'border-accent bg-accent/10',
                  status === 'failed' && 'border-destructive bg-destructive/10',
                  status === 'crashed' && 'border-pathogenic bg-pathogenic text-white',
                  status === 'pending' && 'border-border bg-background'
                )}
                title={`${step.name}${status === 'crashed' ? ' (Crashed)' : ''}`}
              >
                {status === 'completed' && <Check className="h-3 w-3" />}
                {status === 'running' && <Loader2 className="h-3 w-3 animate-spin text-accent" />}
                {status === 'failed' && <AlertCircle className="h-3 w-3 text-destructive" />}
                {status === 'crashed' && <XCircle className="h-3 w-3" />}
                {status === 'pending' && <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />}
              </div>
              {showDurations && (status === 'completed' || status === 'running') && !isCrashed && (
                <span className="mt-1 text-[10px] text-muted-foreground whitespace-nowrap">
                  {actualStep?.duration || '...'}
                </span>
              )}
            </div>
            {!isLast && (
              <div 
                className={cn(
                  'mx-0.5 h-0.5 w-3',
                  status === 'completed' ? 'bg-benign' : 'bg-border',
                  status === 'crashed' && 'bg-pathogenic'
                )} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
