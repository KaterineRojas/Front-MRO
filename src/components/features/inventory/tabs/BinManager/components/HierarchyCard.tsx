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
    card: 'bg-blue-200 dark:bg-blue-900 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-100 hover:bg-blue-300 dark:hover:bg-blue-800 hover:border-blue-500 dark:hover:border-blue-500',
    icon: 'text-blue-700 dark:text-blue-200',
    text: 'text-blue-900 dark:text-blue-100',
    textLight: 'text-blue-800 dark:text-blue-200',
    editBtn: 'bg-blue-300 dark:bg-blue-800 hover:bg-blue-400 dark:hover:bg-blue-700',
    editIcon: 'text-blue-900 dark:text-blue-100',
  },
  pink: {
    card: 'bg-pink-200 dark:bg-pink-900 border-pink-400 dark:border-pink-600 text-pink-900 dark:text-pink-100 hover:bg-pink-300 dark:hover:bg-pink-800 hover:border-pink-500 dark:hover:border-pink-500',
    icon: 'text-pink-700 dark:text-pink-200',
    text: 'text-pink-900 dark:text-pink-100',
    textLight: 'text-pink-800 dark:text-pink-200',
    editBtn: 'bg-pink-300 dark:bg-pink-800 hover:bg-pink-400 dark:hover:bg-pink-700',
    editIcon: 'text-pink-900 dark:text-pink-100',
  },
  yellow: {
    card: 'bg-yellow-200 dark:bg-yellow-900 border-yellow-400 dark:border-yellow-600 text-yellow-900 dark:text-yellow-100 hover:bg-yellow-300 dark:hover:bg-yellow-800 hover:border-yellow-500 dark:hover:border-yellow-500',
    icon: 'text-yellow-700 dark:text-yellow-200',
    text: 'text-yellow-900 dark:text-yellow-100',
    textLight: 'text-yellow-800 dark:text-yellow-200',
    editBtn: 'bg-yellow-300 dark:bg-yellow-800 hover:bg-yellow-400 dark:hover:bg-yellow-700',
    editIcon: 'text-yellow-900 dark:text-yellow-100',
  },
  green: {
    card: 'bg-green-200 dark:bg-green-900 border-green-400 dark:border-green-600 text-green-900 dark:text-green-100 hover:bg-green-300 dark:hover:bg-green-800 hover:border-green-500 dark:hover:border-green-500',
    icon: 'text-green-700 dark:text-green-200',
    text: 'text-green-900 dark:text-green-100',
    textLight: 'text-green-800 dark:text-green-200',
    editBtn: 'bg-green-300 dark:bg-green-800 hover:bg-green-400 dark:hover:bg-green-700',
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
