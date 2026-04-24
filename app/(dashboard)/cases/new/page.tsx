import Link from 'next/link';
import { NewCaseForm } from '@/components/new-case-form';
import { ArrowLeft } from 'lucide-react';

export default function NewCasePage() {
  return (
    <div className="p-8">
      <Link 
        href="/" 
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">New Case Intake</h1>
        <p className="mt-1 text-muted-foreground">
          Submit a new patient sample for genomic variant analysis
        </p>
      </header>

      <NewCaseForm />
    </div>
  );
}
