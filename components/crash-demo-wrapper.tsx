'use client';

import { useState } from 'react';
import { CrashDemo } from './crash-demo';

interface CrashDemoWrapperProps {
  currentStepIndex: number;
  steps: { name: string; status: string }[];
}

export function CrashDemoWrapper({ currentStepIndex, steps }: CrashDemoWrapperProps) {
  const [isCrashed, setIsCrashed] = useState(false);
  const [isResumed, setIsResumed] = useState(false);

  const handleCrash = () => {
    setIsCrashed(true);
  };

  const handleResume = () => {
    setIsCrashed(false);
    setIsResumed(true);
  };

  if (isCrashed) {
    return (
      <div className="flex flex-col gap-2">
        <CrashDemo
          currentStepIndex={currentStepIndex}
          steps={steps}
          onCrash={handleCrash}
          onResume={handleResume}
        />
      </div>
    );
  }

  if (isResumed) {
    return (
      <CrashDemo
        currentStepIndex={currentStepIndex}
        steps={steps}
        onCrash={handleCrash}
        onResume={handleResume}
      />
    );
  }

  return (
    <CrashDemo
      currentStepIndex={currentStepIndex}
      steps={steps}
      onCrash={handleCrash}
      onResume={handleResume}
    />
  );
}
