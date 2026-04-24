'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GENE_PANELS } from '@/lib/types';
import { toast } from 'sonner';
import { Upload, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NewCaseForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const [formData, setFormData] = useState({
    patientId: '',
    age: '',
    sex: 'Female' as 'Male' | 'Female' | 'Other',
    indication: '',
    genePanels: [] as string[],
    vcfFile: null as File | null,
    priority: 'Routine' as 'Routine' | 'Urgent' | 'Stat',
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, vcfFile: e.target.files![0] }));
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

    // TODO: Call WDK workflow endpoint to start analysis
    // const response = await fetch('/api/workflows/start', {
    //   method: 'POST',
    //   body: formData
    // });
    // const { workflowId } = await response.json();

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const workflowId = `wf_${Math.random().toString(36).substring(2, 10)}`;
    const caseId = `case-${Date.now()}`;
    
    toast.success('Durable pipeline started', {
      description: (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs">ID: {workflowId}</span>
          <a 
            href={`/cases/case-005`}
            className="text-xs text-accent hover:underline"
          >
            View live pipeline →
          </a>
        </div>
      ),
      duration: 8000,
    });
    
    setIsSubmitting(false);
    // Navigate to the case detail page to see live pipeline
    router.push('/cases/case-005');
  };

  const isValid = 
    formData.patientId && 
    formData.age && 
    formData.indication && 
    formData.genePanels.length > 0 && 
    formData.vcfFile;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="border-border/50 p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">Patient Information</h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <Label htmlFor="patientId">Patient ID</Label>
            <Input
              id="patientId"
              placeholder="PT-2024-XXXXX"
              value={formData.patientId}
              onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="Age in years"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label>Biological Sex</Label>
            <RadioGroup
              value={formData.sex}
              onValueChange={(value) => setFormData(prev => ({ ...prev, sex: value as typeof formData.sex }))}
              className="mt-2 flex gap-4"
            >
              {['Female', 'Male', 'Other'].map((sex) => (
                <div key={sex} className="flex items-center gap-2">
                  <RadioGroupItem value={sex} id={sex} />
                  <Label htmlFor={sex} className="font-normal cursor-pointer">{sex}</Label>
                </div>
              ))}
            </RadioGroup>
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

      <Card className="border-border/50 p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">VCF File Upload</h2>
        
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
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </>
          )}
        </div>
      </Card>

      <Card className="border-border/50 p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">Priority</h2>
        
        <RadioGroup
          value={formData.priority}
          onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as typeof formData.priority }))}
          className="flex gap-4"
        >
          {[
            { value: 'Routine', description: 'Standard turnaround (2-3 days)' },
            { value: 'Urgent', description: 'Expedited processing (24 hours)' },
            { value: 'Stat', description: 'Immediate priority (6-8 hours)' },
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
                <p className="font-medium text-foreground">{option.value}</p>
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
              Starting Analysis...
            </>
          ) : (
            'Start Analysis'
          )}
        </Button>
      </div>
    </form>
  );
}
