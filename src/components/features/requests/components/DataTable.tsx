import React from 'react';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
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
          <tr className="border-b transition-colors hover:bg-gray-100/50 text-center">
            <th className="h-12 w-12 px-4 text-left align-middle font-medium"></th>
            <th className="h-12 px-6 text-center align-middle font-medium">Request #</th>
            <th className="h-12 px-6 text-center align-middle font-medium">Status</th>
            <th className="h-12 px-6 text-center align-middle font-medium">Type</th>
            <th className="h-12 px-6 text-center align-middle font-medium">Requested By</th>
            <th className="h-12 px-6 text-center align-middle font-medium">Department</th>
            <th className="h-12 px-6 text-center align-middle font-medium">Project</th>
            <th className="h-12 px-6 text-center align-middle font-medium">Urgency</th>
            <th className="h-12 px-6 text-center align-middle font-medium">Request Date</th>
            <th className="h-12 px-6 text-center align-middle font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {requests.map((request) => {
            const totalCost = calculateTotalCost(request);
            return (
              <React.Fragment key={request.id}>
                {/* Esta es la <TableRow> */}
                <tr className="border-b transition-colors hover:bg-gray-100/50">
                  {/* Esta es la <TableCell> */}
                  <td className="p-0 align-middle text-center">
                    {/* Este es el <Button variant="ghost"> */}
                    <button
                      onClick={() => handleToggleExpand(request.id)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 hover:bg-gray-200"
                    >
                      {expandedRequests.has(request.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="p-0 align-middle font-mono ">
                    <div>
                      <p>{request.requestNumber}</p>
                      {(request.type === 'purchase' || request.type === 'purchase-on-site') && totalCost > 0 && (
                        <p className="text-xs text-green-600 font-mono">
                          ${totalCost.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-1 align-middle">
                    <div className="flex items-center space-x-2 ">
                      {getStatusIcon(request.status)}
                      {getStatusBadge(request.status)} {/* (Asumiendo que esta función ya devuelve un <span> con clases) */}
                    </div>
                  </td>
                  <td className="p-1 align-middle ">{getTypeBadge(request.type)}</td>
                  <td className="p-1 align-middle">
                    <div>
                      <p>{request.requestedBy}</p>
                      <p className="text-xs text-gray-500">{request.requestedByEmail}</p>
                    </div>
                  </td>
                  <td className="p-1 align-middle">{request.department}</td>
                  <td className="p-1 align-middle">
                    {request.project ? (
                      <p className="text-sm">{request.project}</p>
                    ) : (
                      <p className="text-xs text-gray-500">-</p>
                    )}
                  </td>
                  <td className="p-1 align-middle">{getUrgencyBadge(request.urgency)}</td>
                  <td className="p-1 align-middle">
                    <div>
                      <p className="text-sm">{request.requestDate}</p>
                      {request.requiredDate && (
                        <p className="text-xs text-gray-500">
                          Need by: {request.requiredDate}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-1 align-middle">
                    {request.status === 'pending' ? (
                      <div className="flex space-x-2">
                        {/* Este es el <Button variant="outline"> */}
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setApproveDialogOpen(true);
                          }}
                          className={`inline-flex items-center justify-center rounded-md text-sm 
                          font-medium h-10 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-100
                          ${darkMode ? 'dar:bg-black' : ''}`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setRejectDialogOpen(true);
                          }}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-100"
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
                  <tr className="border-b transition-colors">
                    <td colSpan={10} className="bg-gray-100/30 p-0">
                      <div className="p-4">
                        <h4 className="flex items-center mb-3 font-medium">
                          <Package className="h-4 w-4 mr-2" />
                          Request Details ({request.items.length} item{request.items.length > 1 ? 's' : ''})
                        </h4>
                        <div className="rounded-md border bg-white p-4 space-y-4">
                          {/* ... (El resto del código interno es casi igual) ... */}
                          {/* Este era el <Label> */}
                          <label className="text-sm font-medium leading-none">Reason</label>
                          <p className="text-sm text-gray-500">{request.reason}</p>

                          {/* ... etc ... */}
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