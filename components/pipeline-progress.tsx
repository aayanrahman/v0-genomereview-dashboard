import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import type { PipelineStep } from '@/lib/types';
import { PIPELINE_STAGES } from '@/lib/types';

interface PipelineProgressProps {
  steps: PipelineStep[];
  variant?: 'horizontal' | 'vertical';
  showDurations?: boolean;
}

export function PipelineProgress({ 
  steps, 
  variant = 'horizontal',
  showDurations = true 
}: PipelineProgressProps) {
  const getStepStatus = (stage: string) => {
    const step = steps.find(s => s.stage === stage);
    return step?.status || 'pending';
  };

  const getStepDuration = (stage: string) => {
    const step = steps.find(s => s.stage === stage);
    return step?.duration;
  };

  if (variant === 'vertical') {
    return (
      <div className="flex flex-col gap-0">
        {PIPELINE_STAGES.map((stage, index) => {
          const status = getStepStatus(stage.stage);
          const duration = getStepDuration(stage.stage);
          const step = steps.find(s => s.stage === stage.stage);
          const isLast = index === PIPELINE_STAGES.length - 1;

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
                      status === 'completed' ? 'bg-benign' : 'bg-border'
                    )} 
                  />
                )}
              </div>
              <div className="flex-1 pb-6">
                <p className={cn(
                  'text-sm font-medium',
                  status === 'active' && 'text-accent',
                  status === 'pending' && 'text-muted-foreground'
                )}>
                  {stage.label}
                </p>
                {showDurations && (status === 'completed' || status === 'active') && (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {step?.startedAt && (
                      <span>{new Date(step.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                    {duration && <span className="ml-2 text-benign">{duration}</span>}
                    {status === 'active' && <span className="ml-2 text-accent">Running...</span>}
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
