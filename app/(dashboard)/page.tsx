import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/stat-card';
import { CasesTable } from '@/components/cases-table';
import { mockCases, getStats } from '@/lib/mock-cases';
import { ClipboardList, Dna, Clock, Plus } from 'lucide-react';

export default function DashboardPage() {
  const stats = getStats();
  const activeCases = mockCases.filter(c => c.status !== 'Delivered');

  return (
    <div className="p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Good morning, Dr. Torres
          </h1>
          <p className="mt-1 text-muted-foreground">
            {"Here's an overview of your pending cases and recent activity."}
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
          value={stats.variantsThisWeek}
          icon={Dna}
          description="This week"
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
        <CasesTable cases={activeCases} />
      </section>
    </div>
  );
}
