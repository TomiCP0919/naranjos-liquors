import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Clock, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
// lazy loading de páginas
const Inicio = lazy(() => import('./paginas/Inicio.tsx'))
const Acceso = lazy(() => import('./paginas/Acceso.tsx'))
const Admin = lazy(() => import('./paginas/Admin.tsx'))

import { useAutenticacion, ProveedorAutenticacion } from './contextos/AutenticacionContexto'

const CargandoPagina = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-negro-premium text-dorado">
    <Loader2 className="w-12 h-12 animate-spin mb-4" />
    <p className="text-sm uppercase tracking-widest animate-pulse">Iniciando Experiencia...</p>
  </div>
)

const RutaProtegida: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario, perfil, cargando, cerrarSesion } = useAutenticacion()
  
  if (cargando) return <CargandoPagina />
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

  // Si no hay perfil (null) o el estado no es aprobado, bloqueamos el acceso
  if (!perfil || perfil.estado !== 'aprobado') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-negro-premium p-4 text-center">
        <div className="vidrio p-8 rounded-2xl max-w-md w-full border border-yellow-500/20 shadow-2xl">
          <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2 text-white">Acceso no autorizado</h2>
          <p className="text-white/60 mb-8">No se ha encontrado una solicitud de acceso activa para esta cuenta. Por favor, regístrate de nuevo o contacta al administrador.</p>
          <button onClick={cerrarSesion} className="w-full bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 text-yellow-500 font-bold py-3 rounded-xl transition-colors">
            Volver al Inicio
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
      <Suspense fallback={<CargandoPagina />}>
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
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<CargandoPagina />}>
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
    </Suspense>
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
