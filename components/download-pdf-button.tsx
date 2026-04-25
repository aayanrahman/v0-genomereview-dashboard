'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function DownloadPdfButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={() => window.print()}
    >
      <Download className="h-4 w-4" />
      Download PDF
    </Button>
  );
}
