import React from 'react';
import { ChevronRight, Package } from 'lucide-react';
import { useSelector } from 'react-redux';
import { getStatusBadge, getTypeBadge } from '../../inventory/components/RequestBadges.tsx';
import { LoanRequest } from '../types/loanTypes.ts';

interface RequestsTableProps {
  requests: LoanRequest[];
  expandedRequests: Set<string>; // ✅ AHORA ES STRING (requestNumber)
  // calculateTotalCost: (request: any) => number; -
  handleToggleExpand: (requestNumber: string) => void; // ✅ RECIBE STRING
  setSelectedRequest: (request: LoanRequest) => void;
  setShowModal: (open: boolean) => void;
  setModalType: (value: string) => void;
  loading: boolean;
}

export default function RequestsTable({
  requests,
  expandedRequests,
  // calculateTotalCost,
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
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getTimelineColor = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return "text-gray-500";

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate difference in days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 2) {
      // Critical (Urgent/Short term)
      return "text-green-600 dark:text-green-400 font-medium";
    } else if (diffDays <= 7) {
      // Warning (Medium term)
      return "text-yellow-600 dark:text-yellow-400 font-medium";
    } else {
      // Safe (Long term / Planned)
      return "text-red-600 dark:text-red-400 font-bold";
    }
  };

  return (
    <div className="w-full overflow-auto rounded-md border">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors bg-white dark:bg-[#0A0A0A]">
            <th className="h-12 w-12 px-4 text-left align-middle font-medium"></th>
            <th className="h-12 px-8 align-middle font-medium">Request #</th>
            <th className="h-12 px-8 align-middle font-medium">Status</th>
            <th className="h-12 px-8 align-middle font-medium">Type</th>
            <th className="h-12 px-8 align-middle font-medium">Requested By</th>
            <th className="h-12 px-8 align-middle font-medium">Department</th>
            <th className="h-12 px-8 align-middle font-medium">Project</th>
            <th className="h-12 px-8 align-middle font-medium">Request Date</th>
            <th className="h-12 px-8 align-middle font-medium">Timeline</th>
            <th className="h-12 px-8 align-middle font-medium">Actions</th>
          </tr>
        </thead>

        <tbody className="[&_tr:last-child]:border-0 bg-white dark:bg-[#0A0A0A]">
          {requests.map((request) => {
            // const totalCost = calculateTotalCost ? calculateTotalCost(request) : 0;

            return (
              <React.Fragment key={request.requestNumber}> {/* ✅ KEY ES REQUESTNUMBER */}
                <tr className={`border-b transition-colors hover:bg-[#F5F5F7] dark:hover:bg-gray-400/10
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

                  {/* REQUEST NUMBER & COST */}
                  <td className="px-2 align-middle font-mono ">
                    <div>
                      <p>{request.requestNumber}</p>
                      {/* {totalCost > 0 && (
                        <p className="text-xs text-green-600 font-mono">
                          ${totalCost.toFixed(2)}
                        </p>
                      )} */}
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="px-4 align-middle">
                    <div className="flex items-center space-x-2 ">
                      {getStatusBadge(request.status, darkMode ? 'outline' : 'soft')}
                    </div>
                  </td>

                  {/* TYPE COLUMN (Added back) */}
                  <td className="px-4 align-middle">
                    {getTypeBadge(request.typeRequest, darkMode ? 'outline' : 'soft')}
                  </td>

                  {/* REQUESTED BY (Updated fields) */}
                  <td className="px-4 align-middle">
                    <div>
                      <p>{request.requesterName}</p>
                      <p className="text-xs text-gray-500">{request.requesterId}</p>
                    </div>
                  </td>

                  {/* DEPARTMENT (Updated field) */}
                  <td className="px-4 align-middle">{request.departmentId}</td>

                  {/* PROJECT */}
                  <td className="px-4 align-middle">
                    {request.projectId ? (
                      <p className="text-sm">{request.projectId}</p>
                    ) : (
                      <p className="text-xs text-gray-500">-</p>
                    )}
                  </td>

                  {/* DATE */}
                  <td className="px-0 align-middle">
                    <div>
                      <p className="text-sm">{formatDate(request.createdAt)}</p>
                      {request.expectedReturnDate && (
                        <p className="text-xs text-gray-500">
                          Return: {formatDate(request.expectedReturnDate)}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* TIMELINE COLUMN (Modified) */}
                  <td className="px-0 align-middle">
                    <div className="flex flex-col gap-0.5">
                      {/* Created Date */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <span className="w-4">In:</span>
                        <span>{formatDate(request.createdAt)}</span>
                      </div>

                      {/* Return Date (Highlighted) */}
                      {request.expectedReturnDate && (
                        <div className={`flex items-center gap-3.5 text-xs ${getTimelineColor(request.createdAt, request.expectedReturnDate)}`}>
                          <span className="w-4">Due:</span>
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

                {/* Expanded Item Details Section */}
                {expandedRequests.has(request.requestNumber) && (
                  <tr className="border-b transition-colors" data-state="open">
                    <td colSpan={10} className="p-0 bg-[#F2F2F4] dark:bg-gray-900/50 transition duration-300">
                      <div className="p-6">
                        <h4 className="flex items-center mb-4 text-lg font-semibold">
                          <Package className="h-5 w-5 mr-2 text-gray-700" />
                          Request Details
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          {/* Work Order (NUEVO CAMPO) */}
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

                          {/* Notes (Antes Reason) */}
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
                                key={item.id} // item.id numérico del backend está bien aquí
                                className="flex items-center p-3 bg-white dark:bg-gray-800/30 border dark:border-gray-700 rounded-lg shadow-sm
                                  justify-self-center md:justify-self-stretch"
                              >
                                {/* Imagen */}
                                <img
                                  src={item.imageUrl || 'https://via.placeholder.com/150'}
                                  alt={item.name}
                                  className="h-20 w-20 object-cover rounded-md mr-4"
                                />

                                {/* Detalles del Item */}
                                <div className="flex-grow">
                                  <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {item.sku} {/* Antes articleCode */}
                                  </span>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {item.name} {/* Antes articleDescription */}
                                  </p>
                                  <p className="text-xs text-gray-500">{item.description}</p>

                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    {/* Cantidad Solicitada */}
                                    <span className="text-xs font-medium text-blue-700 bg-blue-100 dark:text-blue-200 dark:bg-blue-800/50 px-2 py-0.5 rounded-full">
                                      Qty: {item.quantityRequested}
                                    </span>

                                    {/* Costos (Si la interfaz los soportara, aquí irían) */}
                                    {/* <span className="text-xs font-semibold bg-gray-800 text-white px-2 py-0.5 rounded-full dark:bg-gray-200 dark:text-gray-900">
                                        Total: $...
                                      </span> 
                                    */}
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
          })}
        </tbody>
      </table>

      {requests.length === 0 && !loading && (
        <div className="p-12 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No requests found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-10 bg-white dark:bg-[#0A0A0A]">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}