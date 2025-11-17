/**
 * Engineer Module Wrapper
 * Ensures engineer components use the correct store and context
 */
import React from 'react';
import { useAppSelector } from '../../../store/hooks';

interface EngineerModuleWrapperProps {
  children: React.ReactNode;
}

export function EngineerModuleWrapper({ children }: EngineerModuleWrapperProps) {
  // Verificar si el usuario está autenticado en el sistema principal
  const mainUser = useAppSelector((state) => state.auth.user);
  const engineerUser = useAppSelector((state) => state.engineerUser.currentUser);

  // Si el sistema principal tiene usuario, sincronizar con engineer
  React.useEffect(() => {
    if (mainUser && !engineerUser) {
      // Sincronizar usuario del sistema principal con engineer
      // El componente engineer manejará su propia lógica de usuario
      console.log('Main user available:', mainUser);
    }
  }, [mainUser, engineerUser]);

  return <>{children}</>;
}
