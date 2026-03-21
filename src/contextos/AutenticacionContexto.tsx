import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../servicios/supabase'

interface ContextoAutenticacion {
  usuario: User | null
  sesion: Session | null
  cargando: boolean
  cerrarSesion: () => Promise<void>
}

const AutenticacionContexto = createContext<ContextoAutenticacion | undefined>(undefined)

export const ProveedorAutenticacion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<User | null>(null)
  const [sesion, setSesion] = useState<Session | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session)
      setUsuario(session?.user ?? null)
      setCargando(false)
    })

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session)
      setUsuario(session?.user ?? null)
      setCargando(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AutenticacionContexto.Provider value={{ usuario, sesion, cargando, cerrarSesion }}>
      {children}
    </AutenticacionContexto.Provider>
  )
}

export const useAutenticacion = () => {
  const contexto = useContext(AutenticacionContexto)
  if (contexto === undefined) {
    throw new Error('useAutenticacion debe usarse dentro de un ProveedorAutenticacion')
  }
  return contexto
}
