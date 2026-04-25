import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { PipelineProgress } from '@/components/pipeline-progress';
import { StatusBadge } from '@/components/status-badge';
import { CaseReviewPanel } from '@/components/case-review-panel';
import { CaseActions } from '@/components/case-actions';
import { CrashDemoWrapper } from '@/components/crash-demo-wrapper';
import { ArrowLeft, User, Calendar, Stethoscope, FileText } from 'lucide-react';
import { CasePolling } from '@/components/case-polling';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getCaseData(id: string) {
  const supabase = await createClient();
  
  // Fetch case with all related data
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single();
  
  if (caseError || !caseData) {
    return null;
  }
  
  // Fetch variants
  const { data: variants } = await supabase
    .from('variants')
    .select('*')
    .eq('case_id', id)
    .order('classification', { ascending: true });
  
  // Fetch pipeline steps
  const { data: pipelineSteps } = await supabase
    .from('pipeline_steps')
    .select('*')
    .eq('case_id', id)
    .order('step_order', { ascending: true });
  
  // Fetch AI summary
  const { data: aiSummary } = await supabase
    .from('ai_summaries')
    .select('*')
    .eq('case_id', id)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();
  
  // Fetch prior cases for longitudinal delta (Feature 5)
  const { data: priorCases } = await supabase
    .from('cases')
    .select('id, created_at, mrn')
    .eq('mrn', caseData.mrn)
    .eq('status', 'completed')
    .neq('id', id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch prior variants if there are prior cases
  let priorVariants: { gene: string; hgvs_c: string; classification: string }[] = [];
  if (priorCases && priorCases.length > 0) {
    const { data: priorVars } = await supabase
      .from('variants')
      .select('gene, hgvs_c, classification')
      .eq('case_id', priorCases[0].id);
    priorVariants = priorVars || [];
  }

  // Build case history for timeline
  const caseHistory = [
    ...(priorCases || []).map(pc => ({
      caseId: pc.id,
      date: new Date(pc.created_at).toLocaleDateString(),
      pathogenicCount: 0, // Would need to fetch per case
      totalVariants: 0,
    })),
    {
      caseId: caseData.id,
      date: new Date(caseData.created_at).toLocaleDateString(),
      pathogenicCount: variants?.filter(v => v.classification === 'pathogenic' || v.classification === 'likely_pathogenic').length || 0,
      totalVariants: variants?.length || 0,
    }
  ];
  
  return {
    id: caseData.id,
    patientName: caseData.patient_name,
    patientDob: caseData.patient_dob,
    mrn: caseData.mrn,
    orderingPhysician: caseData.ordering_physician,
    indication: caseData.indication,
    genePanel: caseData.gene_panel.join(', '),
    genePanelArray: caseData.gene_panel,
    priority: caseData.priority.charAt(0).toUpperCase() + caseData.priority.slice(1),
    status: formatStatus(caseData.status),
    rawStatus: caseData.status,
    workflowId: caseData.workflow_id || 'Not assigned',
    createdAt: caseData.created_at,
    updatedAt: caseData.updated_at,
    variants: variants?.map(v => ({
      id: v.id,
      gene: v.gene,
      hgvsC: v.hgvs_c,
      hgvsP: v.hgvs_p,
      chromosome: v.chromosome,
      position: v.position,
      refAllele: v.ref_allele,
      altAllele: v.alt_allele,
      zygosity: v.zygosity,
      classification: v.classification,
      gnomadAf: v.gnomad_af,
      clinvarId: v.clinvar_id,
      clinvarSignificance: v.clinvar_significance,
      acmgCriteria: v.acmg_criteria || [],
      aiReasoning: v.ai_reasoning,
      aiConfidence: v.ai_confidence,
      reviewed: v.reviewed,
      reviewerNotes: v.reviewer_notes,
    })) || [],
    pipelineSteps: pipelineSteps?.map(step => ({
      name: step.step_name,
      status: step.status,
      duration: step.duration_ms ? `${(step.duration_ms / 1000).toFixed(1)}s` : undefined,
      startedAt: step.started_at,
      completedAt: step.completed_at,
      output: step.output,
    })) || [],
    aiSummary: aiSummary ? {
      summary: aiSummary.summary,
      keyFindings: aiSummary.key_findings || [],
      recommendations: aiSummary.recommendations || [],
      modelUsed: aiSummary.model_used,
      generatedAt: aiSummary.generated_at,
      reviewedBy: aiSummary.reviewed_by,
      reviewedAt: aiSummary.reviewed_at,
    } : null,
    priorVariants,
    caseHistory,
    hasPriorCases: (priorCases?.length || 0) > 0,
  };
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'in_progress': 'In progress',
    'awaiting_review': 'Awaiting review',
    'under_review': 'Under review',
    'completed': 'Completed',
    'failed': 'Failed',
  };
  return statusMap[status] || status;
}

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const caseData = await getCaseData(id);

  if (!caseData) {
    notFound();
  }

  const isInProgress = caseData.rawStatus === 'in_progress' || caseData.rawStatus === 'pending';
  const currentStepIndex = caseData.pipelineSteps.findIndex(s => s.status === 'running');

  return (
    <div className="pb-24">
      {/* Polling component for live updates when pipeline is running */}
      {isInProgress && <CasePolling caseId={id} />}
      
      <header className="border-b border-border/50 bg-card px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          
          {/* Crash Demo Button (Feature 2) - only show when pipeline is running */}
          {isInProgress && (
            <CrashDemoWrapper 
              currentStepIndex={currentStepIndex}
              steps={caseData.pipelineSteps}
            />
          )}
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">
                {caseData.patientName}
              </h1>
              <StatusBadge status={caseData.status} />
              {isInProgress && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                  Pipeline running
                </span>
              )}
            </div>
            <p className="mt-1 text-muted-foreground">
              {caseData.genePanel} · {caseData.priority} Priority · MRN: {caseData.mrn}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-md border border-border/50 bg-secondary/50 px-2.5 py-1.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Workflow ID</p>
              <code className="font-mono text-xs text-foreground">{caseData.workflowId}</code>
            </div>
            <div className="rounded-full border border-benign/30 bg-benign/10 px-2 py-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-benign">Durable</span>
            </div>
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
                {calculateAge(caseData.patientDob)} years old
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-secondary p-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date of Birth</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(caseData.patientDob).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-secondary p-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ordering Physician</p>
              <p className="text-sm font-medium text-foreground">
                {caseData.orderingPhysician}
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
                {new Date(caseData.createdAt).toLocaleDateString()}
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
              showStepOutputs={true}
            />
          </Card>
        </aside>

        <div className="flex-1 min-w-0">
          <CaseReviewPanel 
            caseData={caseData} 
            priorVariants={caseData.priorVariants}
            caseHistory={caseData.caseHistory}
            hasPriorCases={caseData.hasPriorCases}
          />
        </div>
      </div>

      <CaseActions 
        caseId={caseData.id} 
        status={caseData.rawStatus} 
        patientName={caseData.patientName} 
      />
    </div>
  );
}
