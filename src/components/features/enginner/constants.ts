/**
 * Configuración global de autenticación
 * 
 * USE_AUTH_TOKENS: Controla si la aplicación utiliza autenticación basada en tokens
 * - true: Activa el sistema de autenticación con tokens JWT, login, rutas privadas
 * - false: Desactiva autenticación, todas las rutas son accesibles
 */
export const USE_AUTH_TOKENS = false; // Cambiar a true para activar autenticación

/**
 * Configuración de almacenamiento de tokens
 * - 'localStorage': Persiste entre sesiones del navegador
 * - 'sessionStorage': Se elimina al cerrar el navegador
 */
export const TOKEN_STORAGE_TYPE: 'localStorage' | 'sessionStorage' = 'localStorage';

/**
 * Nombre de la clave para almacenar el token
 */
export const TOKEN_KEY = 'auth_token';

/**
 * Nombre de la clave para almacenar datos del usuario
 */
export const USER_KEY = 'user_data';
