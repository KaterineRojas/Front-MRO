import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { store, useAppSelector } from './store';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { InventoryManager } from './components/features/inventory/InventoryManager';
import { RequestOrders } from './components/RequestOrders';
import { PurchaseOrders } from './components/PurchaseOrders';
import { RequestManagement } from './components/RequestManagement';
import { Reports } from './components/Reports';
import { UserManagement } from './components/UserManagement';
import { QuickFind } from './components/QuickFind';
import { CycleCount } from './components/CycleCount';
import { LoanDetailView } from './components/LoanDetailView';
import { OrderDetailView } from './components/OrderDetailView';
import { CycleCountView } from './components/CycleCountView';
import { ReturnItemsPage } from './components/ReturnItemsPage';

// Wrapper components for route navigation
function CycleCountWrapper() {
  const navigate = useNavigate();
  
  return (
    <CycleCount 
      onStartCycleCount={() => navigate('/cycle-count/active')}
      onViewCycleCount={(record) => navigate('/cycle-count/active')}
    />
  );
}

function RequestOrdersWrapper() {
  const navigate = useNavigate();
  
  const handleNavigate = (path: string, state?: any) => {
    if (state) {
      sessionStorage.setItem('navigationState', JSON.stringify(state));
    }
    navigate(path);
  };
  
  return (
    <RequestOrders 
      onViewDetail={(request, previousTab) => {
        handleNavigate('/loans/detail', { request, previousTab });
      }}
      onReturnItems={(request, previousTab) => {
        handleNavigate('/loans/return', { request, previousTab });
      }}
    />
  );
}

function PurchaseOrdersWrapper() {
  const navigate = useNavigate();
  
  const handleNavigate = (path: string, state?: any) => {
    if (state) {
      sessionStorage.setItem('navigationState', JSON.stringify(state));
    }
    navigate(path);
  };
  
  return (
    <PurchaseOrders 
      onViewDetail={(order) => {
        handleNavigate('/orders/detail', { order });
      }} 
    />
  );
}

function LoanDetailWrapper() {
  const navigate = useNavigate();
  
  const stateData = sessionStorage.getItem('navigationState');
  const state = stateData ? JSON.parse(stateData) : null;
  
  return (
    <LoanDetailView 
      request={state?.request} 
      onBack={() => {
        sessionStorage.removeItem('navigationState');
        navigate('/loans');
      }} 
    />
  );
}

function ReturnItemsWrapper() {
  const navigate = useNavigate();
  
  const stateData = sessionStorage.getItem('navigationState');
  const state = stateData ? JSON.parse(stateData) : null;
  
  return (
    <ReturnItemsPage 
      request={state?.request} 
      onBack={() => {
        sessionStorage.removeItem('navigationState');
        navigate('/loans');
      }}
      onReturnConfirmed={(request, returnItems) => {
        console.log('Return confirmed:', { request, returnItems });
        alert('Items returned successfully!');
        sessionStorage.removeItem('navigationState');
        navigate('/loans');
      }}
    />
  );
}

function OrderDetailWrapper() {
  const navigate = useNavigate();
  
  const stateData = sessionStorage.getItem('navigationState');
  const state = stateData ? JSON.parse(stateData) : null;
  
  return (
    <OrderDetailView 
      order={state?.order} 
      onBack={() => {
        sessionStorage.removeItem('navigationState');
        navigate('/orders');
      }} 
    />
  );
}

function CycleCountActiveWrapper() {
  const navigate = useNavigate();
  
  return (
    <CycleCountView 
      onBack={() => navigate('/cycle-count')} 
    />
  );
}

function AppRoutes() {
  // Get user from Redux store
  const user = useAppSelector((state) => state.auth.user);
  
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Main Routes */}
        <Route index element={<Dashboard />} />
        <Route path="inventory" element={<InventoryManager />} />
        <Route path="quick-find" element={<QuickFind />} />
        <Route path="reports" element={<Reports />} />
        
        {/* Cycle Count Routes */}
        <Route path="cycle-count" element={<CycleCountWrapper />} />
        <Route path="cycle-count/active" element={<CycleCountActiveWrapper />} />
        
        {/* Loan/Request Orders Routes */}
        <Route path="loans" element={<RequestOrdersWrapper />} />
        <Route path="loans/detail" element={<LoanDetailWrapper />} />
        <Route path="loans/return" element={<ReturnItemsWrapper />} />
        
        {/* Purchase Orders Routes */}
        <Route path="orders" element={<PurchaseOrdersWrapper />} />
        <Route path="orders/detail" element={<OrderDetailWrapper />} />
        
        {/* Request Management (Admin/Manager only) */}
        {user && ['administrator', 'manager'].includes(user.role) && (
          <Route path="requests" element={<RequestManagement />} />
        )}
        
        {/* User Management (Admin only) */}
        {user && user.role === 'administrator' && (
          <Route path="users" element={<UserManagement />} />
        )}
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}
