import { Link } from 'react-router-dom'
import logo from '../assets/logo-NL.png'

const Navegacion = () => {
  return (
    <nav className="fixed top-0 w-full z-50 vidrio border-b border-white/10 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 group">
        <img src={logo} width={85} height={85} alt="Logo Naranjo's Liquors" />
        <span className="text-2xl font-bold gradiente-dorado tracking-tighter ">
          NARANJO'S <span className="text-white/80 font-light">LIQUORS</span>
        </span> 
      </Link>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-widest text-white/60">
          <a href="/#inicio" className="hover:text-dorado transition-all">Inicio</a>
          <a href="/#catalogo" className="hover:text-dorado transition-all">Catálogo</a>
          <a href="/#contacto" className="hover:text-dorado transition-all">Contacto</a>
        </div>
      </div>
    </nav>
  )
}

export default Navegacion
