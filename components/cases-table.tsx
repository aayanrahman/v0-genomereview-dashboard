import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PipelineProgress } from '@/components/pipeline-progress';
import { StatusBadge } from '@/components/status-badge';
import { LiveWorkflowIndicator } from '@/components/live-workflow-indicator';
import { DeleteCaseButton } from '@/components/delete-case-button';
import { ArrowRight, Eye } from 'lucide-react';

interface PipelineStep {
  name: string;
  status: string;
  duration?: string;
}

interface CaseItem {
  id: string;
  patientName: string;
  mrn: string;
  indication: string;
  genePanel: string[];
  priority: string;
  status: string;
  workflowId: string | null;
  createdAt: string;
  pipelineSteps: PipelineStep[];
}

interface CasesTableProps {
  cases: CaseItem[];
}

export function CasesTable({ cases }: CasesTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/50 bg-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/50 bg-muted/30">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Patient / MRN
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
                  <p className="text-sm font-medium text-foreground">
                    {caseItem.patientName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {caseItem.mrn} · {caseItem.genePanel.slice(0, 3).join(', ')}
                    {caseItem.genePanel.length > 3 && ` +${caseItem.genePanel.length - 3}`}
                  </p>
                </div>
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-foreground">
                  {new Date(caseItem.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(caseItem.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  {caseItem.pipelineSteps.length > 0 ? (
                    <>
                      <PipelineProgress steps={caseItem.pipelineSteps} showDurations={false} />
                      {caseItem.status === 'In progress' && (
                        <LiveWorkflowIndicator steps={caseItem.pipelineSteps} />
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">Pending</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-4">
                <StatusBadge status={caseItem.status} />
              </td>
              <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button asChild size="sm" variant="ghost" className="gap-1.5">
                    <Link href={`/cases/${caseItem.id}`}>
                      {caseItem.status === 'Completed' ? (
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
                  <DeleteCaseButton caseId={caseItem.id} patientName={caseItem.patientName} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
