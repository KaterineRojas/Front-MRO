import { Card, CardContent, CardHeader, CardTitle } from '../../../../../ui/card';
import { Input } from '../../../../../ui/input';
import { Label } from '../../../../../ui/label';
import { Textarea } from '../../../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../ui/select';
import { Switch } from '../../../../../ui/switch';
import { Alert, AlertDescription } from '../../../../../ui/alert';
import { Separator } from '../../../../../ui/separator';
import { AlertTriangle, Calendar, ClipboardList, FileText, MapPin, Hash } from 'lucide-react';
import type { PurchaseFormData } from '../types';
import type { Company, Customer, Project, WorkOrder } from '../../../services/sharedServices';
import { validateUrl } from '../utils';
import { ProjectDetailsSection } from '../../../shared';

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
  onWorkOrderChange: (value: string, workOrder?: WorkOrder) => void;
  onFormDataChange: (field: keyof PurchaseFormData, value: any) => void;
  offlineMode?: boolean;
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
  onFormDataChange,
  offlineMode = false,
}: DetailsCardProps) {
  return (
    <Card className="flex flex-col h-[calc(100vh-16rem)]">
      <CardHeader>
        <CardTitle>Purchase Request Details</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-6 pr-1">
        {/* Section 1: Purchase Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">
            Purchase Details
          </h3>
          <div className="space-y-4">
            <PurchaseResponsibilitySection
              selfPurchase={formData.selfPurchase}
              onSelfPurchaseChange={onSelfPurchaseChange}
            />
            <ExpectedDeliverySection
              expectedDeliveryDate={formData.expectedDeliveryDate}
              onChange={(value) => onFormDataChange('expectedDeliveryDate', value)}
            />
            <ClientBilledSection
              clientBilled={formData.clientBilled}
              onToggle={onClientBilledToggle}
            />
            <PurchaseReasonSection
              purchaseReason={formData.purchaseReason}
              selfPurchase={formData.selfPurchase}
              onChange={onPurchaseReasonChange}
            />
            <JustificationSection
              justification={formData.justification}
              onChange={(value) => onFormDataChange('justification', value)}
            />
          </div>
        </div>

        <Separator />

        {/* Section 2: Project Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">
            Project Details
          </h3>
          <ProjectDetailsSection
            company={formData.company}
            customer={formData.customer}
            project={formData.project}
            workOrder={formData.workOrder}
            companies={companies}
            customers={customers}
            projects={projects}
            workOrders={workOrders}
            loadingCompanies={loadingCompanies}
            loadingCustomers={loadingCustomers}
            loadingProjects={loadingProjects}
            loadingWorkOrders={loadingWorkOrders}
            companiesLoaded={companiesLoaded}
            offlineMode={offlineMode}
            onLoadCompanies={onLoadCompanies}
            onCompanyChange={onCompanyChange}
            onCustomerChange={onCustomerChange}
            onProjectChange={onProjectChange}
            onWorkOrderSelect={onWorkOrderChange}
          />
        </div>

        <Separator />

        {/* Section 3: Address Details (Optional) */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">
            Address Details <span className="text-muted-foreground font-normal">(Optional)</span>
          </h3>
          <AddressDetailsSection
            address={formData.address}
            googleMapsUrl={formData.googleMapsUrl}
            zipCode={formData.zipCode}
            onFormDataChange={onFormDataChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface JustificationSectionProps {
  justification: string;
  onChange: (value: string) => void;
}

function JustificationSection({ justification, onChange }: JustificationSectionProps) {
  return (
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
        value={justification}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />
    </div>
  );
}

interface AddressDetailsSectionProps {
  address: string;
  googleMapsUrl: string;
  zipCode: string;
  onFormDataChange: (field: keyof PurchaseFormData, value: any) => void;
}

function AddressDetailsSection({ address, googleMapsUrl, zipCode, onFormDataChange }: AddressDetailsSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">
          <div className="flex items-center gap-2 mb-1.5">
            <MapPin className="h-4 w-4" />
            Address
          </div>
        </Label>
        <Input
          id="address"
          type="text"
          placeholder="Enter delivery address"
          value={address}
          onChange={(e) => onFormDataChange('address', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="location">Location URL</Label>
        <Input
          id="location"
          type="text"
          placeholder="Enter Google Maps link or location URL"
          value={googleMapsUrl}
          onChange={(e) => onFormDataChange('googleMapsUrl', e.target.value)}
        />
        {googleMapsUrl && !validateUrl(googleMapsUrl) && (
          <p className="text-xs text-red-500 mt-1">Please enter a valid URL</p>
        )}
      </div>

      <div>
        <Label htmlFor="zipCode">ZIP Code</Label>
        <Input
          id="zipCode"
          type="text"
          placeholder="Enter ZIP code (max 6 characters)"
          value={zipCode}
          onChange={(e) => {
            const value = e.target.value.slice(0, 6);
            onFormDataChange('zipCode', value);
          }}
          maxLength={6}
        />
        <p className="text-xs text-muted-foreground mt-1">{zipCode.length}/6</p>
      </div>
    </div>
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
