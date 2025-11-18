import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store';
import { AppLayout } from '../components/AppLayout';
import { Dashboard } from '../components/pages/Dashboard';
import { Catalog } from '../components/pages/Catalog/Catalog';
import { RequestOrders } from '../components/pages/Requests/RequestOrders';
import { BorrowRequests } from '../components/pages/Requests/Borrow/BorrowRequests';
import { PurchaseRequests } from '../components/pages/Requests/Purchase/PurchaseRequests';
import { TransferRequests } from '../components/pages/TransferRequests/TransferRequests';
import { MyInventoryTransfer } from '../components/pages/MyInventory/MyInventoryTransfer';
import { CompleteHistory } from '../components/pages/MyInventory/CompleteHistory';
import { Login } from '../components/pages/Login';
import { PrivateRoute } from '../components/PrivateRoute';
import { USE_AUTH_TOKENS } from '../constants';

export function AppRouter() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública de login (solo visible si USE_AUTH_TOKENS = true) */}
          {USE_AUTH_TOKENS && <Route path="/login" element={<Login />} />}
          
          {/* Rutas protegidas - Envueltas en PrivateRoute */}
          <Route path="/" element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="catalog" element={<Catalog />} />
              <Route path="request-orders" element={<RequestOrders />}>
                <Route index element={<Navigate to="borrow" replace />} />
                <Route path="borrow" element={<BorrowRequests />} />
                <Route path="purchase" element={<PurchaseRequests />} />
                <Route path="transfer" element={<TransferRequests />} />
              </Route>
              <Route path="my-inventory" element={<MyInventoryTransfer />} />
              <Route path="complete-history" element={<CompleteHistory />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}