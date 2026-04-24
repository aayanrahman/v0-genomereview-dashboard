import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CasesTable } from '@/components/cases-table';
import { mockCases } from '@/lib/mock-cases';
import { Plus } from 'lucide-react';

export default function CasesPage() {
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

      <CasesTable cases={mockCases} />
    </div>
  );
}
