import React from 'react';
import { Button } from '../../../../../ui/button';
import { ArrowLeft } from 'lucide-react';

interface FormHeaderProps {
  onBack: (() => void) | null;
}

export function FormHeader({ onBack }: FormHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="sm" onClick={onBack ?? undefined}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Requests
      </Button>
      <div>
        <h1 className="text-2xl font-bold">Purchase Form</h1>
        <p className="text-sm text-muted-foreground">
          Request the acquisition of new items
        </p>
      </div>
    </div>
  );
}

interface FormActionsProps {
  onBack: (() => void) | null;
  submitting: boolean;
  submitLabel: string;
}

export function FormActions({ onBack, submitting, submitLabel }: FormActionsProps) {
  return (
    <div className="flex gap-4">
      <Button type="button" variant="outline" onClick={onBack ?? undefined}>
        Cancel
      </Button>
      <Button type="submit" className="flex-1" disabled={submitting}>
        {submitLabel}
      </Button>
    </div>
  );
}
