'use client';

import { useState, useEffect } from 'react';

interface PipelineStep {
  name: string;
  status: string;
  duration?: string;
  startedAt?: string;
}

interface LiveWorkflowIndicatorProps {
  steps: PipelineStep[];
}

export function LiveWorkflowIndicator({ steps }: LiveWorkflowIndicatorProps) {
  const [elapsed, setElapsed] = useState(0);

  const activeStep = steps.find(s => s.status === 'running');

  useEffect(() => {
    if (!activeStep?.startedAt) return;

    const startTime = new Date(activeStep.startedAt).getTime();
    
    const updateElapsed = () => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    };
    
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    
    return () => clearInterval(interval);
  }, [activeStep?.startedAt]);

  if (!activeStep) return null;

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeString = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      <span className="font-medium text-accent">{activeStep.name}</span>
      <span className="text-muted-foreground">·</span>
      <span className="font-mono text-muted-foreground">{timeString}</span>
    </div>
  );
}
