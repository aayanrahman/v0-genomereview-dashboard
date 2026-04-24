'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CasePollingProps {
  caseId: string;
  intervalMs?: number;
}

export function CasePolling({ caseId, intervalMs = 3000 }: CasePollingProps) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      // Refresh the page to get latest data
      router.refresh();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [caseId, intervalMs, router]);

  return null; // This component has no UI, just handles polling
}
