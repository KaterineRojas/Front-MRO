import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getCompanies,
  getCustomersByCompany,
  getProjectsByCustomer,
  getWorkOrdersByProject,
  type Company,
  type Customer,
  type Project,
  type WorkOrder,
} from '../../../services/sharedServices';
import type { AppError } from '../../../../enginner/services/errorHandler';

interface CompanyDataSelections {
  company: string;
  customer: string;
  project: string;
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

/**
 * Hook for managing cascading company hierarchy data
 * Implements lazy loading and cascade loading patterns
 */
export function useCompanyData(
  selections: CompanyDataSelections,
  onError?: (error: AppError, entityName: string, retry?: () => void) => void
): UseCompanyDataReturn {
  // Use ref to avoid dependency issues with onError callback
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Refs to track previous values and prevent duplicate calls
  const prevCompanyRef = useRef<string>('');
  const prevCustomerRef = useRef<string>('');
  const prevProjectRef = useRef<string>('');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingWorkOrders, setLoadingWorkOrders] = useState(false);

  const [companiesLoaded, setCompaniesLoaded] = useState(false);

  // Lazy load companies
  const loadCompanies = useCallback(async () => {
    if (companiesLoaded || loadingCompanies) return;

    setLoadingCompanies(true);
    try {
      const data = await getCompanies();
      setCompanies(data);
      setCompaniesLoaded(true);
    } catch (error) {
      if (onErrorRef.current) {
        onErrorRef.current(error as AppError, 'companies', loadCompanies);
      }
    } finally {
      setLoadingCompanies(false);
    }
  }, [companiesLoaded, loadingCompanies]);

  // Load customers when company changes
  useEffect(() => {
    // Skip if company hasn't actually changed
    if (prevCompanyRef.current === selections.company) {
      return;
    }
    prevCompanyRef.current = selections.company;

    if (!selections.company) {
      setCustomers([]);
      setProjects([]);
      setWorkOrders([]);
      return;
    }

    let isCancelled = false;

    const loadCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const data = await getCustomersByCompany(selections.company);
        if (!isCancelled) {
          setCustomers(data);
          setProjects([]);
          setWorkOrders([]);
        }
      } catch (error) {
        if (!isCancelled && onErrorRef.current) {
          onErrorRef.current(error as AppError, 'customers', loadCustomers);
        }
      } finally {
        if (!isCancelled) {
          setLoadingCustomers(false);
        }
      }
    };

    loadCustomers();

    return () => {
      isCancelled = true;
    };
  }, [selections.company]);

  // Load projects when customer changes
  useEffect(() => {
    // Skip if customer hasn't actually changed
    if (prevCustomerRef.current === selections.customer) {
      return;
    }
    prevCustomerRef.current = selections.customer;

    if (!selections.customer) {
      setProjects([]);
      setWorkOrders([]);
      return;
    }

    let isCancelled = false;

    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const data = await getProjectsByCustomer(selections.company, selections.customer);
        if (!isCancelled) {
          setProjects(data);
          setWorkOrders([]);
        }
      } catch (error) {
        if (!isCancelled && onErrorRef.current) {
          onErrorRef.current(error as AppError, 'projects', loadProjects);
        }
      } finally {
        if (!isCancelled) {
          setLoadingProjects(false);
        }
      }
    };

    loadProjects();

    return () => {
      isCancelled = true;
    };
  }, [selections.company, selections.customer]);

  // Load work orders when project changes
  useEffect(() => {
    // Skip if project hasn't actually changed
    if (prevProjectRef.current === selections.project) {
      return;
    }
    prevProjectRef.current = selections.project;

    if (!selections.project) {
      setWorkOrders([]);
      return;
    }

    let isCancelled = false;

    const loadWorkOrders = async () => {
      setLoadingWorkOrders(true);
      try {
        const data = await getWorkOrdersByProject(
          selections.company,
          selections.customer,
          selections.project
        );
        if (!isCancelled) {
          setWorkOrders(data);
        }
      } catch (error) {
        if (!isCancelled && onErrorRef.current) {
          onErrorRef.current(error as AppError, 'work orders', loadWorkOrders);
        }
      } finally {
        if (!isCancelled) {
          setLoadingWorkOrders(false);
        }
      }
    };

    loadWorkOrders();

    return () => {
      isCancelled = true;
    };
  }, [selections.company, selections.customer, selections.project]);

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
    loadCompanies,
  };
}
