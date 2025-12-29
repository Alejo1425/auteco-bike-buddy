/**
 * Página de Catálogo Personalizado por Asesor
 *
 * Esta página carga un asesor por su slug (alejandra, miguel, etc.)
 * y muestra el catálogo de motos con Chatwoot configurado para ese asesor.
 *
 * URLs: /alejandra, /miguel, /nathalia, /lorena, /juan-pablo
 *
 * @module pages/AsesorCatalogo
 */

import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AsesorService } from '@/services/nocodb/asesor.service';
import { useChatwoot } from '@/hooks/useChatwoot';
import { useConversationId } from '@/hooks/useConversationId';
import { useAsesorContext } from '@/contexts';
import { chatwootConfig } from '@/config/env';
import type { Asesor } from '@/types';
import { getNombreAsesor } from '@/types/asesor';
import Index from './Index';

export default function AsesorCatalogo() {
  const { slug } = useParams<{ slug: string }>();
  const [asesor, setAsesor] = useState<Asesor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener el contexto del asesor para compartir con otros componentes
  const { seleccionarAsesor } = useAsesorContext();

  // Hook para detectar y guardar el conversation ID desde la URL
  // Esto es importante para rastrear conversaciones cuando el asesor envía enlaces con ?cid=123
  useConversationId();

  // Cargar Chatwoot configurado para este asesor
  const { isLoaded, setAsesor: setChatwootAsesor } = useChatwoot({
    websiteToken: chatwootConfig.websiteToken,
    autoLoad: true,
  });

  // Cargar el asesor por su slug
  useEffect(() => {
    async function cargarAsesor() {
      if (!slug) {
        setError('Slug no especificado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Buscando asesor con slug:', slug);
        const asesorEncontrado = await AsesorService.getBySlug(slug);

        console.log('📊 Asesor encontrado:', asesorEncontrado);

        if (!asesorEncontrado) {
          console.error('❌ No se encontró asesor con slug:', slug);
          setError('Asesor no encontrado');
          setLoading(false);
          return;
        }

        // Validar que el asesor tenga nombre
        const nombreAsesor = getNombreAsesor(asesorEncontrado);
        if (!nombreAsesor) {
          console.error('⚠️ El asesor no tiene nombre definido:', asesorEncontrado);
          console.error('Campos disponibles:', Object.keys(asesorEncontrado));
          setError('Error en la configuración del asesor - Falta el nombre en NocoDB');
          setLoading(false);
          return;
        }

        // Verificar que el asesor esté activo
        if (asesorEncontrado.Activo !== 1) {
          console.error('⚠️ Asesor inactivo. Estado:', asesorEncontrado.Activo);
          setError('Este asesor no está disponible actualmente');
          setLoading(false);
          return;
        }

        console.log('✅ Asesor válido, cargando catálogo...');
        setAsesor(asesorEncontrado);
        // Setear el asesor en el contexto global para que otros componentes lo usen
        seleccionarAsesor(asesorEncontrado);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error al cargar asesor:', err);
        setError('Error al cargar el asesor');
        setLoading(false);
      }
    }

    cargarAsesor();
  }, [slug, seleccionarAsesor]);

  // Configurar Chatwoot cuando el asesor carga y Chatwoot está listo
  useEffect(() => {
    if (isLoaded && asesor) {
      const nombreAsesor = getNombreAsesor(asesor);
      setChatwootAsesor(nombreAsesor, asesor.Id);
      console.log(`✅ Catálogo cargado para: ${nombreAsesor} (/${slug})`);
    }
  }, [isLoaded, asesor, slug, setChatwootAsesor]);

  // Estados de carga y error
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  if (error || !asesor) {
    // Redirigir a 404 si el asesor no existe
    return <Navigate to="/404" replace />;
  }

  // Renderizar el catálogo principal con contexto del asesor
  return (
    <div>
      {/* Banner del asesor (opcional, para futuras personalizaciones) */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {getNombreAsesor(asesor).charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold">{getNombreAsesor(asesor) || 'Asesor'}</h2>
              <p className="text-sm text-white/80">Tu asesor personal de motos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Catálogo de motos */}
      <Index />
    </div>
  );
}
