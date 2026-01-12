interface ProjectDetailsProps {
  companyLabel?: string | null;
  customerLabel?: string | null;
  projectLabel?: string | null;
  workOrderLabel?: string | null;
  className?: string;
}

/**
 * Componente reutilizable para mostrar la cadena de detalles del proyecto:
 * Company → Customer → Project → Work Order
 * 
 * Soporta light mode y dark mode.
 */
export function ProjectDetails({
  companyLabel,
  customerLabel,
  projectLabel,
  workOrderLabel,
  className = '',
}: ProjectDetailsProps) {
  return (
    <div className={`bg-sky-50 dark:bg-sky-950/40 rounded-lg p-3 border border-sky-200 dark:border-sky-800 ${className}`}>
      <div className="flex items-center gap-3 flex-wrap">
        <h4 className="text-[10px] sm:text-xs font-semibold text-sky-700 dark:text-sky-300">Project Details</h4>
        
        {/* Company */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] sm:text-[10px] text-muted-foreground">Company</span>
          <span className="text-[9px] sm:text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded">
            {companyLabel || '—'}
          </span>
        </div>
        
        <span className="text-muted-foreground text-[8px] sm:text-xs">→</span>
        
        {/* Customer */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] sm:text-[10px] text-muted-foreground">Customer</span>
          <span className="text-[9px] sm:text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 px-1.5 py-0.5 rounded">
            {customerLabel || '—'}
          </span>
        </div>
        
        <span className="text-muted-foreground text-[8px] sm:text-xs">→</span>
        
        {/* Project */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] sm:text-[10px] text-muted-foreground">Project</span>
          <span className="text-[9px] sm:text-xs font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 px-1.5 py-0.5 rounded">
            {projectLabel || '—'}
          </span>
        </div>
        
        <span className="text-muted-foreground text-[8px] sm:text-xs">→</span>
        
        {/* Work Order */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] sm:text-[10px] text-muted-foreground">Work Order</span>
          <span className="text-[9px] sm:text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-1.5 py-0.5 rounded">
            {workOrderLabel || '—'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;
