'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, Check, Loader2, Play, RotateCcw, Zap } from 'lucide-react';

type SimulationState = 'idle' | 'running' | 'crashed' | 'resuming' | 'recovered';

const STEPS = [
  { id: 'ingestion', label: 'VCF Ingestion', duration: 1500 },
  { id: 'qc', label: 'Quality Control', duration: 2000 },
  { id: 'alphagenome', label: 'AlphaGenome', duration: 3000, crashPoint: true },
  { id: 'annotation', label: 'Annotation', duration: 2000 },
  { id: 'ai_summary', label: 'AI Summary', duration: 1500 },
];

export function DemoModeCrashSimulation() {
  const [state, setState] = useState<SimulationState>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [crashedAtStep, setCrashedAtStep] = useState<number | null>(null);

  const runSimulation = async () => {
    setState('running');
    setCompletedSteps([]);
    setCrashedAtStep(null);

    for (let i = 0; i < STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, STEPS[i].duration));

      if (STEPS[i].crashPoint) {
        // Simulate crash mid-step
        await new Promise(r => setTimeout(r, 500));
        setState('crashed');
        setCrashedAtStep(i);
        return;
      }

      setCompletedSteps(prev => [...prev, i]);
    }

    setState('recovered');
  };

  const resumeFromCheckpoint = async () => {
    setState('resuming');
    await new Promise(r => setTimeout(r, 1500));

    // Resume from crashed step
    for (let i = crashedAtStep!; i < STEPS.length; i++) {
      setCurrentStep(i);
      setCompletedSteps(prev => prev.filter(s => s !== i));
      await new Promise(r => setTimeout(r, STEPS[i].duration));
      setCompletedSteps(prev => [...prev, i]);
    }

    setState('recovered');
  };

  const reset = () => {
    setState('idle');
    setCurrentStep(0);
    setCompletedSteps([]);
    setCrashedAtStep(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index && (state === 'running' || state === 'resuming');
          const isCrashed = crashedAtStep === index && state === 'crashed';
          const isPending = !isCompleted && !isCurrent && !isCrashed;

          return (
            <div 
              key={step.id}
              className={cn(
                'flex items-center gap-3 rounded-md border px-3 py-2 transition-all',
                isCompleted && 'border-benign/30 bg-benign/5',
                isCurrent && 'border-accent/30 bg-accent/5',
                isCrashed && 'border-destructive/30 bg-destructive/5 animate-pulse',
                isPending && 'border-border/50 bg-muted/30 opacity-50'
              )}
            >
              <div className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full',
                isCompleted && 'bg-benign text-white',
                isCurrent && 'bg-accent/20',
                isCrashed && 'bg-destructive/20',
                isPending && 'bg-muted'
              )}>
                {isCompleted && <Check className="h-3.5 w-3.5" />}
                {isCurrent && <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />}
                {isCrashed && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                {isPending && <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />}
              </div>
              <span className={cn(
                'text-sm font-medium',
                isCompleted && 'text-benign',
                isCurrent && 'text-accent',
                isCrashed && 'text-destructive',
                isPending && 'text-muted-foreground'
              )}>
                {step.label}
              </span>
              {isCrashed && (
                <span className="ml-auto rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  CRASH
                </span>
              )}
              {step.crashPoint && state === 'idle' && (
                <span className="ml-auto rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Crash Point
                </span>
              )}
            </div>
          );
        })}
      </div>

      {state === 'crashed' && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium text-destructive">Simulated Crash Detected</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Server crashed mid-pipeline. With WDK, the workflow state is persisted. 
                Click &quot;Resume from Checkpoint&quot; to demonstrate automatic recovery.
              </p>
            </div>
          </div>
        </div>
      )}

      {state === 'recovered' && (
        <div className="rounded-md border border-benign/30 bg-benign/5 p-4">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-benign flex-shrink-0" />
            <div>
              <p className="font-medium text-benign">Pipeline Recovered Successfully</p>
              <p className="mt-1 text-sm text-muted-foreground">
                WDK resumed exactly where it left off. No work was lost. 
                This is the power of durable workflows.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {state === 'idle' && (
          <Button onClick={runSimulation} className="gap-2 bg-accent text-white hover:bg-accent/90">
            <Play className="h-4 w-4" />
            Start Pipeline Demo
          </Button>
        )}
        {state === 'crashed' && (
          <Button onClick={resumeFromCheckpoint} className="gap-2 bg-benign text-white hover:bg-benign/90">
            <Zap className="h-4 w-4" />
            Resume from Checkpoint
          </Button>
        )}
        {(state === 'crashed' || state === 'recovered') && (
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset Demo
          </Button>
        )}
        {state === 'running' && (
          <Button disabled className="gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Pipeline Running...
          </Button>
        )}
        {state === 'resuming' && (
          <Button disabled className="gap-2 bg-benign text-white">
            <Loader2 className="h-4 w-4 animate-spin" />
            Resuming from Checkpoint...
          </Button>
        )}
      </div>
    </div>
  );
}
