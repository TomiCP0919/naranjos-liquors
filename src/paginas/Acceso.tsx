import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { esquemaAcceso } from '../utilidades/validaciones'
import type { DatosAcceso } from '../utilidades/validaciones'
import { supabase } from '../servicios/supabase'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import Swal from 'sweetalert2'

import { motion } from 'framer-motion'
import logo from '../assets/logo-NL.png'

const Acceso = () => {
  const [estaRegistrando, setEstaRegistrando] = useState(false)
  const [errorSupabase, setErrorSupabase] = useState<string | null>(null)
  const navigate = useNavigate()
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DatosAcceso>({
    resolver: zodResolver(esquemaAcceso)
  })

  const alEnviar = async (datos: DatosAcceso) => {
    setErrorSupabase(null)
    try {
      if (estaRegistrando) {
        const { error } = await supabase.auth.signUp({
          email: datos.email,
          password: datos.password
        })
        if (error) throw error
        Swal.fire('¡Éxito!', 'Te hemos enviado un correo de confirmación', 'success')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: datos.email,
          password: datos.password
        })
        if (error) throw error
        navigate('/admin')
      }
    } catch (err: any) {
      setErrorSupabase(err.message)
    }
  }

  const handleRecuperarPassword = async () => {
    const { value: email } = await Swal.fire({
      title: 'Recuperar Contraseña',
      input: 'email',
      inputLabel: 'Ingresa tu correo electrónico registrado',
      inputPlaceholder: 'ejemplo@naranjos.com',
      showCancelButton: true,
      confirmButtonText: 'Enviar Enlace de Recuperación',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#c5a059',
      background: '#0a0a0a',
      color: '#ffffff',
      inputValidator: (value) => {
        if (!value) return 'Por favor, ingresa tu correo electrónico'
      }
    })

    if (email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/admin'
      })
      if (error) {
        Swal.fire('Error', error.message, 'error')
      } else {
        Swal.fire('¡Correo enviado!', 'Revisa tu bandeja de entrada o carpeta de spam para restablecer tu contraseña.', 'success')
      }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-negro-premium flex items-center justify-center px-4"
    >
      <motion.div 
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="max-w-md w-full vidrio p-8 rounded-3xl border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <img src={logo} width={100} height={100} className="mx-auto mb-4" alt="Logo Naranjo's Liquors" />
          <h1 className="text-3xl font-bold gradiente-dorado">Naranjo's Admin</h1>
          <p className="text-white/40 mt-2">
            {estaRegistrando ? 'Crea una cuenta administrativa' : 'Ingresa a tu panel de control'}
          </p>
        </div>

        <form onSubmit={handleSubmit(alEnviar)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                {...register('email')}
                type="email" 
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:border-dorado focus:outline-none transition-all"
                placeholder="ejemplo@naranjos.com"
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                {...register('password')}
                type="password" 
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:border-dorado focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {errorSupabase && (
            <div className="bg-red-400/10 border border-red-400/20 p-3 rounded-lg flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={18} />
              <span>{errorSupabase}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-dorado hover:bg-dorado-brillante text-negro-premium font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            {isSubmitting ? 'Procesando...' : estaRegistrando ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm flex flex-col gap-4">
          {!estaRegistrando && (
            <button 
              type="button"
              onClick={handleRecuperarPassword}
              className="text-dorado hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
          <button 
            type="button"
            onClick={() => setEstaRegistrando(!estaRegistrando)}
            className="text-dorado hover:underline"
          >
            {estaRegistrando ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Acceso
