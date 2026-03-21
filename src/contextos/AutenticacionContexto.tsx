import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../servicios/supabase'
import Swal from 'sweetalert2'

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSesion(session)
      setUsuario(session?.user ?? null)
      setCargando(false)

      if (event === 'PASSWORD_RECOVERY') {
        const { value: newPassword } = await Swal.fire({
          title: 'Restablecer Contraseña',
          input: 'password',
          inputLabel: 'Digita tu nueva contraseña',
          inputPlaceholder: 'Mínimo 6 caracteres',
          showCancelButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          confirmButtonText: 'Actualizar Contraseña',
          confirmButtonColor: '#c5a059',
          background: '#0a0a0a',
          color: '#ffffff',
          inputValidator: (value) => {
            if (!value || value.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
          }
        })

        if (newPassword) {
          const { error } = await supabase.auth.updateUser({ password: newPassword })
          if (error) {
            Swal.fire({
              title: 'Error',
              text: error.message,
              icon: 'error',
              background: '#0a0a0a',
              color: '#ffffff',
            })
          } else {
            Swal.fire({
              title: '¡Actualizada!',
              text: 'Tu contraseña ha sido cambiada exitosamente.',
              icon: 'success',
              background: '#0a0a0a',
              color: '#ffffff',
              confirmButtonColor: '#c5a059',
            })
          }
        }
      }
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
