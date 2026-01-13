/**
 * Reports Component - Main Entry Point
 * Following SOLID Principles:
 * - Single Responsibility: Main component only handles tab navigation and export
 * - Open/Closed: Easy to add new tabs without modifying existing code
 * - Liskov Substitution: All tab components follow same interface
 * - Interface Segregation: Each tab component is independent
 * - Dependency Inversion: Components depend on abstractions (types) not concrete implementations
 */

import { useState } from 'react';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Download } from 'lucide-react';

// Import tab components
import { OverviewTab } from './tabs/OverviewTab';
import { ConsumptionTab } from './tabs/ConsumptionTab';
import { TrackingTab } from '../inventory/tabs/Tracking/TrackingTab';
import { EngineersTab } from './tabs/EngineersTab';
import { ProjectsTab } from './tabs/ProjectsTab';

// Import types and utilities
import { TabType } from './types';
import { exportReport } from './utils/reportUtils';


/**
 * Main Reports Component
 * Responsibilities:
 * - Tab navigation management
 * - Export functionality coordination
 * - Layout structure
 */
export function Reports() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const handleExport = () => {
    exportReport(activeTab);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for inventory management
          </p>
        </div>
        
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Tabs Navigation and Content */}
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as TabType)} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="engineers">Engineers</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <OverviewTab />
        </TabsContent>
        
        <TabsContent value="consumption" className="space-y-6 mt-6">
          <ConsumptionTab />
        </TabsContent>
        
        <TabsContent value="tracking" className="space-y-6 mt-6">
          <TrackingTab />
        </TabsContent>
        
        <TabsContent value="engineers" className="space-y-6 mt-6">
          <EngineersTab />
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-6 mt-6">
          <ProjectsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

