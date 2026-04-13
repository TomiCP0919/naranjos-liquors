import { useEffect, useState } from 'react'
import { supabase } from '../servicios/supabase'

export interface Categoria {
  id: string
  nombre: string
  created_at: string
}

export const useCategorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const obtenerCategorias = async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error
      setCategorias(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const agregarCategoria = async (nombre: string) => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert([{ nombre }])
        .select()

      if (error) throw error
      await obtenerCategorias()
      return { success: true, data }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const eliminarCategoria = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)

      if (error) throw error
      await obtenerCategorias()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const editarCategoria = async (id: string, nuevoNombre: string, nombreAntiguo: string) => {
    try {
      // 1. Actualizar tabla de categorías
      const { error: errCat } = await supabase
        .from('categorias')
        .update({ nombre: nuevoNombre })
        .eq('id', id)

      if (errCat) throw errCat

      // 2. Actualizar en cascada todos los licores (bulk update por texto)
      const { error: errLicores } = await supabase
        .from('Info_Licores')
        .update({ categoria: nuevoNombre })
        .eq('categoria', nombreAntiguo)

      if (errLicores) throw errLicores

      await obtenerCategorias()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  useEffect(() => {
    obtenerCategorias()
  }, [])

  return { 
    categorias, 
    cargando, 
    error, 
    refrescar: obtenerCategorias, 
    agregarCategoria, 
    eliminarCategoria,
    editarCategoria
  }
}
