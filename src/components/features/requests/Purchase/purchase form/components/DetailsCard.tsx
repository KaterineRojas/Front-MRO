import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../ui/card';
import { Input } from '../../../../../ui/input';
import { Label } from '../../../../../ui/label';
import { Textarea } from '../../../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../ui/select';
import { Switch } from '../../../../../ui/switch';
import { Alert, AlertDescription } from '../../../../../ui/alert';
import { AlertTriangle, Calendar, ClipboardList, Building, User, FolderOpen, Hash, FileText } from 'lucide-react';
import type { PurchaseFormData } from '../types';
import type { Company, Customer, Project, WorkOrder } from '../../../services/sharedServices';
import { validateUrl } from '../utils';

interface DetailsCardProps {
  formData: PurchaseFormData;
  companies: Company[];
  customers: Customer[];
  projects: Project[];
  workOrders: WorkOrder[];
  loadingCompanies: boolean;
  loadingCustomers: boolean;
  loadingProjects: boolean;
  loadingWorkOrders: boolean;
  companiesLoaded: boolean;
  onLoadCompanies: () => void;
  onSelfPurchaseChange: (value: string) => void;
  onClientBilledToggle: (checked: boolean) => void;
  onPurchaseReasonChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onCustomerChange: (value: string) => void;
  onProjectChange: (value: string) => void;
  onWorkOrderChange: (value: string) => void;
  onFormDataChange: (field: keyof PurchaseFormData, value: any) => void;
}

export function DetailsCard({
  formData,
  companies,
  customers,
  projects,
  workOrders,
  loadingCompanies,
  loadingCustomers,
  loadingProjects,
  loadingWorkOrders,
  companiesLoaded,
  onLoadCompanies,
  onSelfPurchaseChange,
  onClientBilledToggle,
  onPurchaseReasonChange,
  onCompanyChange,
  onCustomerChange,
  onProjectChange,
  onWorkOrderChange,
  onFormDataChange
}: DetailsCardProps) {
  return (
    <Card className="flex flex-col h-[calc(100vh-16rem)]">
      <CardHeader>
        <CardTitle>Purchase Details</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-6 pr-1">
        {/* Purchase Responsibility */}
        <PurchaseResponsibilitySection
          selfPurchase={formData.selfPurchase}
          onSelfPurchaseChange={onSelfPurchaseChange}
        />

        {/* Expected Delivery Date */}
        <ExpectedDeliverySection
          expectedDeliveryDate={formData.expectedDeliveryDate}
          onChange={(value) => onFormDataChange('expectedDeliveryDate', value)}
        />

        {/* Client Billed */}
        <ClientBilledSection
          clientBilled={formData.clientBilled}
          onToggle={onClientBilledToggle}
        />

        {/* Purchase Reason */}
        <PurchaseReasonSection
          purchaseReason={formData.purchaseReason}
          selfPurchase={formData.selfPurchase}
          onChange={onPurchaseReasonChange}
        />

        {/* Company */}
        <CompanySection
          company={formData.company}
          companies={companies}
          loading={loadingCompanies}
          loaded={companiesLoaded}
          onChange={onCompanyChange}
          onOpen={onLoadCompanies}
        />

        {/* Customer */}
        <CustomerSection
          customer={formData.customer}
          company={formData.company}
          customers={customers}
          loading={loadingCustomers}
          onChange={onCustomerChange}
        />

        {/* Project */}
        <ProjectSection
          project={formData.project}
          customer={formData.customer}
          projects={projects}
          loading={loadingProjects}
          onChange={onProjectChange}
        />

        {/* Work Order */}
        <WorkOrderSection
          workOrder={formData.workOrder}
          project={formData.project}
          workOrders={workOrders}
          loading={loadingWorkOrders}
          onChange={onWorkOrderChange}
        />

        {/* Address */}
        <div>
          <Label htmlFor="address">Address (optional)</Label>
          <Input
            id="address"
            type="text"
            placeholder="Enter delivery address"
            value={formData.address}
            onChange={(e) => onFormDataChange('address', e.target.value)}
          />
        </div>

        {/* Location URL */}
        <div>
          <Label htmlFor="location">Location URL (optional)</Label>
          <Input
            id="location"
            type="text"
            placeholder="Enter Google Maps link or location URL"
            value={formData.googleMapsUrl}
            onChange={(e) => onFormDataChange('googleMapsUrl', e.target.value)}
          />
          {formData.googleMapsUrl && !validateUrl(formData.googleMapsUrl) && (
            <p className="text-xs text-red-500 mt-1">Please enter a valid URL</p>
          )}
        </div>

        {/* ZIP Code */}
        <div>
          <Label htmlFor="zipCode">ZIP Code (optional)</Label>
          <Input
            id="zipCode"
            type="text"
            placeholder="Enter ZIP code (max 6 characters)"
            value={formData.zipCode}
            onChange={(e) => {
              const value = e.target.value.slice(0, 6);
              onFormDataChange('zipCode', value);
            }}
            maxLength={6}
          />
          <p className="text-xs text-muted-foreground mt-1">{formData.zipCode.length}/6</p>
        </div>

        {/* Justification */}
        <div>
          <Label htmlFor="justification">
            <div className="flex items-center gap-2 mb-1.5">
              <FileText className="h-4 w-4" />
              Justification
            </div>
          </Label>
          <Textarea
            id="justification"
            placeholder="Explain why this purchase is needed..."
            value={formData.justification}
            onChange={(e) => onFormDataChange('justification', e.target.value)}
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Sub-components for better organization

interface PurchaseResponsibilitySectionProps {
  selfPurchase: boolean;
  onSelfPurchaseChange: (value: string) => void;
}

function PurchaseResponsibilitySection({ selfPurchase, onSelfPurchaseChange }: PurchaseResponsibilitySectionProps) {
  return (
    <div>
      <Label className="text-sm font-medium text-foreground">Purchase Responsibility</Label>
      <div className="mt-3 flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {selfPurchase ? 'I will make this purchase' : 'Keeper will make this purchase'}
          </p>
          <p className="text-xs text-muted-foreground">Toggle to decide who completes the purchase.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase text-muted-foreground">Keeper</span>
          <Switch
            checked={selfPurchase}
            onCheckedChange={(checked: boolean) => onSelfPurchaseChange(checked ? 'self' : 'keeper')}
            aria-label="Toggle purchase responsibility"
          />
          <span className="text-xs uppercase text-muted-foreground">Self</span>
        </div>
      </div>
      {selfPurchase && (
        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            By selecting this option, the reason is automatically set to "Urgent" and cannot be edited.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

interface ExpectedDeliverySectionProps {
  expectedDeliveryDate: string;
  onChange: (value: string) => void;
}

function ExpectedDeliverySection({ expectedDeliveryDate, onChange }: ExpectedDeliverySectionProps) {
  return (
    <div>
      <Label>
        <div className="flex items-center gap-2 mb-1.5">
          <Calendar className="h-4 w-4" />
          Expected Delivery Date
        </div>
      </Label>
      <div className="relative">
        <Input
          type="date"
          value={expectedDeliveryDate}
          onChange={(e) => onChange(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
        <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}

interface ClientBilledSectionProps {
  clientBilled: 'yes' | 'no';
  onToggle: (checked: boolean) => void;
}

function ClientBilledSection({ clientBilled, onToggle }: ClientBilledSectionProps) {
  return (
    <div>
      <Label>
        <div className="flex items-center gap-2 mb-1.5">
          <Hash className="h-4 w-4" />
          Client Billed
        </div>
      </Label>
      <div className="mt-3 flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {clientBilled === 'yes' ? 'Client will be billed' : 'Client will not be billed'}
          </p>
          <p className="text-xs text-muted-foreground">Toggle to set client billing for this request.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase text-muted-foreground">No</span>
          <Switch
            checked={clientBilled === 'yes'}
            onCheckedChange={onToggle}
            aria-label="Toggle client billed"
          />
          <span className="text-xs uppercase text-muted-foreground">Yes</span>
        </div>
      </div>
    </div>
  );
}

interface PurchaseReasonSectionProps {
  purchaseReason: string;
  selfPurchase: boolean;
  onChange: (value: string) => void;
}

function PurchaseReasonSection({ purchaseReason, selfPurchase, onChange }: PurchaseReasonSectionProps) {
  return (
    <div>
      <Label>
        <div className="flex items-center gap-2 mb-1.5">
          <ClipboardList className="h-4 w-4" />
          Purchase Reason
        </div>
      </Label>
      <Select
        value={purchaseReason}
        onValueChange={onChange}
        disabled={selfPurchase}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a reason" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low-stock">Low stock</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
          <SelectItem value="new-project">New project</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

interface CompanySectionProps {
  company: string;
  companies: Company[];
  loading: boolean;
  loaded: boolean;
  onChange: (value: string) => void;
  onOpen: () => void;
}

function CompanySection({ company, companies, loading, loaded, onChange, onOpen }: CompanySectionProps) {
  return (
    <div>
      <Label htmlFor="company">
        <div className="flex items-center gap-2 mb-1.5">
          <Building className="h-4 w-4" />
          Company *
          {loading && <span className="text-xs text-muted-foreground">(Loading...)</span>}
        </div>
      </Label>
      <Select
        value={company}
        onValueChange={onChange}
        onOpenChange={(open: boolean) => {
          if (open && !loaded) {
            onOpen();
          }
        }}
      >
        <SelectTrigger id="company">
          <SelectValue placeholder={loading ? 'Loading companies...' : 'Select a company'} />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="_loading" disabled>Loading companies...</SelectItem>
          ) : (
            <>
              {!loaded && (
                <SelectItem value="_prefetch" disabled>Click to load companies...</SelectItem>
              )}
              {companies.map((c) => (
                <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
              ))}
              {loaded && companies.length === 0 && (
                <SelectItem value="_no_companies" disabled>No companies available</SelectItem>
              )}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

interface CustomerSectionProps {
  customer: string;
  company: string;
  customers: Customer[];
  loading: boolean;
  onChange: (value: string) => void;
}

function CustomerSection({ customer, company, customers, loading, onChange }: CustomerSectionProps) {
  return (
    <div>
      <Label htmlFor="customer">
        <div className="flex items-center gap-2 mb-1.5">
          <User className="h-4 w-4" />
          Customer *
          {loading && <span className="text-xs text-muted-foreground">(Loading...)</span>}
        </div>
      </Label>
      <Select value={customer} onValueChange={onChange}>
        <SelectTrigger id="customer" disabled={!company || loading}>
          <SelectValue
            placeholder={
              !company
                ? 'Select a company first'
                : loading
                  ? 'Loading customers...'
                  : 'Select a customer'
            }
          />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="_loading" disabled>Loading customers...</SelectItem>
          ) : customers.length > 0 ? (
            customers.map((c) => (
              <SelectItem key={c.id} value={c.name}>
                {c.name}{c.code ? ` (${c.code})` : ''}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="_no_customers" disabled>
              {company ? 'No customers available' : 'Select a company first'}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

interface ProjectSectionProps {
  project: string;
  customer: string;
  projects: Project[];
  loading: boolean;
  onChange: (value: string) => void;
}

function ProjectSection({ project, customer, projects, loading, onChange }: ProjectSectionProps) {
  return (
    <div>
      <Label htmlFor="project">
        <div className="flex items-center gap-2 mb-1.5">
          <FolderOpen className="h-4 w-4" />
          Project *
          {loading && <span className="text-xs text-muted-foreground">(Loading...)</span>}
        </div>
      </Label>
      <Select value={project} onValueChange={onChange}>
        <SelectTrigger id="project" disabled={!customer || loading}>
          <SelectValue
            placeholder={
              !customer
                ? 'Select a customer first'
                : loading
                  ? 'Loading projects...'
                  : 'Select a project'
            }
          />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="_loading" disabled>Loading projects...</SelectItem>
          ) : projects.length > 0 ? (
            projects.map((p) => (
              <SelectItem key={p.id} value={p.name}>
                {p.name}{p.code ? ` (${p.code})` : ''}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="_no_projects" disabled>
              {customer ? 'No projects available' : 'Select a customer first'}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

interface WorkOrderSectionProps {
  workOrder: string;
  project: string;
  workOrders: WorkOrder[];
  loading: boolean;
  onChange: (value: string) => void;
}

function WorkOrderSection({ workOrder, project, workOrders, loading, onChange }: WorkOrderSectionProps) {
  return (
    <div>
      <Label htmlFor="workOrder">
        <div className="flex items-center gap-2 mb-1.5">
          <Hash className="h-4 w-4" />
          Work Order #
          {loading && <span className="text-xs text-muted-foreground">(Loading...)</span>}
        </div>
      </Label>
      <Select value={workOrder} onValueChange={onChange}>
        <SelectTrigger id="workOrder" disabled={!project || loading}>
          <SelectValue
            placeholder={
              !project
                ? 'Select a project first'
                : loading
                  ? 'Loading work orders...'
                  : 'Select a work order'
            }
          />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="_loading" disabled>Loading work orders...</SelectItem>
          ) : workOrders.length > 0 ? (
            workOrders.map((wo) => (
              <SelectItem key={wo.id ?? wo.wo} value={wo.wo}>
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">{wo.wo}</span>
                  {wo.serviceDesc && (
                    <span className="text-xs text-muted-foreground">{wo.serviceDesc}</span>
                  )}
                </span>
              </SelectItem>
            ))
          ) : (
            <SelectItem value="_no_workorders" disabled>
              {project ? 'No work orders available' : 'Select a project first'}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
