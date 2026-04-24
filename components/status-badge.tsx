import { cn } from '@/lib/utils';
import type { CaseStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: CaseStatus;
}

const statusStyles: Record<CaseStatus, string> = {
  'In progress': 'bg-muted text-muted-foreground',
  'Awaiting review': 'bg-vus/10 text-vus border border-vus/20',
  'Under review': 'bg-accent/10 text-accent border border-accent/20',
  'Delivered': 'bg-benign/10 text-benign border border-benign/20',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
        statusStyles[status]
      )}
    >
      {status}
    </span>
  );
}
