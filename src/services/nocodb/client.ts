/**
 * Cliente HTTP para NocoDB API
 *
 * 🎓 CONCEPTO: API Client Pattern
 * En lugar de usar fetch() directamente en cada lugar,
 * creamos una clase que centraliza toda la lógica de comunicación.
 *
 * Ventajas:
 * - Autenticación automática (token en headers)
 * - Manejo de errores consistente
 * - Fácil de cambiar si NocoDB cambia su API
 * - Un solo lugar para debugging
 *
 * @module services/nocodb/client
 */

import { nocodbConfig } from '@/config/env';

/**
 * Configuración de opciones para requests
 */
interface RequestOptions {
  /** Query parameters para la URL (?key=value) */
  params?: Record<string, string | number | boolean>;

  /** Body del request (para POST, PUT, PATCH) */
  body?: unknown;

  /** Headers adicionales (además de los por defecto) */
  headers?: Record<string, string>;
}

/**
 * Estructura de error de NocoDB
 */
interface NocoDBError {
  error: string;
  message: string;
}

/**
 * Cliente HTTP para la API de NocoDB
 *
 * 🎓 CONCEPTO: Singleton Pattern
 * Solo queremos UNA instancia de este cliente en toda la app.
 * Por eso usamos una clase con métodos estáticos.
 */
export class NocoDBClient {
  /**
   * Base URL de la API
   * Ejemplo: "https://nocodb.autorunai.tech"
   */
  private static readonly BASE_URL = nocodbConfig.baseUrl;

  /**
   * ID de la base de datos
   * Ejemplo: "p3aqrpa3rc5mhel"
   */
  private static readonly BASE_ID = nocodbConfig.baseId;

  /**
   * Token de autenticación
   */
  private static readonly TOKEN = nocodbConfig.token;

  /**
   * Headers por defecto que se envían en cada request
   *
   * 🎓 EXPLICACIÓN:
   * - xc-token: Autenticación de NocoDB
   * - Content-Type: Le decimos a la API que enviamos JSON
   * - Accept: Le decimos que esperamos JSON de respuesta
   */
  private static getDefaultHeaders(): Record<string, string> {
    return {
      'xc-token': this.TOKEN,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Construye una URL completa con query parameters
   *
   * @param endpoint - El endpoint (ej: "/tables/xxx/records")
   * @param params - Query parameters opcionales
   * @returns URL completa
   *
   * @example
   * ```ts
   * buildUrl('/records', { limit: 10, offset: 0 })
   * // Resultado: "https://nocodb.../records?limit=10&offset=0"
   * ```
   */
  private static buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): string {
    // Construir URL base
    // Nota: endpoint ya incluye el tableId y la ruta (ej: "mk3y12zsd2xgngl/records")
    const url = new URL(
      `/api/v2/tables/${endpoint}`,
      this.BASE_URL
    );

    // Agregar query parameters si existen
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Maneja errores de la API de NocoDB
   *
   * 🎓 CONCEPTO: Error Handling
   * Convertimos errores de diferentes formatos en un formato consistente
   * que podemos mostrar al usuario.
   *
   * @param error - Error original
   * @throws Error con mensaje amigable
   */
  private static async handleError(response: Response): Promise<never> {
    let errorMessage = 'Error al comunicarse con NocoDB';

    try {
      // Intentar leer el error como JSON
      const errorData: NocoDBError = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Si no es JSON, usar el texto de la respuesta
      errorMessage = await response.text() || errorMessage;
    }

    // Agregar código de estado HTTP
    const fullError = `[${response.status}] ${errorMessage}`;

    // Log en desarrollo para debugging
    if (import.meta.env.DEV) {
      console.error('❌ Error de NocoDB:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        message: errorMessage,
      });
    }

    throw new Error(fullError);
  }

  /**
   * Realiza un request GET
   *
   * @param endpoint - Endpoint relativo (ej: "mk3y12zsd2xgngl/records")
   * @param options - Opciones del request
   * @returns Datos de la respuesta
   *
   * @example
   * ```ts
   * // Obtener todos los asesores
   * const data = await NocoDBClient.get('mk3y12zsd2xgngl/records');
   *
   * // Con filtros
   * const data = await NocoDBClient.get('mk3y12zsd2xgngl/records', {
   *   params: {
   *     where: '(activo,eq,true)',
   *     limit: 10
   *   }
   * });
   * ```
   */
  static async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint, options.params);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...this.getDefaultHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Realiza un request POST (crear nuevo registro)
   *
   * @param endpoint - Endpoint relativo
   * @param options - Opciones incluyendo body
   * @returns Datos creados
   *
   * @example
   * ```ts
   * const nuevoAsesor = await NocoDBClient.post('mk3y12zsd2xgngl/records', {
   *   body: {
   *     Aseror: 'Pedro',
   *     Phone: '3001234567',
   *     activo: true
   *   }
   * });
   * ```
   */
  static async post<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint, options.params);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...this.getDefaultHeaders(),
        ...options.headers,
      },
      body: JSON.stringify(options.body),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Realiza un request PATCH (actualizar registro)
   *
   * 🎓 CONCEPTO: PUT vs PATCH
   * - PUT: Reemplaza TODO el registro
   * - PATCH: Actualiza solo los campos que envías
   * Usamos PATCH porque es más flexible.
   *
   * @param endpoint - Endpoint relativo
   * @param options - Opciones incluyendo body
   * @returns Datos actualizados
   */
  static async patch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint, options.params);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...this.getDefaultHeaders(),
        ...options.headers,
      },
      body: JSON.stringify(options.body),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Realiza un request DELETE (eliminar registro)
   *
   * @param endpoint - Endpoint relativo
   * @param options - Opciones del request
   */
  static async delete(endpoint: string, options: RequestOptions = {}): Promise<void> {
    const url = this.buildUrl(endpoint, options.params);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...this.getDefaultHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      await this.handleError(response);
    }
  }
}

/**
 * 🎓 RESUMEN DE LO QUE HICIMOS:
 *
 * 1. Creamos una clase que centraliza toda la comunicación con NocoDB
 * 2. Maneja autenticación automáticamente (token en headers)
 * 3. Tiene métodos para GET, POST, PATCH, DELETE
 * 4. Maneja errores de manera consistente
 * 5. Facilita agregar query parameters
 * 6. Un solo lugar para debugging
 *
 * AHORA, en lugar de escribir esto en cada archivo:
 * ```ts
 * const response = await fetch('https://nocodb...', {
 *   headers: { 'xc-token': '...' },
 *   ...
 * });
 * if (!response.ok) { ... }
 * const data = await response.json();
 * ```
 *
 * Escribimos esto:
 * ```ts
 * const data = await NocoDBClient.get('endpoint');
 * ```
 *
 * ¡Mucho más simple y mantenible!
 */
