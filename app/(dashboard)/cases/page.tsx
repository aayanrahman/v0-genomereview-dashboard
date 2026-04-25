import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CasesTable } from '@/components/cases-table';
import { createClient } from '@/lib/supabase/server';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CasesPage() {
  const supabase = await createClient();
  
  // Fetch all cases with their pipeline steps
  const { data: cases, error } = await supabase
    .from('cases')
    .select(`
      *,
      pipeline_steps (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cases:', error);
  }

  // Transform data to match expected format
  const formattedCases = (cases || []).map(c => ({
    id: c.id,
    patientName: c.patient_name,
    patientDob: c.patient_dob,
    mrn: c.mrn,
    orderingPhysician: c.ordering_physician,
    indication: c.indication,
    genePanel: c.gene_panel,
    priority: c.priority,
    status: c.status,
    workflowId: c.workflow_id,
    createdAt: c.created_at,
    pipelineSteps: (c.pipeline_steps || [])
      .sort((a: any, b: any) => a.step_order - b.step_order)
      .map((step: any) => ({
        name: step.step_name,
        status: step.status,
        startedAt: step.started_at,
        completedAt: step.completed_at,
        durationMs: step.duration_ms,
        output: step.output,
      })),
  }));

  return (
    <div className="p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">All Cases</h1>
          <p className="mt-1 text-muted-foreground">
            View and manage all patient genomic analysis cases
          </p>
        </div>
        <Button asChild className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/cases/new">
            <Plus className="h-4 w-4" />
            New Case
          </Link>
        </Button>
      </header>

      <CasesTable cases={formattedCases} />
    </div>
  );
}
