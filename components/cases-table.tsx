import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PipelineProgress } from '@/components/pipeline-progress';
import { StatusBadge } from '@/components/status-badge';
import type { Case } from '@/lib/types';
import { ArrowRight, Eye } from 'lucide-react';

interface CasesTableProps {
  cases: Case[];
}

export function CasesTable({ cases }: CasesTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/50 bg-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/50 bg-muted/30">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Patient ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Submitted
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pipeline Stage
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {cases.map((caseItem) => (
            <tr key={caseItem.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-4">
                <div>
                  <p className="font-mono text-sm font-medium text-foreground">
                    {caseItem.patientId}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {caseItem.genePanel}
                  </p>
                </div>
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-foreground">
                  {new Date(caseItem.submittedAt).toLocaleDateString()}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(caseItem.submittedAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </td>
              <td className="px-4 py-4">
                <PipelineProgress steps={caseItem.pipelineSteps} showDurations={false} />
              </td>
              <td className="px-4 py-4">
                <StatusBadge status={caseItem.status} />
              </td>
              <td className="px-4 py-4 text-right">
                <Button asChild size="sm" variant="ghost" className="gap-1.5">
                  <Link href={`/cases/${caseItem.id}`}>
                    {caseItem.status === 'Delivered' ? (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </>
                    ) : caseItem.status === 'Awaiting review' || caseItem.status === 'Under review' ? (
                      <>
                        Review
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        Details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
