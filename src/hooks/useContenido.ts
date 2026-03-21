import { useEffect, useState } from 'react'
import { supabase } from '../servicios/supabase'

export interface ContenidoLanding {
  id?: number
  titulo_principal: string
  descripcion_marca: string
  mensaje_bienvenida: string
}

export const useContenido = () => {
  const [contenido, setContenido] = useState<ContenidoLanding | null>(null)
  const [cargando, setCargando] = useState(true)

  const obtenerContenido = async () => {
    try {
      const { data, error } = await supabase
        .from('contenido_landing')
        .select('clave, contenido')

      if (error) throw error
      
      const mappedContenido = data.reduce((acc: any, curr: any) => {
        acc[curr.clave] = curr.contenido
        return acc
      }, {})

      setContenido(mappedContenido as ContenidoLanding)
    } catch (err) {
      console.error('Error al obtener contenido:', err)
    } finally {
      setCargando(false)
    }
  }

  const actualizarContenido = async (nuevosDatos: ContenidoLanding) => {
    try {
      const promises = Object.entries(nuevosDatos).map(([clave, contenido]) => {
        return supabase
          .from('contenido_landing')
          .update({ contenido })
          .eq('clave', clave)
      })

      const results = await Promise.all(promises)
      const error = results.find(r => r.error)?.error

      if (error) throw error
      await obtenerContenido()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  useEffect(() => {
    obtenerContenido()
  }, [])

  return { contenido, cargando, actualizarContenido, refrescar: obtenerContenido }
}
