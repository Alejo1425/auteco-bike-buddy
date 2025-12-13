/**
 * Configuración Multi-tenant por Asesor
 *
 * Este archivo maneja la configuración específica de cada asesor
 * basándose en variables de entorno o subdominios
 */

export interface AsesorConfig {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  whatsapp: string;
  urlSubdominio: string;
  logo?: string;
  colorPrimario?: string;
  colorSecundario?: string;
}

// Configuración de asesores disponibles
const asesoresConfig: Record<string, AsesorConfig> = {
  juan: {
    id: 'juan',
    nombre: 'Juan Pérez',
    email: 'juan@autorunai.tech',
    telefono: '+57 300 123 4567',
    whatsapp: '573001234567',
    urlSubdominio: 'juan.autorunai.tech',
    colorPrimario: '#1a56db',
    colorSecundario: '#0e7490',
  },
  maria: {
    id: 'maria',
    nombre: 'María González',
    email: 'maria@autorunai.tech',
    telefono: '+57 300 234 5678',
    whatsapp: '573002345678',
    urlSubdominio: 'maria.autorunai.tech',
    colorPrimario: '#c026d3',
    colorSecundario: '#9333ea',
  },
  // Agrega más asesores según necesites
  default: {
    id: 'default',
    nombre: 'Asesor Auteco',
    email: 'info@autorunai.tech',
    telefono: '+57 300 000 0000',
    whatsapp: '573000000000',
    urlSubdominio: 'autorunai.tech',
  },
};

/**
 * Obtiene la configuración del asesor actual
 * basándose en variable de entorno o subdomain
 */
export const getAsesorConfig = (): AsesorConfig => {
  // 1. Primero intenta obtener desde variable de entorno
  const asesorId = import.meta.env.VITE_ASESOR_ID;

  if (asesorId && asesoresConfig[asesorId]) {
    return asesoresConfig[asesorId];
  }

  // 2. Si no hay variable, intenta detectar por subdomain (en producción)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];

    if (asesoresConfig[subdomain]) {
      return asesoresConfig[subdomain];
    }
  }

  // 3. Retorna configuración por defecto
  return asesoresConfig.default;
};

/**
 * Hook para usar la configuración del asesor en componentes
 */
export const useAsesorConfig = () => {
  return getAsesorConfig();
};

// Exporta la configuración actual
export const currentAsesor = getAsesorConfig();
