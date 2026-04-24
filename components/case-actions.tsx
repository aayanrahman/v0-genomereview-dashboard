'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Case } from '@/lib/types';
import { toast } from 'sonner';
import { CheckCircle, RotateCcw, MessageSquarePlus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CaseActionsProps {
  caseData: Case;
}

export function CaseActions({ caseData }: CaseActionsProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showChangesDialog, setShowChangesDialog] = useState(false);
  const [note, setNote] = useState('');
  const [changes, setChanges] = useState('');

  const canApprove = caseData.status === 'Awaiting review' || caseData.status === 'Under review';

  const handleApprove = async () => {
    setIsApproving(true);
    
    // TODO: Call WDK workflow endpoint to approve and generate report
    // await fetch(`/api/workflows/${caseData.workflowId}/approve`, { method: 'POST' })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Report approved and delivered', {
      description: `Report for ${caseData.patientId} has been finalized.`,
    });
    
    setIsApproving(false);
    router.push(`/reports/${caseData.id}`);
  };

  const handleRequestChanges = () => {
    // TODO: Call WDK workflow endpoint to request changes
    // await fetch(`/api/workflows/${caseData.workflowId}/request-changes`, { 
    //   method: 'POST',
    //   body: JSON.stringify({ changes })
    // })
    
    toast.info('Changes requested', {
      description: 'The case has been flagged for re-analysis.',
    });
    setShowChangesDialog(false);
    setChanges('');
  };

  const handleAddNote = () => {
    // TODO: Call WDK workflow endpoint to add note
    // await fetch(`/api/workflows/${caseData.workflowId}/notes`, { 
    //   method: 'POST',
    //   body: JSON.stringify({ note })
    // })
    
    toast.success('Note added', {
      description: 'Your note has been attached to this case.',
    });
    setShowNoteDialog(false);
    setNote('');
  };

  if (caseData.status === 'Delivered') {
    return (
      <div className="fixed bottom-0 left-64 right-0 border-t border-border bg-card px-8 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            This case has been delivered on {new Date(caseData.deliveredAt!).toLocaleDateString()}
          </p>
          <Button asChild variant="outline">
            <a href={`/reports/${caseData.id}`}>View Report</a>
          </Button>
        </div>
      </div>
    );
  }

  if (caseData.status === 'In progress') {
    return (
      <div className="fixed bottom-0 left-64 right-0 border-t border-border bg-card px-8 py-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analysis in progress. Actions will be available once complete.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-0 left-64 right-0 border-t border-border bg-card px-8 py-4">
        <div className="flex items-center justify-end gap-3">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => setShowNoteDialog(true)}
          >
            <MessageSquarePlus className="h-4 w-4" />
            Add Note
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setShowChangesDialog(true)}
          >
            <RotateCcw className="h-4 w-4" />
            Request Changes
          </Button>
          <Button 
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handleApprove}
            disabled={!canApprove || isApproving}
          >
            {isApproving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Approve and Deliver Report
              </>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a clinical note to this case. Notes are visible to all reviewers.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Enter your clinical note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!note.trim()}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Describe the changes needed. The case will be flagged for re-analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="changes">Requested Changes</Label>
            <Textarea
              id="changes"
              placeholder="Describe what needs to be changed or re-analyzed..."
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangesDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRequestChanges} 
              disabled={!changes.trim()}
            >
              Request Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
