import { useEffect, useState } from 'react'
import { supabase } from '../servicios/supabase'

export interface Venta {
  id: string
  cliente_nombre: string
  cliente_telefono: string
  id_licor: string
  precio_venta: number
  fecha_venta: string
  created_at: string
  // Extendida con el nombre del licor (vía join)
  Info_Licores?: {
    nombre_licor: string
    precio_compra: number
  }
}

export const useVentas = () => {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const obtenerVentas = async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase
        .from('Ventas')
        .select(`
          *,
          Info_Licores (
            nombre_licor,
            precio_compra
          )
        `)
        .order('fecha_venta', { ascending: false })

      if (error) throw error
      setVentas(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const agregarVenta = async (nuevaVenta: Omit<Venta, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('Ventas')
        .insert([nuevaVenta])

      if (error) throw error
      await obtenerVentas()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const eliminarVenta = async (id: string) => {
    try {
      const { error } = await supabase
        .from('Ventas')
        .delete()
        .eq('id', id)

      if (error) throw error
      await obtenerVentas()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const actualizarVenta = async (id: string, datosVenta: Partial<Venta>) => {
    try {
      const { error } = await supabase
        .from('Ventas')
        .update(datosVenta)
        .eq('id', id)

      if (error) throw error
      await obtenerVentas()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  useEffect(() => {
    obtenerVentas()
  }, [])

  return { ventas, cargando, error, refrescar: obtenerVentas, agregarVenta, eliminarVenta, actualizarVenta }
}
