import React from 'react';
import { ChevronRight, Package, ChevronLeft } from 'lucide-react';
import { useSelector } from 'react-redux';
import { getStatusBadge, getTypeBadge } from '../../inventory/components/RequestBadges.tsx';
import { LoanRequest } from '../types/loanTypes.ts';

export interface PaginationMetadata {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface RequestsTableProps {
  requests: LoanRequest[];
  // pagination: PaginationMetadata;
  expandedRequests: Set<string>;
  handleToggleExpand: (requestNumber: string) => void;
  setSelectedRequest: (request: LoanRequest) => void;
  setShowModal: (open: boolean) => void;
  setModalType: (value: string) => void;
  loading: boolean;
  // onPageChange: (newPage: number) => void;
}

export default function RequestsTable({
  requests,
  // pagination,
  expandedRequests,
  handleToggleExpand,
  setSelectedRequest,
  setShowModal,
  setModalType,
  loading,
  // onPageChange
}: RequestsTableProps) {

  const darkMode = useSelector((state: any) => state.ui.darkMode);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // const getTimelineColor = (startDate: string, endDate: string) => {
  //   if (!startDate || !endDate) return "text-gray-500";

  //   const start = new Date(startDate);
  //   const end = new Date(endDate);
  //   const diffTime = Math.abs(end.getTime() - start.getTime());
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  //   if (diffDays <= 2) {
  //     return "text-green-600 dark:text-green-400 font-medium";
  //   } else if (diffDays <= 7) {
  //     return "text-yellow-600 dark:text-yellow-400 font-medium";
  //   } else {
  //     return "text-red-600 dark:text-red-400 font-bold";
  //   }
  // };

  return (
    <div className="w-full max-w-full min-w-0 max-h-[630px] flex flex-col rounded-xl border dark:border-gray-700 overflow-hidden">

      <div className="flex-1 overflow-auto relative w-full rounded-xl min-w-0">
        <table className="w-full min-w-[1000px] caption-bottom text-sm ">

          
          <thead className="[&_tr]:border-b sticky top-0 ">
            <tr className="border-b dark:border-b-gray-500/50 transition-colors bg-white dark:bg-[#0A0A0A] whitespace-nowrap">
              <th className="h-12 w-12 px-4 text-left align-middle font-medium"></th>
              <th className="h-12 px-8 align-middle font-medium">Request #</th>
              <th className="h-12 px-8 align-middle font-medium">Status</th>
              <th className="h-12 px-8 align-middle font-medium">Type</th>
              <th className="h-12 px-8 align-middle font-medium">Requested By</th>
              <th className="h-12 px-8 align-middle font-medium">Department</th>
              <th className="h-12 px-8 align-middle font-medium">Project</th>
              <th className="h-12 px-8 align-middle font-medium">Timeline</th>
              <th className="h-12 px-8 align-middle font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="[&_tr:last-child]:border-0 bg-white dark:bg-[#0A0A0A]">
            {loading ? (
              <tr>
                <td colSpan={10} className="h-64 text-center align-middle">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-500 mb-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm text-gray-500 font-medium">Loading requests...</p>
                  </div>
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={10} className="align-middle dark:border-gray-800">
                  <div className="p-12 text-center">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No requests found</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((request) => {
                return (
                  <React.Fragment key={request.requestNumber}>
                    <tr className={`border-b dark:border-gray-500/50 transition-colors hover:bg-[#F5F5F7] dark:hover:bg-gray-400/10 whitespace-nowrap
                      ${expandedRequests.has(request.requestNumber) ? 'dark:!bg-gray-800' : ''}
                      `}>

                      {/* TOGGLE BUTTON */}
                      <td className="p-3 align-middle text-center">
                        <button
                          onClick={() => handleToggleExpand(request.requestNumber)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10
                        hover:bg-gray-200 dark:text-white dark:bg-[#1f1f1f] dark:hover:bg-white dark:hover:text-black"
                        >
                          <ChevronRight className={`h-4 w-4 transition duration-200
                              ${expandedRequests.has(request.requestNumber) ? 'rotate-90' : 'rotate-0'}
                            `}
                          />
                        </button>
                      </td>

                      {/* REQUEST NUMBER */}
                      <td className="px-2 align-middle font-mono ">
                        <div>
                          <p>{request.requestNumber}</p>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-4 align-middle">
                        <div className="flex items-center space-x-2 ">
                          {getStatusBadge(request.status, darkMode ? 'outline' : 'soft')}
                        </div>
                      </td>

                      {/* TYPE */}
                      <td className="px-4 align-middle">
                        {getTypeBadge(request.typeRequest, darkMode ? 'outline' : 'soft')}
                      </td>

                      {/* REQUESTED BY */}
                      <td className="px-4 align-middle">
                        <div>
                          <p>{request.requesterName}</p>
                          <p className="text-xs text-gray-500">{request.requesterId}</p>
                        </div>
                      </td>

                      {/* DEPARTMENT */}
                      <td className="px-4 align-middle">{request.departmentId}</td>

                      {/* PROJECT */}
                      <td className="px-4 align-middle">
                        {request.projectId ? (
                          <p className="text-sm">{request.projectId}</p>
                        ) : (
                          <p className="text-xs text-gray-500">-</p>
                        )}
                      </td>

                      {/* TIMELINE */}
                      <td className="px-0 align-middle">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <span className="w-6"> In:</span>
                            <span>{formatDate(request.createdAt)}</span>
                          </div>

                          {request.expectedReturnDate && (
                            <div className={`flex items-center gap-1.5 text-xs `}>
                              <span className="w-6">Due:</span>
                              <span>{formatDate(request.expectedReturnDate)}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 align-middle">
                        {request.status.toLowerCase() === 'pending' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setModalType('approve')
                                setSelectedRequest(request);
                                setShowModal(true);
                              }}
                              className={`inline-flex items-center justify-center rounded-md text-sm 
                              font-medium h-10 px-4 py-2 border border-gray-300 
                              hover:bg-[#04A63E] hover:text-white transition duration-100
                              ${darkMode ? 'bg-[#1F1F1F]' : 'bg-white'}
                              ${darkMode ? 'text-white' : 'text-black'}
                            `}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setModalType('reject')
                                setSelectedRequest(request);
                                setShowModal(true)
                              }}
                              className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 
                              py-2 border border-gray-300
                              hover:bg-[#FB2C36] hover:text-white transition duration-100
                              ${darkMode ? 'bg-[#1F1F1F]' : 'bg-white'}
                              ${darkMode ? 'text-white' : 'text-black'}
                            `}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 italic">
                            No actions available
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* EXPANDED DETAILS */}
                    {expandedRequests.has(request.requestNumber) && (
                      <tr className="border-b transition-colors" data-state="open">
                        <td colSpan={10} className="p-0 bg-[#F2F2F4] dark:bg-gray-900/50 transition duration-300">
                          <div className="p-6">
                            <h4 className="flex items-center mb-4 text-lg font-semibold">
                              <Package className="h-5 w-5 mr-2 text-gray-700" />
                              Request Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                              {request.workOrderId && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Work Order
                                  </label>
                                  <p className="text-lg text-gray-900 dark:text-gray-100">
                                    {request.workOrderId}
                                  </p>
                                </div>
                              )}

                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                  Notes / Reason
                                </label>
                                <p className="text-lg text-gray-900 dark:text-gray-100">
                                  {request.notes || 'No notes provided'}
                                </p>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-md font-semibold mb-3">
                                Items ({request.items.length})
                              </h5>

                              <div className="grid grid-cols-3 gap-3">
                                {request.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center p-3 bg-white dark:bg-gray-800/30 border dark:border-gray-700 rounded-lg shadow-sm
                                    justify-self-center md:justify-self-stretch"
                                  >
                                    <img
                                      src={item.imageUrl || 'https://via.placeholder.com/150'}
                                      alt={item.name}
                                      className="h-20 w-20 object-cover rounded-md mr-4"
                                    />

                                    <div className="flex-grow">
                                      <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {item.sku}
                                      </span>
                                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {item.name}
                                      </p>
                                      <p className="text-xs text-gray-500">{item.description}</p>

                                      <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className="text-xs font-medium text-blue-700 bg-blue-100 dark:text-blue-200 dark:bg-blue-800/50 px-2 py-0.5 rounded-full">
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
                );
              })
            )}
          </tbody>
        </table>
      </div>


      {/* PAGINATION FOOTER */}
      {/* {!loading && requests.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-[#0A0A0A] border-t dark:border-gray-700">
          <div className="hidden sm:flex flex-1 items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Page <span className="font-medium">{pagination.pageNumber}</span> of{' '}
                <span className="font-medium">{pagination.totalPages}</span> ({pagination.totalCount} results)
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(pagination.pageNumber - 1)}
                disabled={!pagination.hasPreviousPage}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 border border-gray-300 
                   ${!pagination.hasPreviousPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                   ${darkMode ? 'bg-[#1F1F1F] text-white' : 'bg-white text-black'}`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              <button
                onClick={() => onPageChange(pagination.pageNumber + 1)}
                disabled={!pagination.hasNextPage}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 border border-gray-300 
                   ${!pagination.hasNextPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                   ${darkMode ? 'bg-[#1F1F1F] text-white' : 'bg-white text-black'}`}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}