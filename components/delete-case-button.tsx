'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';

export function DeleteCaseButton({ caseId, patientName }: { caseId: string; patientName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }

    const res = await fetch(`/api/cases/${caseId}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Failed to delete case');
      setConfirming(false);
      return;
    }
    startTransition(() => router.refresh());
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleDelete}
      disabled={isPending}
      className={`gap-1.5 ${confirming ? 'text-destructive hover:text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
      title={confirming ? `Click again to delete ${patientName}` : 'Delete case'}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      {confirming ? 'Confirm' : ''}
    </Button>
  );
}
