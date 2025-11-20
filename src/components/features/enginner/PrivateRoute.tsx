import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import { USE_AUTH_TOKENS } from './constants';

/**
 * Componente de Ruta Privada
 * 
 * Comportamiento:
 * - Si USE_AUTH_TOKENS es false: Permite acceso a todas las rutas
 * - Si USE_AUTH_TOKENS es true: Verifica autenticación antes de permitir acceso
 */
export function PrivateRoute() {
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  // Si USE_AUTH_TOKENS es false, no validar autenticación
  if (!USE_AUTH_TOKENS) {
    return <Outlet />;
  }

  // Si USE_AUTH_TOKENS es true, verificar estado de autenticación
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
