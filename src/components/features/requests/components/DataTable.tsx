import React from 'react';
import { ChevronRight, Package, Calendar, User, Building, FileText } from 'lucide-react';
import { useSelector } from 'react-redux';
import { getStatusBadge } from '../../inventory/components/RequestBadges.tsx';
import { LoanRequest } from '../types/loanTypes.ts';

interface RequestsTableProps {
  requests: LoanRequest[];
  expandedRequests: Set<string>; 
  handleToggleExpand: (requestNumber: string) => void; 
  setSelectedRequest: (request: LoanRequest) => void; 
  setShowModal: (open: boolean) => void;
  setModalType: (value: string) => void;
  loading: boolean;
  
  // calculateTotalCost: (request: LoanRequest) => number;
}

export default function RequestsTable({
  requests,
  expandedRequests,
  handleToggleExpand,
  setSelectedRequest,
  setShowModal,
  setModalType,
  loading,
}: RequestsTableProps) {

  const darkMode = useSelector((state: any) => state.ui.darkMode);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full overflow-auto rounded-md border border-gray-200 dark:border-gray-800">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors bg-white dark:bg-[#0A0A0A] text-gray-500 dark:text-gray-400">
            <th className="h-12 w-12 px-4 text-left align-middle font-medium"></th>
            <th className="h-12 px-6 align-middle font-medium text-left">Request #</th>
            <th className="h-12 px-6 align-middle font-medium text-left">Status</th>
            {/* Type y Urgency eliminados porque no vienen en la API nueva */}
            <th className="h-12 px-6 align-middle font-medium text-left">Requested By</th>
            <th className="h-12 px-6 align-middle font-medium text-left">Department</th>
            <th className="h-12 px-6 align-middle font-medium text-left">Project</th>
            <th className="h-12 px-6 align-middle font-medium text-left">Date</th>
            <th className="h-12 px-6 align-middle font-medium text-center">Actions</th>
          </tr>
        </thead>

        <tbody className="[&_tr:last-child]:border-0 bg-white dark:bg-[#0A0A0A]">
          {requests.map((request) => (
            <React.Fragment key={request.requestNumber}> 

              <tr
                className={`border-b transition-colors hover:bg-[#F5F5F7] dark:hover:bg-gray-800/50 
                  ${expandedRequests.has(request.requestNumber) ? 'bg-gray-50 dark:!bg-gray-900' : ''} 
                `}
              >
                {/* 1. Toggle Button */}
                <td className="p-3 align-middle text-center">
                  <button
                    onClick={() => handleToggleExpand(request.requestNumber)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 w-8
                      hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                  >
                    <ChevronRight
                      className={`h-4 w-4 transition-transform duration-200 
                        ${expandedRequests.has(request.requestNumber) ? 'rotate-90' : 'rotate-0'}`}
                    />
                  </button>
                </td>

                {/* 2. Request # */}
                <td className="px-6 align-middle font-mono font-medium text-gray-900 dark:text-white">
                  {request.requestNumber}
                </td>

                {/* 3. Status */}
                <td className="px-6 align-middle">
                  {getStatusBadge(request.status, darkMode ? 'outline' : 'soft')}
                </td>

                {/* 4. Requested By */}
                <td className="px-6 align-middle">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {request.requesterName}
                    </span>
                    <span className="text-xs text-gray-500">ID: {request.requesterId}</span>
                  </div>
                </td>

                {/* 5. Department */}
                <td className="px-6 align-middle text-gray-600 dark:text-gray-400">
                  {request.departmentId}
                </td>

                {/* 6. Project */}
                <td className="px-6 align-middle text-gray-600 dark:text-gray-400">
                  {request.projectId || '-'}
                </td>

                {/* 7. Date */}
                <td className="px-6 align-middle text-gray-600 dark:text-gray-400">
                  {formatDate(request.createdAt)}
                </td>

                {/* 8. Actions */}
                <td className="px-6 align-middle text-center">
                  {request.status === 'Sent' ? (
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => {
                          setModalType('approve');
                          setSelectedRequest(request);
                          setShowModal(true);
                        }}
                        className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1.5 rounded-md hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setModalType('reject');
                          setSelectedRequest(request);
                          setShowModal(true);
                        }}
                        className="text-xs font-medium bg-red-100 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No actions</span>
                  )}
                </td>
              </tr>

              {/* === EXPANDED DETAILS === */}
              {expandedRequests.has(request.requestNumber) && (
                <tr className="border-b transition-colors bg-gray-50/50 dark:bg-[#0f0f0f]">
                  <td colSpan={8} className="p-0">
                    <div className="p-6 border-l-4 border-indigo-500 ml-1">

                      <div className="flex items-center gap-2 mb-6 text-indigo-600 dark:text-indigo-400">
                        <Package className="h-5 w-5" />
                        <h4 className="font-bold text-sm uppercase tracking-wide">Request Details</h4>
                      </div>

                      {/* Header Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Notes / Reason */}
                        <div className="md:col-span-2 space-y-1">
                          <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                            <FileText className="w-3 h-3" /> Description / Notes
                          </label>
                          <p className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                            {request.notes || 'No specific notes provided.'}
                          </p>
                        </div>

                        {/* Dates Info */}
                        <div className="space-y-3">
                          <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                              <Calendar className="w-3 h-3" /> Expected Return
                            </label>
                            <p className="text-sm font-medium mt-1">
                              {formatDate(request.expectedReturnDate)}
                            </p>
                          </div>
                          <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                              <Building className="w-3 h-3" /> Work Order
                            </label>
                            <p className="text-sm font-medium mt-1">
                              {request.workOrderId || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Items List */}
                      <div>
                        <h5 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                          <Package className="w-3 h-3" /> Items List ({request.totalItems})
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {request.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex gap-4 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
                            >
                              {/* Imagen del Item */}
                              <div className="shrink-0">
                                <img
                                  src={item.imageUrl || 'https://via.placeholder.com/80'}
                                  alt={item.name}
                                  className="h-16 w-16 object-cover rounded-md bg-gray-100"
                                />
                              </div>

                              {/* Info del Item */}
                              <div className="flex flex-col justify-between w-full">
                                <div>
                                  <span className="text-xs font-mono text-gray-400 block mb-0.5">{item.sku}</span>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-0.5 rounded">
                                    Qty: {item.quantityRequested}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Empty State */}
      {requests.length === 0 && !loading && (
        <div className="p-12 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No requests found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20 bg-white dark:bg-[#0A0A0A]">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}