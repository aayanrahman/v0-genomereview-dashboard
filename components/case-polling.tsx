'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCrashContext } from './crash-context';

interface CasePollingProps {
  caseId: string;
  intervalMs?: number;
}

export function CasePolling({ caseId, intervalMs = 3000 }: CasePollingProps) {
  const router = useRouter();
  const { isCrashed } = useCrashContext();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only poll if not crashed
    if (!isCrashed) {
      intervalRef.current = setInterval(() => {
        router.refresh();
      }, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [caseId, intervalMs, router, isCrashed]);

  return null; // This component has no UI, just handles polling
}
