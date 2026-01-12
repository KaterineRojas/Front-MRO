import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getWarehouses,
  getCatalogItemsByWarehouse,
  getCompanies,
  getCustomersByCompany,
  getProjectsByCustomer,
  getWorkOrdersByProject,
  type Warehouse,
  type CatalogItem,
  type Company,
  type Customer,
  type Project,
  type WorkOrder
} from '../../../services/sharedServices';

interface UseWarehouseDataReturn {
  warehouses: Warehouse[];
  catalogItems: CatalogItem[];
  loadingCatalog: boolean;
}

export function useWarehouseData(warehouseId: string): UseWarehouseDataReturn {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  // Load warehouses on mount
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const whData = await getWarehouses();
        setWarehouses(whData);
      } catch (error) {
        toast.error('Failed to load warehouses');
      }
    };

    void loadWarehouses();
  }, []);

  // Load catalog items when warehouse changes
  useEffect(() => {
    if (!warehouseId) {
      setCatalogItems([]);
      return;
    }

    const loadCatalogItems = async () => {
      setLoadingCatalog(true);
      try {
        const items = await getCatalogItemsByWarehouse(warehouseId, true);
        setCatalogItems(items);
      } catch (error) {
        toast.error('Failed to load items for the selected warehouse');
      } finally {
        setLoadingCatalog(false);
      }
    };

    void loadCatalogItems();
  }, [warehouseId]);

  return { warehouses, catalogItems, loadingCatalog };
}

interface UseCompanyDataReturn {
  companies: Company[];
  customers: Customer[];
  projects: Project[];
  workOrders: WorkOrder[];
  loadingCompanies: boolean;
  loadingCustomers: boolean;
  loadingProjects: boolean;
  loadingWorkOrders: boolean;
  companiesLoaded: boolean;
  loadCompanies: () => Promise<void>;
}

interface CompanyDataParams {
  company: string;
  customer: string;
  project: string;
}

export function useCompanyData(params: CompanyDataParams): UseCompanyDataReturn {
  const { company, customer, project } = params;

  const [companies, setCompanies] = useState<Company[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingWorkOrders, setLoadingWorkOrders] = useState(false);
  const [companiesLoaded, setCompaniesLoaded] = useState(false);

  const loadCompanies = useCallback(async () => {
    if (companiesLoaded || loadingCompanies) return;
    setLoadingCompanies(true);
    try {
      const companyData = await getCompanies();
      setCompanies(companyData);
      setCompaniesLoaded(true);
    } catch (error) {
      toast.error('Failed to load companies');
    } finally {
      setLoadingCompanies(false);
    }
  }, [companiesLoaded, loadingCompanies]);

  // Load customers when company changes
  useEffect(() => {
    setCustomers([]);
    setProjects([]);
    setWorkOrders([]);

    if (!company) {
      setLoadingCustomers(false);
      return;
    }

    let isActive = true;
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const customerData = await getCustomersByCompany(company);
        if (isActive) {
          setCustomers(customerData);
        }
      } catch (error) {
        if (isActive) {
          toast.error('Failed to load customers');
        }
      } finally {
        if (isActive) {
          setLoadingCustomers(false);
        }
      }
    };

    void fetchCustomers();

    return () => {
      isActive = false;
    };
  }, [company]);

  // Load projects when customer changes
  useEffect(() => {
    setProjects([]);
    setWorkOrders([]);

    if (!customer || !company) {
      setLoadingProjects(false);
      return;
    }

    let isActive = true;
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const projectData = await getProjectsByCustomer(company, customer);
        if (isActive) {
          setProjects(projectData);
        }
      } catch (error) {
        if (isActive) {
          toast.error('Failed to load projects');
        }
      } finally {
        if (isActive) {
          setLoadingProjects(false);
        }
      }
    };

    void fetchProjects();

    return () => {
      isActive = false;
    };
  }, [company, customer]);

  // Load work orders when project changes
  useEffect(() => {
    setWorkOrders([]);

    if (!project || !company || !customer) {
      setLoadingWorkOrders(false);
      return;
    }

    let isActive = true;
    const fetchWorkOrders = async () => {
      setLoadingWorkOrders(true);
      try {
        const workOrderData = await getWorkOrdersByProject(company, customer, project);
        if (isActive) {
          setWorkOrders(workOrderData);
        }
      } catch (error) {
        if (isActive) {
          toast.error('Failed to load work orders');
        }
      } finally {
        if (isActive) {
          setLoadingWorkOrders(false);
        }
      }
    };

    void fetchWorkOrders();

    return () => {
      isActive = false;
    };
  }, [company, customer, project]);

  return {
    companies,
    customers,
    projects,
    workOrders,
    loadingCompanies,
    loadingCustomers,
    loadingProjects,
    loadingWorkOrders,
    companiesLoaded,
    loadCompanies
  };
}
