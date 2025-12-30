import React from 'react';
import { Calendar as CalendarIcon, FileText, User, Building, AlertCircle } from 'lucide-react';
import {RequestFormData} from '../types/purchase'


interface RequestDetailsFormProps {
    formData: RequestFormData;
    setFormData: React.Dispatch<React.SetStateAction<RequestFormData>>;
}

export const RequestDetailsForm: React.FC<RequestDetailsFormProps> = ({
    formData,
    setFormData
}) => {

    // Reusable styles
    const inputClass = "flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:focus:ring-gray-300";
    const labelClass = "text-sm font-medium leading-none mb-1.5 block text-gray-900 dark:text-gray-100";
    const iconClass = "h-4 w-4 text-gray-400 mr-2";

    const handleChange = (field: keyof RequestFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-transparent dark:text-gray-50 p-6">

            <h3 className="font-semibold leading-none tracking-tight mb-6 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Request Information
            </h3>

            <div className="space-y-4">
                {/* Requested By */}
                <div>
                    <label htmlFor="requestedBy" className={labelClass}>Requested By <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <User className={`absolute left-2.5 top-2.5 ${iconClass}`} />
                        <input
                            id="requestedBy"
                            className={`${inputClass} pl-9 dark:bg-gray-950/30`}
                            value={formData.requestedBy}
                            onChange={(e) => handleChange('requestedBy', e.target.value)}
                            placeholder="Your name"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Department */}
                    <div>
                        <label htmlFor="department" className={labelClass}>Department <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Building className={`absolute left-2.5 top-2.5 ${iconClass}`} />
                            <input
                                id="department"
                                className={`${inputClass} pl-9 dark:bg-gray-950/30`}
                                value={formData.department}
                                onChange={(e) => handleChange('department', e.target.value)}
                                placeholder="e.g. IT"
                            />
                        </div>
                    </div>

                    {/* Priority (Native Select) */}
                    <div>
                        <label htmlFor="priority" className={labelClass}>Priority <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <AlertCircle className={`absolute left-2.5 top-2.5 ${iconClass}`} />
                            <select
                                id="priority"
                                className={`${inputClass} pl-9 appearance-none dark:bg-gray-950/30`}
                                value={formData.priority}
                                onChange={(e) => handleChange('priority', e.target.value)}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Project */}
                <div>
                    <label htmlFor="project" className={labelClass}>Project <span className="text-red-500">*</span></label>
                    <input
                        id="project"
                        className={`${inputClass} dark:bg-gray-950/30`}
                        value={formData.project}
                        onChange={(e) => handleChange('project', e.target.value)}
                        placeholder="Project Name"
                    />
                </div>

                {/* Date (Native Date Picker) */}
                <div>
                    <label htmlFor="date" className={labelClass}>Expected Delivery</label>
                    <div className="relative dark:text-white">
                        <CalendarIcon className={`absolute left-2.5 top-2.5 ${iconClass}`} />
                        <input
                            id="date"
                            type="date"
                            className={`${inputClass} pl-9 dark:bg-gray-950/30 `}
                            value={formData.expectedDate}
                            onChange={(e) => handleChange('expectedDate', e.target.value)}
                        />
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label htmlFor="notes" className={labelClass}>Notes</label>
                    <textarea
                        id="notes"
                        rows={3}
                        className={`${inputClass} h-auto py-2 max-h-[200px] dark:bg-gray-950/30`}
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Additional context..."
                    />
                </div>
            </div>
        </div>
    );
};