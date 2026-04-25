'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Play, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { useCrashContext } from './crash-context';

interface CrashDemoProps {
  currentStepIndex: number;
  steps: { name: string; status: string }[];
}

export function CrashDemo({ currentStepIndex, steps }: CrashDemoProps) {
  const { isCrashed, crashedAtStep, crashedStepName, simulateCrash, resumeFromCrash } = useCrashContext();
  const [resuming, setResuming] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);

  const handleCrash = () => {
    // Get the current running step, or default to step 2 (AlphaGenome) for demo
    const targetStepIndex = currentStepIndex >= 0 ? currentStepIndex : 2;
    const targetStepName = steps[targetStepIndex]?.name || 'AlphaGenome';
    simulateCrash(targetStepIndex, targetStepName, steps);
  };

  const handleResume = async () => {
    setResuming(true);
    // Simulate WDK checkpoint recovery delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    resumeFromCrash();
    setResuming(false);
    setHasResumed(true);
  };

  if (isCrashed) {
    return (
      <div className="space-y-4">
        {/* Crash Banner */}
        <div className="rounded-lg border-2 border-pathogenic/50 bg-pathogenic/10 px-4 py-3">
          <div className="flex items-center gap-2 text-pathogenic">
            <XCircle className="h-5 w-5" />
            <span className="font-semibold">
              CRASH at Step {(crashedAtStep ?? 0) + 1}: {crashedStepName}
            </span>
          </div>
          <p className="mt-2 text-sm text-pathogenic/80">
            The workflow has been halted. WDK has saved a checkpoint at this exact position.
            No data was lost. Click Resume to continue from where we left off.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-pathogenic/70">
            <span className="rounded bg-pathogenic/20 px-1.5 py-0.5 font-mono">checkpoint_saved</span>
            <span>·</span>
            <span>Polling stopped</span>
            <span>·</span>
            <span>Pipeline frozen</span>
          </div>
        </div>

        {/* Resume Button */}
        <Button
          onClick={handleResume}
          disabled={resuming}
          size="lg"
          className="w-full gap-2 bg-benign text-white hover:bg-benign/90"
        >
          {resuming ? (
            <>
              <RotateCcw className="h-4 w-4 animate-spin" />
              Restoring from checkpoint...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Resume from Step {(crashedAtStep ?? 0) + 1}
            </>
          )}
        </Button>
      </div>
    );
  }

  // Show "Resumed from checkpoint" badge after recovery
  if (hasResumed) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-benign/10 border border-benign/30 px-3 py-1.5 text-sm font-medium text-benign">
          <CheckCircle2 className="h-4 w-4" />
          Resumed from checkpoint - No data lost
        </div>
      </div>
    );
  }

  // Crash simulation button
  return (
    <div className="group relative">
      <Button
        onClick={handleCrash}
        variant="outline"
        size="sm"
        className="gap-2 border-pathogenic/30 text-pathogenic hover:bg-pathogenic/10 hover:text-pathogenic"
      >
        <Zap className="h-4 w-4" />
        Simulate crash
      </Button>
      
      {/* Tooltip */}
      <div className="absolute right-0 top-full z-10 mt-2 hidden w-56 rounded-md bg-foreground px-3 py-2 text-xs text-background shadow-lg group-hover:block">
        <strong>Demo for judges:</strong> Click to simulate a server crash mid-pipeline. 
        WDK will save a checkpoint and allow resuming from exactly this step.
      </div>
    </div>
  );
}

// Visual crashed step indicator for use in PipelineProgress
export function CrashedStepIndicator({ stepName }: { stepName: string }) {
  return (
    <div className="flex items-center gap-2 text-pathogenic">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pathogenic text-white">
        <XCircle className="h-4 w-4" />
      </div>
      <span className="text-sm font-medium">{stepName}</span>
      <span className="rounded bg-pathogenic px-2 py-0.5 text-xs font-bold text-white uppercase">Crashed</span>
    </div>
  );
}
