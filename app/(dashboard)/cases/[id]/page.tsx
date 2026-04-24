import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCaseById } from '@/lib/mock-cases';
import { Card } from '@/components/ui/card';
import { PipelineProgress } from '@/components/pipeline-progress';
import { StatusBadge } from '@/components/status-badge';
import { CaseReviewPanel } from '@/components/case-review-panel';
import { CaseActions } from '@/components/case-actions';
import { ArrowLeft, User, Calendar, Stethoscope, FileText } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const caseData = getCaseById(id);

  if (!caseData) {
    notFound();
  }

  // TODO: Fetch case data from WDK workflow endpoint
  // const caseData = await fetch(`/api/workflows/${id}`).then(r => r.json())

  return (
    <div className="pb-24">
      <header className="border-b border-border/50 bg-card px-8 py-6">
        <Link 
          href="/" 
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">
                Case {caseData.patientId}
              </h1>
              <StatusBadge status={caseData.status} />
            </div>
            <p className="mt-1 text-muted-foreground">
              {caseData.genePanel} Panel · {caseData.priority} Priority
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Workflow ID</p>
            <code className="font-mono text-xs text-foreground">{caseData.workflowId}</code>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-secondary p-2">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Patient</p>
              <p className="text-sm font-medium text-foreground">
                {caseData.age}yo {caseData.sex}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-secondary p-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sample Date</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(caseData.sampleDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-secondary p-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Referring Clinician</p>
              <p className="text-sm font-medium text-foreground">
                {caseData.referringClinician}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-secondary p-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Submitted</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(caseData.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-1">Clinical Indication</p>
          <p className="text-sm text-foreground">{caseData.indication}</p>
        </div>
      </header>

      <div className="flex gap-8 p-8">
        <aside className="w-64 flex-shrink-0">
          <Card className="border-border/50 p-4">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Pipeline Status</h3>
            <PipelineProgress 
              steps={caseData.pipelineSteps} 
              variant="vertical" 
              showDurations={true}
            />
          </Card>
        </aside>

        <div className="flex-1 min-w-0">
          <CaseReviewPanel caseData={caseData} />
        </div>
      </div>

      <CaseActions caseData={caseData} />
    </div>
  );
}
