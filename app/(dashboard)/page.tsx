import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/stat-card';
import { CasesTable } from '@/components/cases-table';
import { createClient } from '@/lib/supabase/server';
import { ClipboardList, Dna, Clock, Plus } from 'lucide-react';

async function getStats() {
  const supabase = await createClient();
  
  // Get pending review count
  const { count: pendingReview } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .in('status', ['awaiting_review', 'under_review']);
  
  // Get total variants count
  const { count: totalVariants } = await supabase
    .from('variants')
    .select('*', { count: 'exact', head: true });
  
  // Get cases count this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const { count: casesThisWeek } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo.toISOString());
  
  return {
    pendingReview: pendingReview || 0,
    totalVariants: totalVariants || 0,
    casesThisWeek: casesThisWeek || 0,
    avgTurnaround: '1.8 days', // Would calculate from completed cases
  };
}

async function getActiveCases() {
  const supabase = await createClient();
  
  const { data: cases, error } = await supabase
    .from('cases')
    .select(`
      *,
      pipeline_steps(*)
    `)
    .not('status', 'eq', 'completed')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error fetching cases:', error);
    return [];
  }
  
  return cases?.map(c => ({
    id: c.id,
    patientName: c.patient_name,
    patientDob: c.patient_dob,
    mrn: c.mrn,
    indication: c.indication,
    genePanel: c.gene_panel,
    priority: c.priority.charAt(0).toUpperCase() + c.priority.slice(1),
    status: formatStatus(c.status),
    workflowId: c.workflow_id,
    createdAt: c.created_at,
    pipelineSteps: c.pipeline_steps?.sort((a: any, b: any) => a.step_order - b.step_order).map((step: any) => ({
      name: step.step_name,
      status: step.status,
      duration: step.duration_ms ? `${(step.duration_ms / 1000).toFixed(1)}s` : undefined,
    })) || [],
  })) || [];
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

export default async function DashboardPage() {
  const [stats, activeCases] = await Promise.all([
    getStats(),
    getActiveCases(),
  ]);

  return (
    <div className="p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            GenomeReview Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            AI-powered clinical variant interpretation with WDK durable workflows
          </p>
        </div>
        <Button asChild className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/cases/new">
            <Plus className="h-4 w-4" />
            New Case
          </Link>
        </Button>
      </header>

      <div className="mb-8 grid grid-cols-3 gap-6">
        <StatCard
          title="Cases Pending Review"
          value={stats.pendingReview}
          icon={ClipboardList}
          description="Awaiting clinician review"
        />
        <StatCard
          title="Variants Analyzed"
          value={stats.totalVariants.toLocaleString()}
          icon={Dna}
          description="Total in database"
        />
        <StatCard
          title="Avg. Turnaround Time"
          value={stats.avgTurnaround}
          icon={Clock}
          description="Last 30 days"
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Active Cases</h2>
          <Link 
            href="/cases" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all cases
          </Link>
        </div>
        {activeCases.length > 0 ? (
          <CasesTable cases={activeCases} />
        ) : (
          <div className="rounded-lg border border-border/50 bg-card p-12 text-center">
            <Dna className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No active cases</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a new case to start analyzing variants with AI-powered classification.
            </p>
            <Button asChild className="mt-6 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/cases/new">
                <Plus className="h-4 w-4" />
                Create First Case
              </Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
