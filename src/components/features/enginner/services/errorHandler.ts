/**
 * Sistema centralizado de manejo de errores
 * Detecta y clasifica errores de red, backend, timeout, etc.
 */

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  BACKEND_ERROR = 'BACKEND_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
  statusCode?: number;
  retryable: boolean;
}

/**
 * Verifica si hay conexión a internet
 */
export const checkInternetConnection = (): boolean => {
  return navigator.onLine;
};

/**
 * Simula una llamada API con manejo de errores
 * Incluye detección de timeout y errores de red
 */
export async function apiCall<T>(
  apiFunction: () => Promise<T>,
  timeout?: number
): Promise<T> {
  const timeoutMs = timeout ?? 10000;
  // Verificar conexión a internet
  if (!checkInternetConnection()) {
    throw createError(
      ErrorType.NETWORK_ERROR,
      'No internet connection detected. Please check your network and try again.',
      null
    );
  }

  // Crear promesa de timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(createError(
        ErrorType.TIMEOUT_ERROR,
        'Request timeout. The server is taking too long to respond.',
        null
      ));
    }, timeoutMs);
  });

  try {
    // Ejecutar la función API con timeout
    const result = await Promise.race([apiFunction(), timeoutPromise]);
    return result;
  } catch (error: any) {
    // Si ya es un AppError, relanzarlo
    if (error && error.type && Object.values(ErrorType).includes(error.type)) {
      throw error;
    }

    // Clasificar el error
    if (!navigator.onLine) {
      throw createError(
        ErrorType.NETWORK_ERROR,
        'Connection lost. Please check your internet connection.',
        error
      );
    }

    // Error de backend simulado
    if (error.statusCode) {
      throw error;
    }

    // Error desconocido
    throw createError(
      ErrorType.UNKNOWN_ERROR,
      'An unexpected error occurred. Please try again.',
      error
    );
  }
}

/**
 * Crea un objeto de error estandarizado
 */
export const createError = (
  type: ErrorType,
  message: string,
  originalError: any,
  statusCode?: number
): AppError => {
  const retryable = [
    ErrorType.NETWORK_ERROR,
    ErrorType.TIMEOUT_ERROR,
    ErrorType.BACKEND_ERROR
  ].includes(type);

  return {
    type,
    message,
    originalError,
    statusCode,
    retryable
  };
};

/**
 * Maneja errores y retorna un mensaje user-friendly
 */
export const handleError = (error: any): AppError => {
  if (error && error.type && Object.values(ErrorType).includes(error.type)) {
    return error as AppError;
  }

  // Si no es un AppError, crear uno genérico
  return createError(
    ErrorType.UNKNOWN_ERROR,
    'An unexpected error occurred. Please try again.',
    error
  );
};

/**
 * Wrapper para ejecutar funciones con retry automático
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries?: number,
  delayMs?: number
): Promise<T> {
  const maxRetriesVal = maxRetries ?? 3;
  const delayMsVal = delayMs ?? 1000;
  let lastError: AppError | null = null;

  for (let attempt = 0; attempt < maxRetriesVal; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = handleError(error);
      
      // Solo reintentar si el error es retryable
      if (!lastError.retryable || attempt === maxRetriesVal - 1) {
        throw lastError;
      }

      // Esperar antes de reintentar (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delayMsVal * Math.pow(2, attempt)));
    }
  }

  throw lastError;
}

/**
 * Listener para cambios en la conexión de internet
 */
export const setupConnectionListener = (
  onOnline: () => void,
  onOffline: () => void
): (() => void) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  // Retornar función de cleanup
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

// En tu archivo de manejo de errores (donde está createError)

/**
 * Clasifica los errores de respuesta HTTP (4xx, 5xx)
 */
export const classifyFetchError = async (response: Response): Promise<AppError> => {
    const statusCode = response.status;
    let message = `Request failed with status ${statusCode}.`;
    let type = ErrorType.BACKEND_ERROR;

    try {
        const errorBody = await response.json();
        message = errorBody.message || errorBody.error || message;
    } catch {
        // Ignorar si el cuerpo no es JSON
    }

    if (statusCode === 401 || statusCode === 403) {
        type = ErrorType.UNAUTHORIZED;
        message = 'Authentication required or invalid permissions.';
    } else if (statusCode === 404) {
        type = ErrorType.NOT_FOUND;
        message = 'Resource not found. Check the selected IDs.';
    } else if (statusCode >= 400 && statusCode < 500) {
        type = ErrorType.VALIDATION_ERROR;
    }

    return createError(type, message, response, statusCode);
};