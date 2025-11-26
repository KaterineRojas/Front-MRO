import { Edit, Trash2, LucideIcon } from 'lucide-react';

interface HierarchyCardProps {
  id: string;
  code: string;
  name: string;
  icon: LucideIcon;
  color: 'blue' | 'pink' | 'yellow' | 'green';
  subtitle: string;
  onClick?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  extraContent?: React.ReactNode;
}

const colorClasses = {
  blue: {
    card: 'bg-blue-50 dark:bg-blue-950 border-blue-500 dark:border-blue-600 text-blue-900 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900 hover:border-blue-600 dark:hover:border-blue-500 shadow-md hover:shadow-xl',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-900 dark:text-blue-100',
    textLight: 'text-blue-700 dark:text-blue-300',
    editBtn: 'bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800',
    editIcon: 'text-blue-900 dark:text-blue-100',
  },
  pink: {
    card: '!bg-white dark:!bg-gray-900 border-fuchsia-500 dark:border-gray-700 text-fuchsia-900 dark:text-gray-100 hover:!bg-rose-50 dark:hover:!bg-gray-800 hover:!border-fuchsia-600 dark:hover:!border-gray-600 shadow-md hover:!shadow-xl',
    icon: 'text-purple-600 dark:text-purple-300',
    text: 'text-fuchsia-900 dark:text-gray-100',
    textLight: 'text-rose-700 dark:text-gray-300',
    editBtn: 'bg-fuchsia-200 dark:bg-gray-800 hover:bg-fuchsia-300 dark:hover:bg-gray-700',
    editIcon: 'text-fuchsia-900 dark:text-gray-100',
  },
  yellow: {
    card: 'bg-orange-50 dark:bg-orange-950 border-orange-500 dark:border-orange-600 text-orange-900 dark:text-orange-100 hover:bg-orange-100 dark:hover:bg-orange-900 hover:border-orange-600 dark:hover:border-orange-500 shadow-md hover:shadow-xl',
    icon: 'text-orange-600 dark:text-orange-400',
    text: 'text-orange-900 dark:text-orange-100',
    textLight: 'text-orange-700 dark:text-orange-300',
    editBtn: 'bg-orange-100 dark:bg-orange-900 hover:bg-orange-200 dark:hover:bg-orange-800',
    editIcon: 'text-orange-900 dark:text-orange-100',
  },
  green: {
    card: 'bg-green-50 dark:bg-green-950 border-green-500 dark:border-green-600 text-green-900 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-900 hover:border-green-600 dark:hover:border-green-500 shadow-md hover:shadow-xl',
    icon: 'text-green-600 dark:text-green-400',
    text: 'text-green-900 dark:text-green-100',
    textLight: 'text-green-700 dark:text-green-300',
    editBtn: 'bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800',
    editIcon: 'text-green-900 dark:text-green-100',
  },
};

export function HierarchyCard({
  id,
  code,
  name,
  icon: Icon,
  color,
  subtitle,
  onClick,
  onEdit,
  onDelete,
  extraContent,
}: HierarchyCardProps) {
  const classes = colorClasses[color];

  return (
    <div
      key={id}
      onClick={onClick}
      className={`border-2 rounded-lg p-6 transition-all duration-200 hover:shadow-xl hover:scale-105 relative group ${onClick ? 'cursor-pointer' : ''} ${classes.card}`}
    >
      {/* Action Buttons */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
        <button
          type="button"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit();
          }}
          className={`h-7 w-7 p-0 shadow-md rounded-md flex items-center justify-center transition-colors ${classes.editBtn}`}
        >
          <Edit className={`w-3.5 h-3.5 ${classes.editIcon}`} />
        </button>
        <button
          type="button"
          onMouseDown={(e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="h-7 w-7 p-0 bg-red-200 dark:bg-red-900 hover:bg-red-300 dark:hover:bg-red-800 shadow-md rounded-md flex items-center justify-center transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-700 dark:text-red-300" />
        </button>
      </div>

      {/* Content */}
      <div className="flex items-start gap-3 mb-3">
        <Icon className={`w-8 h-8 flex-shrink-0 ${classes.icon}`} />
        <div className="flex-1 min-w-0">
          <div className={`truncate font-semibold ${classes.text}`}>{code}</div>
          <div className={`text-sm truncate opacity-75 ${classes.textLight}`}>{name}</div>
        </div>
      </div>
      <div className={`text-xs opacity-60 ${classes.textLight}`}>{subtitle}</div>
      
      {/* Extra content (for bins) */}
      {extraContent && <div className="mt-2">{extraContent}</div>}
    </div>
  );
}
