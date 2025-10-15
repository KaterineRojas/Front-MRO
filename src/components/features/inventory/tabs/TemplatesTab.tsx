import React from 'react';
import { Card, CardContent } from '../../../ui/card';
import { TemplateManager } from '../tab/TemplateManager';

interface TemplatesTabProps {
  onCreateKitFromTemplate: (template: any) => void;
  onEditTemplate: (template: any) => void;
  onCreateNewTemplate: () => void;
}

export function TemplatesTab({
  onCreateKitFromTemplate,
  onEditTemplate,
  onCreateNewTemplate
}: TemplatesTabProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <TemplateManager
          onCreateKitFromTemplate={onCreateKitFromTemplate}
          onEditTemplate={onEditTemplate}
          onCreateNewTemplate={onCreateNewTemplate}
        />
      </CardContent>
    </Card>
  );
}
