
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../ui/card';
import { Input } from '../../../../../ui/input';
import { Label } from '../../../../../ui/label';
import { Textarea } from '../../../../../ui/textarea';
import { Separator } from '../../../../../ui/separator';
import {
  Calendar,
  FileText,
  MapPin,
} from 'lucide-react';
import type {
  LoanFormData,
  Company,
  Customer,
  Project,
  WorkOrder,
} from '../types';
import { getMinDate, isValidUrl } from '../utils';
import { ProjectDetailsSection } from '../../../shared';

interface ReturnDateSectionProps {
  value: string;
  onChange: (value: string) => void;
}

function ReturnDateSection({ value, onChange }: ReturnDateSectionProps) {
  return (
    <div>
      <Label htmlFor="returnDate">
        <div className="flex items-center gap-2 mb-1.5">
          <Calendar className="h-4 w-4" />
          Return Date *
        </div>
      </Label>
      <div className="relative">
        <Input
          id="returnDate"
          type="date"
          min={getMinDate()}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
}

interface NotesSectionProps {
  value: string;
  onChange: (value: string) => void;
}

function NotesSection({ value, onChange }: NotesSectionProps) {
  return (
    <div>
      <Label htmlFor="notes">
        <div className="flex items-center gap-2 mb-1.5">
          <FileText className="h-4 w-4" />
          Additional Notes (optional)
        </div>
      </Label>
      <Textarea
        id="notes"
        placeholder="Additional information about the borrow request..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
      />
    </div>
  );
}

interface AddressDetailsSectionProps {
  formData: LoanFormData;
  onFormDataChange: (field: keyof LoanFormData, value: string) => void;
}

function AddressDetailsSection({ formData, onFormDataChange }: AddressDetailsSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">
          <div className="flex items-center gap-2 mb-1.5">
            <MapPin className="h-4 w-4" />
            Address (optional)
          </div>
        </Label>
        <Input
          id="address"
          type="text"
          placeholder="Enter delivery address"
          value={formData.address}
          onChange={(e) => onFormDataChange('address', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="location">Location URL (optional)</Label>
        <Input
          id="location"
          type="text"
          placeholder="Enter Google Maps link or location URL"
          value={formData.googleMapsUrl}
          onChange={(e) => onFormDataChange('googleMapsUrl', e.target.value)}
        />
        {formData.googleMapsUrl && !isValidUrl(formData.googleMapsUrl) && (
          <p className="text-xs text-red-500 mt-1">Please enter a valid URL</p>
        )}
      </div>

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
        <p className="text-xs text-muted-foreground mt-1">
          {formData.zipCode.length}/6
        </p>
      </div>
    </div>
  );
}

interface DetailsCardProps {
  formData: LoanFormData;
  companies: Company[];
  customers: Customer[];
  projects: Project[];
  workOrders: WorkOrder[];
  loadingCompanies: boolean;
  loadingCustomers: boolean;
  loadingProjects: boolean;
  loadingWorkOrders: boolean;
  companiesLoaded: boolean;
  offlineMode: boolean;
  onLoadCompanies: () => void;
  onFormDataChange: (field: keyof LoanFormData, value: string) => void;
  onWorkOrderSelect: (value: string, workOrder?: WorkOrder) => void;
}

/**
 * Right panel card for borrow details - organized in 3 sections
 */
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
  offlineMode,
  onLoadCompanies,
  onFormDataChange,
  onWorkOrderSelect,
}: DetailsCardProps) {
  return (
    <Card className="flex flex-col h-[calc(100vh-16rem)]">
      <CardHeader>
        <CardTitle>Borrow Request Details</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-6">
        {/* Section 1: Project Details */}
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
            onCompanyChange={(value) => onFormDataChange('company', value)}
            onCustomerChange={(value) => onFormDataChange('customer', value)}
            onProjectChange={(value) => onFormDataChange('project', value)}
            onWorkOrderSelect={onWorkOrderSelect}
          />
        </div>

        <Separator />

        {/* Section 2: Address Details (Optional) */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">
            Address Details <span className="text-muted-foreground font-normal">(Optional)</span>
          </h3>
          <AddressDetailsSection
            formData={formData}
            onFormDataChange={onFormDataChange}
          />
        </div>

        <Separator />

        {/* Section 3: Borrow Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">
            Borrow Details
          </h3>
          <div className="space-y-4">
            <ReturnDateSection
              value={formData.returnDate}
              onChange={(value) => onFormDataChange('returnDate', value)}
            />
            <NotesSection
              value={formData.notes}
              onChange={(value) => onFormDataChange('notes', value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
