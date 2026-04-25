import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Download, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const supabase = await createClient();
  
  // Fetch completed cases with their summaries and variants
  const { data: completedCases, error } = await supabase
    .from('cases')
    .select(`
      *,
      ai_summaries (*),
      variants (*)
    `)
    .eq('status', 'completed')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
  }

  const reports = completedCases || [];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
        <p className="mt-1 text-muted-foreground">
          View and download finalized clinical reports
        </p>
      </header>

      {reports.length === 0 ? (
        <Card className="border-border/50 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No reports yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Finalized reports will appear here after case review and approval
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((caseData) => (
            <Card key={caseData.id} className="border-border/50 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-mono text-sm font-medium text-foreground">
                    {caseData.mrn}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {caseData.gene_panel?.join(', ')} Panel
                  </p>
                </div>
                <div className="rounded-lg bg-benign/10 p-2">
                  <FileText className="h-4 w-4 text-benign" />
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="text-foreground">
                    {new Date(caseData.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient</span>
                  <span className="text-foreground">{caseData.patient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Variants</span>
                  <span className="text-foreground">{caseData.variants?.length || 0}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1 gap-1.5">
                  <Link href={`/reports/${caseData.id}`}>
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
