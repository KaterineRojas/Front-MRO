import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../ui/card';
import { Button } from '../../../../../ui/button';
import { Input } from '../../../../../ui/input';
import { Label } from '../../../../../ui/label';
import { Textarea } from '../../../../../ui/textarea';
import { Badge } from '../../../../../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../ui/select';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../../../ui/hover-card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../../../ui/dialog';
import {
  Package,
  Calendar,
  Building,
  User as UserIcon,
  FolderOpen,
  Hash,
} from 'lucide-react';
import type { User } from '../../../../enginner/types';
import type {
  LoanFormData,
  Company,
  Customer,
  Project,
  WorkOrder,
} from '../types';
import { formatWorkOrderDate, getMinDate, isValidUrl } from '../utils';

interface DepartmentSectionProps {
  currentUser: User;
}

function DepartmentSection({ currentUser }: DepartmentSectionProps) {
  return (
    <div>
      <Label htmlFor="department">
        <div className="flex items-center gap-2 mb-1.5">
          <Package className="h-4 w-4" />
          Department *
        </div>
      </Label>
      <div className="flex items-center gap-2 p-2 border border-input rounded-md bg-muted">
        <Badge variant="secondary">
          {currentUser.departmentName || currentUser.department}
        </Badge>
        <span className="text-sm text-muted-foreground">(Fixed)</span>
      </div>
    </div>
  );
}

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
          Return Date
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
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

interface CompanySectionProps {
  value: string;
  companies: Company[];
  loading: boolean;
  loaded: boolean;
  offlineMode: boolean;
  onLoadCompanies: () => void;
  onChange: (value: string) => void;
}

function CompanySection({
  value,
  companies,
  loading,
  loaded,
  offlineMode,
  onLoadCompanies,
  onChange,
}: CompanySectionProps) {
  return (
    <div>
      <Label htmlFor="company">
        <div className="flex items-center gap-2 mb-1.5">
          <Building className="h-4 w-4" />
          Company *
          {loading && (
            <span className="text-xs text-muted-foreground">(Loading...)</span>
          )}
        </div>
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={loading || offlineMode}
        onOpenChange={(open: boolean) => {
          if (open && !loaded && !offlineMode) {
            onLoadCompanies();
          }
        }}
      >
        <SelectTrigger id="company">
          <SelectValue
            placeholder={
              offlineMode
                ? 'Offline - Cannot load companies'
                : loading
                  ? 'Loading companies...'
                  : 'Select a company'
            }
          />
        </SelectTrigger>
        <SelectContent>
          {!loaded && !loading && (
            <SelectItem value="_loading" disabled>
              Click to load companies...
            </SelectItem>
          )}
          {companies.map((company) => (
            <SelectItem key={company.name} value={company.name}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface CustomerSectionProps {
  value: string;
  customers: Customer[];
  loading: boolean;
  hasCompany: boolean;
  offlineMode: boolean;
  onChange: (value: string) => void;
}

function CustomerSection({
  value,
  customers,
  loading,
  hasCompany,
  offlineMode,
  onChange,
}: CustomerSectionProps) {
  return (
    <div>
      <Label htmlFor="customer">
        <div className="flex items-center gap-2 mb-1.5">
          <UserIcon className="h-4 w-4" />
          Customer *
          {loading && (
            <span className="text-xs text-muted-foreground">(Loading...)</span>
          )}
        </div>
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={!hasCompany || loading || offlineMode}
      >
        <SelectTrigger id="customer">
          <SelectValue
            placeholder={
              offlineMode
                ? 'Offline'
                : hasCompany
                  ? 'Select a customer'
                  : 'Select company first'
            }
          />
        </SelectTrigger>
        <SelectContent>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.name}>
              {customer.name} {customer.code && `(${customer.code})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface ProjectSectionProps {
  value: string;
  projects: Project[];
  loading: boolean;
  hasCustomer: boolean;
  offlineMode: boolean;
  onChange: (value: string) => void;
}

function ProjectSection({
  value,
  projects,
  loading,
  hasCustomer,
  offlineMode,
  onChange,
}: ProjectSectionProps) {
  return (
    <div>
      <Label htmlFor="project">
        <div className="flex items-center gap-2 mb-1.5">
          <FolderOpen className="h-4 w-4" />
          Project *
          {loading && (
            <span className="text-xs text-muted-foreground">(Loading...)</span>
          )}
        </div>
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={!hasCustomer || loading || offlineMode}
      >
        <SelectTrigger id="project">
          <SelectValue
            placeholder={
              offlineMode
                ? 'Offline'
                : hasCustomer
                  ? 'Select a project'
                  : 'Select customer first'
            }
          />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.name}>
              {project.name} ({project.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface WorkOrderSectionProps {
  value: string;
  workOrders: WorkOrder[];
  loading: boolean;
  hasProject: boolean;
  offlineMode: boolean;
  onChange: (value: string, workOrder?: WorkOrder) => void;
}

function WorkOrderSection({
  value,
  workOrders,
  loading,
  hasProject,
  offlineMode,
  onChange,
}: WorkOrderSectionProps) {
  return (
    <div>
      <Label htmlFor="workOrder">
        <div className="flex items-center gap-2 mb-1.5">
          <Hash className="h-4 w-4" />
          Work Order # *
          {loading && (
            <span className="text-xs text-muted-foreground">(Loading...)</span>
          )}
        </div>
      </Label>
      <Select
        value={value}
        onValueChange={(woValue: string) => {
          const details = workOrders.find((wo) => wo.wo === woValue);
          onChange(woValue, details);
        }}
        disabled={!hasProject || loading || offlineMode}
      >
        <SelectTrigger id="workOrder">
          <SelectValue
            placeholder={
              offlineMode
                ? 'Offline'
                : hasProject
                  ? 'Select work order'
                  : 'Select project first'
            }
          />
        </SelectTrigger>
        <SelectContent>
          {workOrders.map((wo) => (
            <HoverCard key={wo.id ?? wo.wo} openDelay={150} closeDelay={100}>
              <HoverCardTrigger asChild>
                <SelectItem
                  value={wo.wo}
                  className="flex flex-col items-start gap-0.5"
                >
                  <span className="font-medium">{wo.wo}</span>
                  {wo.serviceDesc && (
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {wo.serviceDesc}
                    </span>
                  )}
                </SelectItem>
              </HoverCardTrigger>
              <HoverCardContent className="space-y-2 text-sm">
                <div>
                  <p className="font-semibold">{wo.wo}</p>
                  {wo.serviceDesc && (
                    <p className="text-xs text-muted-foreground">
                      {wo.serviceDesc}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Start</p>
                    <p>{formatWorkOrderDate(wo.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End</p>
                    <p>{formatWorkOrderDate(wo.endDate)}</p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface AddressFieldsProps {
  formData: LoanFormData;
  onFormDataChange: (field: keyof LoanFormData, value: string) => void;
}

function AddressFields({ formData, onFormDataChange }: AddressFieldsProps) {
  return (
    <>
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
    </>
  );
}

interface NotesSectionProps {
  value: string;
  onChange: (value: string) => void;
}

function NotesSection({ value, onChange }: NotesSectionProps) {
  return (
    <div>
      <Label htmlFor="notes">Additional Notes (optional)</Label>
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

interface WorkOrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder: WorkOrder | null;
}

export function WorkOrderDetailsModal({
  open,
  onOpenChange,
  workOrder,
}: WorkOrderDetailsModalProps) {
  return (
    <Dialog open={open && !!workOrder} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Work Order Details</DialogTitle>
          <DialogDescription>
            Review the information for the selected work order.
          </DialogDescription>
        </DialogHeader>
        {workOrder && (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Work Order</p>
              <p className="font-semibold">{workOrder.wo}</p>
            </div>
            {workOrder.serviceDesc && (
              <div>
                <p className="text-muted-foreground text-xs">Description</p>
                <p>{workOrder.serviceDesc}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-xs">Start Date</p>
                <p>{formatWorkOrderDate(workOrder.startDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">End Date</p>
                <p>{formatWorkOrderDate(workOrder.endDate)}</p>
              </div>
            </div>
            {workOrder.status && (
              <div>
                <p className="text-muted-foreground text-xs">Status</p>
                <p className="uppercase tracking-wide text-sm">
                  {workOrder.status}
                </p>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DetailsCardProps {
  formData: LoanFormData;
  currentUser: User;
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
 * Right panel card for borrow details
 */
export function DetailsCard({
  formData,
  currentUser,
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
        <CardTitle>Borrow Details</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto space-y-4">
        <DepartmentSection currentUser={currentUser} />

        <ReturnDateSection
          value={formData.returnDate}
          onChange={(value) => onFormDataChange('returnDate', value)}
        />

        <CompanySection
          value={formData.company}
          companies={companies}
          loading={loadingCompanies}
          loaded={companiesLoaded}
          offlineMode={offlineMode}
          onLoadCompanies={onLoadCompanies}
          onChange={(value) => onFormDataChange('company', value)}
        />

        <CustomerSection
          value={formData.customer}
          customers={customers}
          loading={loadingCustomers}
          hasCompany={!!formData.company}
          offlineMode={offlineMode}
          onChange={(value) => onFormDataChange('customer', value)}
        />

        <ProjectSection
          value={formData.project}
          projects={projects}
          loading={loadingProjects}
          hasCustomer={!!formData.customer}
          offlineMode={offlineMode}
          onChange={(value) => onFormDataChange('project', value)}
        />

        <WorkOrderSection
          value={formData.workOrder}
          workOrders={workOrders}
          loading={loadingWorkOrders}
          hasProject={!!formData.project}
          offlineMode={offlineMode}
          onChange={onWorkOrderSelect}
        />

        <AddressFields
          formData={formData}
          onFormDataChange={onFormDataChange}
        />

        <NotesSection
          value={formData.notes}
          onChange={(value) => onFormDataChange('notes', value)}
        />
      </CardContent>
    </Card>
  );
}
