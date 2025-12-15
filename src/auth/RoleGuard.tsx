// components/features/auth/RoleGuard.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/authService';

interface RoleGuardProps {
    allowedRoles: number[]; 
    children?: React.ReactNode;
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
    const user = authService.getUser();

    // 1. Check if user exists
    if (!user || !authService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    // 2. Check Permissions directly against the number
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};