'use client';

import { CrashDemo } from './crash-demo';

interface CrashDemoWrapperProps {
  currentStepIndex: number;
  steps: { name: string; status: string }[];
}

export function CrashDemoWrapper({ currentStepIndex, steps }: CrashDemoWrapperProps) {
  return (
    <CrashDemo
      currentStepIndex={currentStepIndex}
      steps={steps}
    />
  );
}
