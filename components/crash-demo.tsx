'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Play, RotateCcw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrashDemoProps {
  currentStepIndex: number;
  steps: { name: string; status: string }[];
  onCrash: () => void;
  onResume: () => void;
}

export function CrashDemo({ currentStepIndex, steps, onCrash, onResume }: CrashDemoProps) {
  const [crashed, setCrashed] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [resumedFromStep, setResumedFromStep] = useState<number | null>(null);

  const handleCrash = () => {
    setCrashed(true);
    setResumedFromStep(currentStepIndex);
    onCrash();
  };

  const handleResume = async () => {
    setResuming(true);
    // Simulate resume delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCrashed(false);
    setResuming(false);
    onResume();
  };

  if (crashed) {
    return (
      <div className="space-y-4">
        {/* Crash Banner */}
        <div className="rounded-lg border border-vus/50 bg-vus/10 px-4 py-3">
          <div className="flex items-center gap-2 text-vus">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">
              Workflow crashed at step {(resumedFromStep ?? 0) + 1} — checkpoint saved.
            </span>
          </div>
          <p className="mt-1 text-xs text-vus/80">
            Click Resume to continue from last checkpoint. No data will be lost.
          </p>
        </div>

        {/* Resume Button */}
        <Button
          onClick={handleResume}
          disabled={resuming}
          className="gap-2 bg-benign text-white hover:bg-benign/90"
        >
          {resuming ? (
            <>
              <RotateCcw className="h-4 w-4 animate-spin" />
              Resuming...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Resume workflow
            </>
          )}
        </Button>
      </div>
    );
  }

  // Show "Resumed from checkpoint" badge after recovery
  if (resumedFromStep !== null && !crashed) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-benign/10 px-2.5 py-1 text-xs font-medium text-benign">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Resumed from checkpoint
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
      <div className="absolute right-0 top-full z-10 mt-2 hidden w-48 rounded-md bg-foreground px-3 py-2 text-xs text-background shadow-lg group-hover:block">
        Demo: tests WDK durability. Pipeline will resume from last checkpoint.
      </div>
    </div>
  );
}

// Visual crashed step indicator
export function CrashedStepIndicator({ stepName }: { stepName: string }) {
  return (
    <div className="flex items-center gap-2 text-pathogenic">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pathogenic/20">
        <span className="text-xs font-bold">X</span>
      </div>
      <span className="text-sm font-medium">{stepName}</span>
      <span className="rounded bg-pathogenic/10 px-1.5 py-0.5 text-xs">Crashed</span>
    </div>
  );
}
