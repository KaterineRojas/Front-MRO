import { useState, useMemo } from 'react';
import { Label } from '../../../ui/label';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../ui/hover-card';
import { ScrollArea } from '../../../ui/scroll-area';
import {
  Building,
  User as UserIcon,
  FolderOpen,
  Hash,
  Search,
  ExternalLink,
} from 'lucide-react';
import type {
  Company,
  Customer,
  Project,
  WorkOrder,
} from '../services/sharedServices';
import { WorkOrderDetailsModal } from './WorkOrderDetailsModal';

function formatWorkOrderDate(date: string | undefined): string {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return date;
  }
}

interface ProjectDetailsSectionProps {
  company: string;
  customer: string;
  project: string;
  workOrder: string;
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
  onCompanyChange: (value: string) => void;
  onCustomerChange: (value: string) => void;
  onProjectChange: (value: string) => void;
  onWorkOrderSelect: (value: string, workOrder?: WorkOrder) => void;
}

export function ProjectDetailsSection({
  company,
  customer,
  project,
  workOrder,
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
  onCompanyChange,
  onCustomerChange,
  onProjectChange,
  onWorkOrderSelect,
}: ProjectDetailsSectionProps) {
  const [companySearch, setCompanySearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [workOrderSearch, setWorkOrderSearch] = useState('');
  const [woModalOpen, setWoModalOpen] = useState(false);

  const selectedWorkOrder = useMemo(() => {
    return workOrders.find((wo) => wo.wo === workOrder);
  }, [workOrders, workOrder]);

  const filteredCompanies = useMemo(() => {
    if (!companySearch) return companies;
    const searchLower = companySearch.toLowerCase();
    return companies.filter((c) =>
      c.name.toLowerCase().includes(searchLower)
    );
  }, [companies, companySearch]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    const searchLower = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        (c.code && c.code.toLowerCase().includes(searchLower))
    );
  }, [customers, customerSearch]);

  const filteredProjects = useMemo(() => {
    if (!projectSearch) return projects;
    const searchLower = projectSearch.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.code.toLowerCase().includes(searchLower)
    );
  }, [projects, projectSearch]);

  const filteredWorkOrders = useMemo(() => {
    if (!workOrderSearch) return workOrders;
    const searchLower = workOrderSearch.toLowerCase();
    return workOrders.filter(
      (wo) =>
        wo.wo.toLowerCase().includes(searchLower) ||
        (wo.serviceDesc && wo.serviceDesc.toLowerCase().includes(searchLower))
    );
  }, [workOrders, workOrderSearch]);

  return (
    <>
      <div className="space-y-4">
        {/* Company */}
        <div>
          <Label htmlFor="company">
            <div className="flex items-center gap-2 mb-1.5">
              <Building className="h-4 w-4" />
              Company *
              {loadingCompanies && (
                <span className="text-xs text-muted-foreground">(Loading...)</span>
              )}
            </div>
          </Label>
          <Select
            value={company}
            onValueChange={onCompanyChange}
            disabled={loadingCompanies || offlineMode}
            onOpenChange={(open: boolean) => {
              if (open && !companiesLoaded && !offlineMode) {
                onLoadCompanies();
              }
              if (!open) setCompanySearch('');
            }}
          >
            <SelectTrigger id="company">
              <SelectValue
                placeholder={
                  offlineMode
                    ? 'Offline - Cannot load companies'
                    : loadingCompanies
                      ? 'Loading companies...'
                      : 'Select a company'
                }
              />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 border-b sticky top-0 bg-background z-10">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search companies..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="pl-8 h-8"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <ScrollArea className="h-[200px]">
                {!companiesLoaded && !loadingCompanies && (
                  <SelectItem value="_loading" disabled>
                    Click to load companies...
                  </SelectItem>
                )}
                {filteredCompanies.length === 0 && companiesLoaded && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No companies found
                  </div>
                )}
                {filteredCompanies.map((comp) => (
                  <SelectItem key={comp.name} value={comp.name}>
                    {comp.name}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        {/* Customer */}
        <div>
          <Label htmlFor="customer">
            <div className="flex items-center gap-2 mb-1.5">
              <UserIcon className="h-4 w-4" />
              Customer *
              {loadingCustomers && (
                <span className="text-xs text-muted-foreground">(Loading...)</span>
              )}
            </div>
          </Label>
          <Select
            value={customer}
            onValueChange={onCustomerChange}
            disabled={!company || loadingCustomers || offlineMode}
            onOpenChange={(open: boolean) => {
              if (!open) setCustomerSearch('');
            }}
          >
            <SelectTrigger id="customer">
              <SelectValue
                placeholder={
                  offlineMode
                    ? 'Offline'
                    : company
                      ? 'Select a customer'
                      : 'Select company first'
                }
              />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 border-b sticky top-0 bg-background z-10">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-8 h-8"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <ScrollArea className="h-[200px]">
                {filteredCustomers.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No customers found
                  </div>
                )}
                {filteredCustomers.map((cust) => (
                  <SelectItem key={cust.id} value={cust.name}>
                    {cust.name} {cust.code && `(${cust.code})`}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        {/* Project */}
        <div>
          <Label htmlFor="project">
            <div className="flex items-center gap-2 mb-1.5">
              <FolderOpen className="h-4 w-4" />
              Project *
              {loadingProjects && (
                <span className="text-xs text-muted-foreground">(Loading...)</span>
              )}
            </div>
          </Label>
          <Select
            value={project}
            onValueChange={onProjectChange}
            disabled={!customer || loadingProjects || offlineMode}
            onOpenChange={(open: boolean) => {
              if (!open) setProjectSearch('');
            }}
          >
            <SelectTrigger id="project">
              <SelectValue
                placeholder={
                  offlineMode
                    ? 'Offline'
                    : customer
                      ? 'Select a project'
                      : 'Select customer first'
                }
              />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 border-b sticky top-0 bg-background z-10">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="pl-8 h-8"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <ScrollArea className="h-[200px]">
                {filteredProjects.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No projects found
                  </div>
                )}
                {filteredProjects.map((proj) => (
                  <SelectItem key={proj.id} value={proj.name}>
                    {proj.name} ({proj.code})
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        {/* Work Order */}
        <div>
          <Label htmlFor="workOrder">
            <div className="flex items-center gap-2 mb-1.5">
              <Hash className="h-4 w-4" />
              Work Order # *
              {loadingWorkOrders && (
                <span className="text-xs text-muted-foreground">(Loading...)</span>
              )}
            </div>
          </Label>
          <div className="flex gap-2">
            <Select
              value={workOrder}
              onValueChange={(woValue: string) => {
                const details = workOrders.find((wo) => wo.wo === woValue);
                onWorkOrderSelect(woValue, details);
                if (details) {
                  setWoModalOpen(true);
                }
              }}
              disabled={!project || loadingWorkOrders || offlineMode}
              onOpenChange={(open: boolean) => {
                if (!open) setWorkOrderSearch('');
              }}
            >
              <SelectTrigger id="workOrder" className="flex-1">
                <SelectValue
                  placeholder={
                    offlineMode
                      ? 'Offline'
                      : project
                        ? 'Select work order'
                        : 'Select project first'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 border-b sticky top-0 bg-background z-10">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search work orders..."
                      value={workOrderSearch}
                      onChange={(e) => setWorkOrderSearch(e.target.value)}
                      className="pl-8 h-8"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <ScrollArea className="h-[200px]">
                  {filteredWorkOrders.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No work orders found
                    </div>
                  )}
                  {filteredWorkOrders.map((wo) => (
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
                </ScrollArea>
              </SelectContent>
            </Select>
            {workOrder && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setWoModalOpen(true)}
                disabled={!selectedWorkOrder}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Work Order Modal */}
      <WorkOrderDetailsModal
        open={woModalOpen}
        onOpenChange={setWoModalOpen}
        workOrder={selectedWorkOrder}
      />
    </>
  );
}
