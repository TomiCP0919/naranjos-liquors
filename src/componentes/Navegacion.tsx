import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../assets/logo-NL.png'

const Navegacion = () => {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 vidrio border-b border-white/10 px-6 py-4 flex justify-between items-center bg-negro-premium/80">
      <Link to="/" className="flex items-center gap-2 group">
        <img src={logo} width={85} height={85} alt="Logo Naranjo's Liquors" />
        <span className="text-xl md:text-2xl font-bold gradiente-dorado tracking-tighter">
          NARANJO'S <span className="text-white/80 font-light">LIQUORS</span>
        </span> 
      </Link>
      
      <div className="flex items-center gap-6">
        {/* Enlaces versión Escritorio */}
        <div className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-widest text-white/60">
          <a href="/#inicio" className="hover:text-dorado transition-all">Inicio</a>
          <a href="/#catalogo" className="hover:text-dorado transition-all">Catálogo</a>
          <a href="/#contacto" className="hover:text-dorado transition-all">Contacto</a>
        </div>

        {/* Botón menú Móvil */}
        <button 
          className="md:hidden text-white/80 hover:text-dorado transition-colors"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Alternar menú"
        >
          {menuAbierto ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Desplegable Móvil con Animación */}
      <AnimatePresence>
        {menuAbierto && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-[100%] left-0 w-full bg-negro-premium/95 backdrop-blur-2xl border-b border-white/10 md:hidden flex flex-col items-center py-8 gap-8 shadow-2xl"
          >
            <a href="/#inicio" onClick={() => setMenuAbierto(false)} className="text-white/80 hover:text-dorado text-lg font-medium tracking-widest uppercase transition-all">Inicio</a>
            <a href="/#catalogo" onClick={() => setMenuAbierto(false)} className="text-white/80 hover:text-dorado text-lg font-medium tracking-widest uppercase transition-all">Catálogo</a>
            <a href="/#contacto" onClick={() => setMenuAbierto(false)} className="text-white/80 hover:text-dorado text-lg font-medium tracking-widest uppercase transition-all">Contacto</a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navegacion
