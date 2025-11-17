import React from 'react';
import { ChevronDown, ChevronRight, Package, FileText } from 'lucide-react';
import { type Request, type RequestItem } from '../data/mockRequest.ts';
import { useSelector } from 'react-redux';


// No necesitamos importar componentes de UI (Table, Button, etc.)

// (Asegúrate de importar tu componente de imagen)
// import ImageWithFallback from './ImageWithFallback'; 

// --- Interfaz de Props (Sin cambios) ---
interface RequestsTableProps {
  requests: Request[];
  expandedRequests: Set<number>;
  calculateTotalCost: (request: Request) => number;
  getStatusIcon: (status: Request['status']) => React.ReactNode;
  getStatusBadge: (status: Request['status']) => React.ReactNode;
  getTypeBadge: (type: Request['type']) => React.ReactNode;
  getUrgencyBadge: (urgency: Request['urgency']) => React.ReactNode;
  handleToggleExpand: (id: number) => void;
  setSelectedRequest: (request: Request) => void;
  setApproveDialogOpen: (open: boolean) => void;
  setRejectDialogOpen: (open: boolean) => void;
}

// --- Componente Modularizado (Puro HTML/Tailwind) ---

export default function RequestsTable({
  requests,
  expandedRequests,
  calculateTotalCost,
  getStatusIcon,
  getStatusBadge,
  getTypeBadge,
  getUrgencyBadge,
  handleToggleExpand,
  setSelectedRequest,
  setApproveDialogOpen,
  setRejectDialogOpen,
}: RequestsTableProps) {


  const darkMode = useSelector((state: any) => state.ui.darkMode);

  if (requests.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-gray-500">
        No requests found.
      </div>
    );
  }

  return (

    // <div className="rounded-md border"> (Este era el wrapper de <Table>)
    <div className="w-full overflow-auto rounded-md border">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors bg-[#0A0A0A]">
            <th className="h-12 w-12 px-4 text-left align-middle font-medium"></th>
            <th className="h-12 px-8 align-middle font-medium">Request #</th>
            <th className="h-12 px-8 align-middle font-medium">Status</th>
            <th className="h-12 px-8 align-middle font-medium">Type</th>
            <th className="h-12 px-8 align-middle font-medium">Requested By</th>
            <th className="h-12 px-8 align-middle font-medium">Department</th>
            <th className="h-12 px-8 align-middle font-medium">Project</th>
            <th className="h-12 px-8 align-middle font-medium">Urgency</th>
            <th className="h-12 px-8 align-middle font-medium">Request Date</th>
            <th className="h-12 px-8 align-middle font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0 bg-[#0A0A0A]">
          {requests.map((request) => {
            const totalCost = calculateTotalCost(request);
            return (
              <React.Fragment key={request.id}>
                {/* Esta es la <TableRow> */}
                <tr className="border-b transition-colors hover:bg-[#F5F5F7] dark:hover:bg-gray-400/10">
                  {/* Esta es la <TableCell> */}
                  <td className="p-3 align-middle text-center">
                    {/* Este es el <Button variant="ghost"> */}
                    <button
                      onClick={() => handleToggleExpand(request.id)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10
                      hover:bg-gray-200 dark:text-white dark:bg-[#1f1f1f] dark:hover:bg-white dark:hover:text-black
                      "
                    >
                      <ChevronRight className={`h-4 w-4 transition duration-200
                            ${expandedRequests.has(request.id) ? 'rotate-90' : 'rotate-0'}
                          `}
                      />
                    </button>
                  </td>
                  <td className="px-2 align-middle font-mono ">
                    <div>
                      <p>{request.requestNumber}</p>
                      {(request.type === 'purchase' || request.type === 'purchase-on-site') && totalCost > 0 && (
                        <p className="text-xs text-green-600 font-mono">
                          ${totalCost.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 align-middle">
                    <div className="flex items-center space-x-2 ">
                      {getStatusIcon(request.status)}
                      {getStatusBadge(request.status)} {/* (Asumiendo que esta función ya devuelve un <span> con clases) */}
                    </div>
                  </td>
                  <td className="px-4 align-middle ">{getTypeBadge(request.type)}</td>
                  <td className="px-4 align-middle">
                    <div>
                      <p>{request.requestedBy}</p>
                      <p className="text-xs text-gray-500">{request.requestedByEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 align-middle">{request.department}</td>
                  <td className="px-4 align-middle">
                    {request.project ? (
                      <p className="text-sm">{request.project}</p>
                    ) : (
                      <p className="text-xs text-gray-500">-</p>
                    )}
                  </td>
                  <td className="px-4 align-middle">{getUrgencyBadge(request.urgency)}</td>
                  <td className="px-0 align-middle">
                    <div>
                      <p className="text-sm">{request.requestDate}</p>
                      {request.requiredDate && (
                        <p className="text-xs text-gray-500">
                          Need by: {request.requiredDate}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 align-middle">
                    {request.status === 'pending' ? (
                      <div className="flex space-x-2">
                        {/* Este es el <Button variant="outline"> */}
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setApproveDialogOpen(true);
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
                            setSelectedRequest(request);
                            setRejectDialogOpen(true);
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
                      <div className="text-xs text-gray-500">
                        {request.reviewedBy && (
                          <p>By: {request.reviewedBy}</p>
                        )}
                        {request.reviewDate && (
                          <p>{request.reviewDate}</p>
                        )}
                      </div>
                    )}
                  </td>
                </tr>

                {/* Expanded Item Details Section */}
                {expandedRequests.has(request.id) && (
                  <tr className="border-b transition-colors" data-state="open">
                    <td colSpan={10} className="p-0 bg-gray-50 hover:bg-[#F2F2F4] dark:bg-gray-900/50 transition duration-300">
                      <div className="p-6">
                        <h4 className="flex items-center mb-4 text-lg font-semibold">
                          <FileText className="h-5 w-5 mr-2 text-gray-700" />
                          Request Details
                        </h4>

                        {/* --- Reason Layout and Date --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                          {/* Return date */}
                          {request.returnDate && (
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">
                                Return Date
                              </label>
                              <p className="text-lg text-gray-900 dark:text-gray-100">
                                {request.returnDate}
                              </p>
                            </div>
                          )}

                          {/* Reason */}
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              Reason
                            </label>
                            <p className="text-lg text-gray-900 dark:text-gray-100">
                              {request.reason}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-md font-semibold mb-3">
                            Items ({request.items.length})
                          </h5>

                          <div className="grid grid-cols-3 gap-3">
                            {request.items.map(item => (
                              <div
                                key={item.id}
                                className="flex items-center p-3 bg-white dark:bg-gray-800/30 border dark:border-gray-700 rounded-lg shadow-sm"
                      //           className="flex items-center p-3 bg-white dark:bg-gray-800/30 border dark:border-gray-700 rounded-lg shadow-sm
                      //  justify-self-center md:justify-self-stretch"
                              >

                                {/* Imagen */}
                                <img
                                  src={item.imageUrl || 'https://via.placeholder.com/150'}
                                  alt={item.articleDescription}
                                  className="h-20 w-20 object-cover rounded-md mr-4"
                                />

                                {/* Detalles del Item */}
                                <div className="flex-grow">
                                  <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {item.articleCode}
                                  </span>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {item.articleDescription}
                                  </p>

                                  {/* Etiqueta de cantidad */}
                                  <span className="block text-sm font-medium text-blue-700 bg-blue-100 dark:text-blue-200 dark:bg-blue-800/50 px-2 py-0.5 rounded-full w-fit mt-1">
                                    {item.quantity} {item.unit}
                                  </span>
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
    </div>



  );
}