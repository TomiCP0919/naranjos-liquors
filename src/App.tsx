import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Clock, XCircle } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import Inicio from './paginas/Inicio.tsx'
import Acceso from './paginas/Acceso.tsx'
import Admin from './paginas/Admin.tsx'
import { useAutenticacion, ProveedorAutenticacion } from './contextos/AutenticacionContexto'

const RutaProtegida: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario, perfil, cargando, cerrarSesion } = useAutenticacion()
  
  if (cargando) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-negro-premium text-dorado">
      <div className="w-12 h-12 border-4 border-dorado/20 border-t-dorado rounded-full animate-spin mb-4" />
      <p className="text-sm uppercase tracking-widest animate-pulse">Iniciando Experiencia...</p>
    </div>
  )
  if (!usuario) return <Navigate to="/acceso" />
  
  if (perfil?.estado === 'pendiente') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-negro-premium p-4 text-center">
        <div className="vidrio p-8 rounded-2xl max-w-md w-full border border-dorado/20 shadow-2xl">
          <Clock className="mx-auto text-dorado mb-4 animate-pulse" size={48} />
          <h2 className="text-2xl font-bold mb-2 text-white">Cuenta en Revisión</h2>
          <p className="text-white/60 mb-8">Tu cuenta ha sido creada exitosamente. Estamos validando tus credenciales. Un administrador debe aprobar tu acceso pronto.</p>
          <button onClick={cerrarSesion} className="w-full bg-dorado/10 border border-dorado/20 hover:bg-dorado/20 text-dorado font-bold py-3 rounded-xl transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </div>
    )
  }

  if (perfil?.estado === 'rechazado') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-negro-premium p-4 text-center">
        <div className="vidrio p-8 rounded-2xl max-w-md w-full border border-red-500/20 shadow-2xl">
          <XCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2 text-white">Acceso Denegado</h2>
          <p className="text-white/60 mb-8">Tu solicitud de acceso como administrador ha sido rechazada. Contacta a la dirección si crees que esto es un error.</p>
          <button onClick={cerrarSesion} className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold py-3 rounded-xl transition-colors">
            Salir del Sistema
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function ContenidoApp() {
  const location = useLocation()
  const hostname = window.location.hostname
  
  // Detectamos si estamos en el subdominio de administración 
  // (Funciona para admin.naranjos-liquors.com o similares)
  const esSubdominioAdmin = hostname.startsWith('admin.') || hostname.includes('admin-')

  if (esSubdominioAdmin) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/acceso" element={<Acceso />} />
          <Route 
            path="/*" 
            element={
              <RutaProtegida>
                <Admin />
              </RutaProtegida>
            } 
          />
        </Routes>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Inicio />} />
        <Route path="/acceso" element={<Acceso />} />
        <Route 
          path="/admin/*" 
          element={
            <RutaProtegida>
              <Admin />
            </RutaProtegida>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <ProveedorAutenticacion>
      <ContenidoApp />
    </ProveedorAutenticacion>
  )
}

export default App
