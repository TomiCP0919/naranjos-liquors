import { useState, useEffect } from 'react'
import { supabase } from '../servicios/supabase'

export interface PerfilAdmin {
  id: string
  email: string
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  created_at: string
}

export function usePerfiles() {
  const [perfiles, setPerfiles] = useState<PerfilAdmin[]>([])
  const [cargando, setCargando] = useState(true)

  const refrescar = async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('Perfiles_Admin')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error al obtener perfiles', error)
    } else {
      setPerfiles(data || [])
    }
    setCargando(false)
  }

  useEffect(() => {
    refrescar()
  }, [])

  const cambiarEstado = async (id: string, estado: 'aprobado' | 'rechazado') => {
    const { error } = await supabase
      .from('Perfiles_Admin')
      .update({ estado })
      .eq('id', id)
      
    if (!error) {
      await refrescar()
      return { success: true }
    }
    return { success: false, error: error.message }
  }

  const eliminarPerfil = async (id: string) => {
    const { error } = await supabase.from('Perfiles_Admin').delete().eq('id', id)
    if (!error) {
      await refrescar()
      return { success: true }
    }
    return { success: false, error: error.message }
  }

  return { perfiles, cargando, cambiarEstado, eliminarPerfil, refrescar }
}
