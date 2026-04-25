'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { GENE_PANELS } from '@/lib/types';
import { toast } from 'sonner';
import { Upload, X, Check, Loader2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NewCaseForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [trioMode, setTrioMode] = useState(false);
  
  const [formData, setFormData] = useState({
    patientName: '',
    patientDob: '',
    mrn: '',
    orderingPhysician: '',
    indication: '',
    genePanels: [] as string[],
    vcfFile: null as File | null,
    priority: 'routine' as 'routine' | 'urgent' | 'stat',
    // Trio mode data
    probandSex: 'male' as 'male' | 'female',
    motherVcfFile: null as File | null,
    fatherVcfFile: null as File | null,
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.vcf') || file.name.endsWith('.vcf.gz')) {
        setFormData(prev => ({ ...prev, vcfFile: file }));
      } else {
        toast.error('Invalid file type', {
          description: 'Please upload a VCF file (.vcf or .vcf.gz)',
        });
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'proband' | 'mother' | 'father' = 'proband') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (target === 'proband') {
        setFormData(prev => ({ ...prev, vcfFile: file }));
      } else if (target === 'mother') {
        setFormData(prev => ({ ...prev, motherVcfFile: file }));
      } else {
        setFormData(prev => ({ ...prev, fatherVcfFile: file }));
      }
    }
  };

  const togglePanel = (panelId: string) => {
    setFormData(prev => ({
      ...prev,
      genePanels: prev.genePanels.includes(panelId)
        ? prev.genePanels.filter(id => id !== panelId)
        : [...prev.genePanels, panelId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get selected genes from panels
      const selectedGenes = formData.genePanels.flatMap(panelId => {
        const panel = GENE_PANELS.find(p => p.id === panelId);
        return panel?.genes || [];
      });

      // Read VCF file content if present
      let vcfData: string | undefined;
      if (formData.vcfFile) {
        vcfData = await formData.vcfFile.text();
      }

      // Build request body
      const requestBody: Record<string, unknown> = {
        patientName: formData.patientName,
        patientDob: formData.patientDob,
        mrn: formData.mrn,
        orderingPhysician: formData.orderingPhysician,
        indication: formData.indication,
        genePanel: [...new Set(selectedGenes)], // Deduplicate genes
        priority: formData.priority,
        vcfData,
      };

      // Add trio data if in trio mode
      if (trioMode) {
        requestBody.trioMode = true;
        requestBody.probandSex = formData.probandSex;
        if (formData.motherVcfFile) {
          requestBody.motherVcfData = await formData.motherVcfFile.text();
        }
        if (formData.fatherVcfFile) {
          requestBody.fatherVcfData = await formData.fatherVcfFile.text();
        }
      }

      // Call the real WDK workflow endpoint
      const response = await fetch('/api/workflows/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start workflow');
      }

      toast.success(trioMode ? 'Trio pipeline started' : 'Durable pipeline started', {
        description: (
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs">Workflow ID: {result.workflowId}</span>
            <span className="text-xs text-muted-foreground">
              Case ID: {result.caseId}
            </span>
          </div>
        ),
        duration: 8000,
      });
      
      // Navigate to the case detail page to see live pipeline
      router.push(`/cases/${result.caseId}`);
      
    } catch (error) {
      console.error('Workflow start error:', error);
      toast.error('Failed to start analysis', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = 
    formData.patientName && 
    formData.patientDob && 
    formData.mrn &&
    formData.orderingPhysician &&
    formData.indication && 
    formData.genePanels.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="border-border/50 p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">Patient Information</h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="patientName">Patient Name</Label>
            <Input
              id="patientName"
              placeholder="Full name"
              value={formData.patientName}
              onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="patientDob">Date of Birth</Label>
            <Input
              id="patientDob"
              type="date"
              value={formData.patientDob}
              onChange={(e) => setFormData(prev => ({ ...prev, patientDob: e.target.value }))}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="mrn">Medical Record Number (MRN)</Label>
            <Input
              id="mrn"
              placeholder="MRN-XXXXXXX"
              value={formData.mrn}
              onChange={(e) => setFormData(prev => ({ ...prev, mrn: e.target.value }))}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="orderingPhysician">Ordering Physician</Label>
            <Input
              id="orderingPhysician"
              placeholder="Dr. Name"
              value={formData.orderingPhysician}
              onChange={(e) => setFormData(prev => ({ ...prev, orderingPhysician: e.target.value }))}
              className="mt-2"
            />
          </div>
        </div>

        <div className="mt-6">
          <Label htmlFor="indication">Clinical Indication</Label>
          <Textarea
            id="indication"
            placeholder="Describe the clinical indication, family history, and reason for testing..."
            value={formData.indication}
            onChange={(e) => setFormData(prev => ({ ...prev, indication: e.target.value }))}
            className="mt-2"
            rows={4}
          />
        </div>
      </Card>

      <Card className="border-border/50 p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">Gene Panel Selection</h2>
        
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {GENE_PANELS.map((panel) => {
            const isSelected = formData.genePanels.includes(panel.id);
            return (
              <button
                key={panel.id}
                type="button"
                onClick={() => togglePanel(panel.id)}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                  isSelected 
                    ? 'border-accent bg-accent/5' 
                    : 'border-border/50 hover:border-border hover:bg-muted/30'
                )}
              >
                <div className={cn(
                  'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border',
                  isSelected 
                    ? 'border-accent bg-accent text-white' 
                    : 'border-border'
                )}>
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{panel.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {panel.genes.slice(0, 4).join(', ')}
                    {panel.genes.length > 4 && ` +${panel.genes.length - 4} more`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Family Trio Mode Toggle (Feature 4) */}
      <Card className="border-border/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Family Trio Analysis</h2>
              <p className="text-sm text-muted-foreground">Analyze proband with parents to identify inheritance patterns</p>
            </div>
          </div>
          <Switch
            checked={trioMode}
            onCheckedChange={setTrioMode}
          />
        </div>

        {trioMode && (
          <div className="space-y-6 border-t border-border/50 pt-6">
            {/* Proband */}
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Proband VCF</h3>
                <div className="flex items-center gap-2">
                  <Label htmlFor="probandSex" className="text-xs text-muted-foreground">Biological sex:</Label>
                  <select
                    id="probandSex"
                    value={formData.probandSex}
                    onChange={(e) => setFormData(prev => ({ ...prev, probandSex: e.target.value as 'male' | 'female' }))}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div className="relative rounded-md border border-dashed border-border p-4 text-center">
                {formData.vcfFile ? (
                  <div className="flex items-center justify-center gap-2 text-benign">
                    <Check className="h-4 w-4" />
                    <span className="text-sm font-medium">{formData.vcfFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, vcfFile: null }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Drop VCF or click to upload</p>
                    <input
                      type="file"
                      accept=".vcf,.vcf.gz"
                      onChange={(e) => handleFileChange(e, 'proband')}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Mother */}
            <div className="rounded-lg border border-border/50 p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Mother VCF</h3>
              <div className="relative rounded-md border border-dashed border-border p-4 text-center">
                {formData.motherVcfFile ? (
                  <div className="flex items-center justify-center gap-2 text-benign">
                    <Check className="h-4 w-4" />
                    <span className="text-sm font-medium">{formData.motherVcfFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, motherVcfFile: null }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Drop VCF or click to upload (optional)</p>
                    <input
                      type="file"
                      accept=".vcf,.vcf.gz"
                      onChange={(e) => handleFileChange(e, 'mother')}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Father */}
            <div className="rounded-lg border border-border/50 p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Father VCF</h3>
              <div className="relative rounded-md border border-dashed border-border p-4 text-center">
                {formData.fatherVcfFile ? (
                  <div className="flex items-center justify-center gap-2 text-benign">
                    <Check className="h-4 w-4" />
                    <span className="text-sm font-medium">{formData.fatherVcfFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, fatherVcfFile: null }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Drop VCF or click to upload (optional)</p>
                    <input
                      type="file"
                      accept=".vcf,.vcf.gz"
                      onChange={(e) => handleFileChange(e, 'father')}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Standard VCF upload (hidden when trio mode is on) */}
      {!trioMode && (
        <Card className="border-border/50 p-6">
          <h2 className="mb-6 text-lg font-semibold text-foreground">VCF File Upload (Optional)</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Upload a VCF file for analysis. If not provided, demo variants will be generated based on selected gene panels.
          </p>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors',
              dragActive && 'border-accent bg-accent/5',
              formData.vcfFile && 'border-benign bg-benign/5',
              !dragActive && !formData.vcfFile && 'border-border hover:border-muted-foreground'
            )}
          >
            {formData.vcfFile ? (
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-benign">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">{formData.vcfFile.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, vcfFile: null }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium text-foreground">
                  Drag and drop your VCF file here
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  or click to browse (.vcf, .vcf.gz)
                </p>
                <input
                  type="file"
                  accept=".vcf,.vcf.gz"
                  onChange={(e) => handleFileChange(e)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </>
            )}
          </div>
        </Card>
      )}

      <Card className="border-border/50 p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">Priority</h2>
        
        <RadioGroup
          value={formData.priority}
          onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as typeof formData.priority }))}
          className="flex gap-4"
        >
          {[
            { value: 'routine', label: 'Routine', description: 'Standard turnaround (2-3 days)' },
            { value: 'urgent', label: 'Urgent', description: 'Expedited processing (24 hours)' },
            { value: 'stat', label: 'Stat', description: 'Immediate priority (6-8 hours)' },
          ].map((option) => (
            <label
              key={option.value}
              className={cn(
                'flex flex-1 cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors',
                formData.priority === option.value 
                  ? 'border-accent bg-accent/5' 
                  : 'border-border/50 hover:border-border'
              )}
            >
              <RadioGroupItem value={option.value} className="mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </label>
          ))}
        </RadioGroup>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!isValid || isSubmitting}
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {trioMode ? 'Starting Trio Pipeline...' : 'Starting Pipeline...'}
            </>
          ) : (
            trioMode ? 'Start Trio Analysis' : 'Start Analysis'
          )}
        </Button>
      </div>
    </form>
  );
}
