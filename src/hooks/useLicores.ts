import { useEffect, useState } from 'react'
import { supabase } from '../servicios/supabase'

export interface Licor {
  id: string
  nombre_licor: string
  descripcion: string
  historia?: string
  precio_venta: number
  precio_compra: number
  fecha_compra: string
  categoria: string
  imagen_url: string
  thumbnail_url?: string
  stock: number
  is_active: boolean
  created_at: string
}

export const useLicores = (mostrarTodos = false) => {
  const [licores, setLicores] = useState<Licor[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const obtenerLicores = async () => {
    try {
      setCargando(true)
      let query = supabase.from('Info_Licores').select('*')
      
      if (!mostrarTodos) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setLicores(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    obtenerLicores()
  }, [])

  return { licores, cargando, error, refrescar: obtenerLicores }
}

