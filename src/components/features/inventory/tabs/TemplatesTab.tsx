import React from 'react';
import { TemplateManager } from '../../../TemplateManager';
import type { Article, Template } from '../types';

interface TemplatesTabProps {
  articles: Article[];
  onCreateKitFromTemplate: (template: Template) => void;
  onEditTemplate: (template: Template) => void;
  onCreateNewTemplate: () => void;
}

export function TemplatesTab({
  articles,
  onCreateKitFromTemplate,
  onEditTemplate,
  onCreateNewTemplate
}: TemplatesTabProps) {
  return (
    <TemplateManager 
      articles={articles}
      onCreateKitFromTemplate={onCreateKitFromTemplate}
      onEditTemplate={onEditTemplate}
      onCreateNewTemplate={onCreateNewTemplate}
    />
  );
}
