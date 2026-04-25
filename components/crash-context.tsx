'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CrashState {
  isCrashed: boolean;
  crashedAtStep: number | null;
  crashedStepName: string | null;
  frozenSteps: { name: string; status: string }[] | null;
}

interface CrashContextValue extends CrashState {
  simulateCrash: (stepIndex: number, stepName: string, steps: { name: string; status: string }[]) => void;
  resumeFromCrash: () => void;
  resetCrashState: () => void;
}

const CrashContext = createContext<CrashContextValue | null>(null);

export function CrashProvider({ children }: { children: ReactNode }) {
  const [crashState, setCrashState] = useState<CrashState>({
    isCrashed: false,
    crashedAtStep: null,
    crashedStepName: null,
    frozenSteps: null,
  });

  const simulateCrash = useCallback((stepIndex: number, stepName: string, steps: { name: string; status: string }[]) => {
    // Create frozen steps with the current step marked as crashed
    const frozenSteps = steps.map((step, idx) => {
      if (idx < stepIndex) {
        return { ...step, status: 'completed' };
      } else if (idx === stepIndex) {
        return { ...step, status: 'crashed' };
      } else {
        return { ...step, status: 'pending' };
      }
    });

    setCrashState({
      isCrashed: true,
      crashedAtStep: stepIndex,
      crashedStepName: stepName,
      frozenSteps,
    });
  }, []);

  const resumeFromCrash = useCallback(() => {
    setCrashState({
      isCrashed: false,
      crashedAtStep: null,
      crashedStepName: null,
      frozenSteps: null,
    });
  }, []);

  const resetCrashState = useCallback(() => {
    setCrashState({
      isCrashed: false,
      crashedAtStep: null,
      crashedStepName: null,
      frozenSteps: null,
    });
  }, []);

  return (
    <CrashContext.Provider value={{ ...crashState, simulateCrash, resumeFromCrash, resetCrashState }}>
      {children}
    </CrashContext.Provider>
  );
}

export function useCrashContext() {
  const context = useContext(CrashContext);
  if (!context) {
    throw new Error('useCrashContext must be used within a CrashProvider');
  }
  return context;
}
