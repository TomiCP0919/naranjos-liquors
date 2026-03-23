import { useEffect, useState } from 'react'
import { supabase } from '../servicios/supabase'

export interface VentaItem {
  id: string
  id_venta: string
  id_licor: string
  cantidad: number
  precio_unitario: number
  Info_Licores?: {
    nombre_licor: string
    precio_compra: number
  }
}

export interface Venta {
  id: string
  cliente_nombre: string
  cliente_telefono: string
  fecha_venta: string
  total_venta: number
  created_at: string
  items: VentaItem[]
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
          Venta_Items (
            *,
            Info_Licores (
              nombre_licor,
              precio_compra
            )
          )
        `)
        .order('fecha_venta', { ascending: false })

      if (error) throw error

      // Mapear items a la interfaz
      const ventasMapeadas = (data || []).map((v: any) => ({
        ...v,
        items: v.Venta_Items || []
      }))

      setVentas(ventasMapeadas)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const agregarVenta = async (datosVenta: {
    cliente_nombre: string
    cliente_telefono: string
    fecha_venta: string
    total_venta: number
    items: { id_licor: string, cantidad: number, precio_unitario: number }[]
  }) => {
    try {
      // 1. Crear la venta principal
      // Incluimos precio_venta e id_licor del primer ítem para compatibilidad con restricciones NOT NULL antiguas
      const { data: ventaCreada, error: errorVenta } = await supabase
        .from('Ventas')
        .insert([{
          cliente_nombre: datosVenta.cliente_nombre,
          cliente_telefono: datosVenta.cliente_telefono,
          fecha_venta: datosVenta.fecha_venta,
          total_venta: datosVenta.total_venta,
          precio_venta: datosVenta.total_venta, // Valor total para la columna legacy
          id_licor: datosVenta.items[0]?.id_licor || null
        }])
        .select()
        .single()

      if (errorVenta) throw errorVenta

      // 2. Crear los ítems de la venta
      const itemsConId = datosVenta.items.map(item => ({
        ...item,
        id_venta: ventaCreada.id
      }))

      const { error: errorItems } = await supabase
        .from('Venta_Items')
        .insert(itemsConId)

      if (errorItems) throw errorItems
      
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
