import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Inicio from './paginas/Inicio.tsx'
import Acceso from './paginas/Acceso.tsx'
import Admin from './paginas/Admin.tsx'
import { useAutenticacion, ProveedorAutenticacion } from './contextos/AutenticacionContexto'

const RutaProtegida: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario, cargando } = useAutenticacion()
  
  if (cargando) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-negro-premium text-dorado">
      <div className="w-12 h-12 border-4 border-dorado/20 border-t-dorado rounded-full animate-spin mb-4" />
      <p className="text-sm uppercase tracking-widest animate-pulse">Iniciando Experiencia...</p>
    </div>
  )
  if (!usuario) return <Navigate to="/acceso" />
  
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
