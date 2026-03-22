import { useState } from 'react'
import { useLicores } from '../hooks/useLicores'
import { useContenido } from '../hooks/useContenido'
import { useCategorias } from '../hooks/useCategorias'
import Navegacion from '../componentes/Navegacion'
import { Search, Filter, Instagram, Facebook, Music2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const WhatsAppIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.004 2C6.48 2 2.004 6.477 2.004 12c0 1.891.526 3.66 1.437 5.17L2 22l5.008-1.297c1.446.784 3.102 1.297 4.996 1.297 5.524 0 10-4.477 10-10S17.528 2 12.004 2zm5.834 14.43c-.259.733-1.282 1.34-1.764 1.443-.483.097-1.109.134-3.14-.683-2.031-.817-4.148-3.085-5.122-4.417-1.127-1.536-1.558-2.618-1.558-3.704 0-1.139.535-1.782.934-2.193.398-.41.73-.513.968-.513.238 0 .476.012.678.02.213.011.503-.081.782.593.284.693.968 2.361 1.053 2.534.085.174.141.376.027.593-.114.223-.171.365-.34.559-.171.205-.353.388-.512.56-.16.174-.32.365-.137.683.182.314.814 1.346 1.745 2.172.931.826 1.708 1.082 2.027 1.242.32.16.513.134.698-.083.185-.213.782-.911.986-1.226.204-.315.409-.261.682-.16.273.102 1.732.816 2.027.962.296.146.495.213.568.328.073.111.073.655-.186 1.388z" />
  </svg>
)

const TikTokIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
  </svg>
)

const Inicio = () => {
  const { licores, cargando: licoresCargando } = useLicores()
  const { contenido, cargando: contenidoCargando } = useContenido()
  const { categorias: categoriasDB, cargando: catsCargando } = useCategorias()
  const [busqueda, setBusqueda] = useState('')
  const [categoriaSel, setCategoriaSel] = useState('Todas')
  const [licorHistoria, setLicorHistoria] = useState<any>(null)

  const cargando = licoresCargando || contenidoCargando || catsCargando

  const categorias = ['Todas', ...categoriasDB.map(c => c.nombre)]

  const licoresFiltrados = licores.filter(l => {
    const coincideNombre = l.nombre_licor.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaSel === 'Todas' || l.categoria === categoriaSel
    return coincideNombre && coincideCategoria
  })

  return (
    <div className="min-h-screen bg-negro-premium text-white">
      <Navegacion />

      {/* Hero Section */}
      <header id="inicio" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-negro-premium z-10" />
          <img
            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"
            alt="Fondo Bebidas"
            className="w-full h-full object-cover scale-105 animate-pulse-slow"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 text-center px-4 mt-16 md:mt-0"
        >
          <h1 className="text-5xl md:text-8xl font-black mb-4 gradiente-dorado uppercase">
            {contenido?.titulo_principal || "NARANJO'S"}
          </h1>
          <p className="text-xl md:text-2xl text-white/70 font-light tracking-[0.3em] uppercase mb-4">
            {contenido?.descripcion_marca || "La Excelencia en Cada Gota"}
          </p>
          <p className="text-dorado/60 italic mb-8 max-w-2xl mx-auto">
            {contenido?.mensaje_bienvenida}
          </p>
          <a
            href="#catalogo"
            className="bg-dorado hover:bg-dorado-brillante text-negro-premium px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(197,160,89,0.3)]"
          >
            Explorar Catálogo
          </a>
        </motion.div>
      </header>

      {/* Catálogo Section */}
      <section id="catalogo" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
          <h2 className="text-4xl font-bold border-l-4 border-dorado pl-6">Nuestra Colección</h2>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Buscador */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-dorado transition-colors" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-dorado transition-all w-full"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Filtro Categoría */}
            <div className="relative group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-dorado transition-colors" size={18} />
              <select
                className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-8 py-2 focus:outline-none focus:border-dorado transition-all appearance-none cursor-pointer w-full"
                value={categoriaSel}
                onChange={(e) => setCategoriaSel(e.target.value)}
              >
                {categorias.map(cat => (
                  <option key={cat} value={cat} className="bg-negro-premium">{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[400px] rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {licoresFiltrados.map((licor) => (
                <motion.div
                  layout
                  key={licor.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="group vidrio rounded-2xl overflow-hidden border border-white/10 hover:border-dorado/50 hover:shadow-[0_20px_40px_rgba(197,160,89,0.15)] transition-all duration-500 flex flex-col cursor-pointer"
                  onClick={() => setLicorHistoria(licor)}
                >
                  <div className="p-5 flex-grow flex flex-col">
                    <div className="overflow-hidden rounded-xl mb-4 aspect-[3/4] sm:aspect-auto sm:h-52 lg:h-48">
                      <img 
                        src={licor.imagen_url} 
                        alt={licor.nombre_licor} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    </div>
                    <p className="text-dorado/70 text-[10px] uppercase tracking-widest font-bold mb-1">{licor.categoria}</p>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-dorado transition-colors duration-300 line-clamp-2">{licor.nombre_licor}</h3>
                    <p className="text-white/50 text-sm line-clamp-2 mb-4 italic">"{licor.descripcion}"</p>
                    <div className="mt-auto flex justify-between items-center">
                      <span className="text-2xl font-black text-dorado">${licor.precio_venta.toLocaleString()}</span>
                      <span className="text-xs uppercase tracking-tighter text-dorado border-b border-dorado/60 pb-0.5 md:opacity-0 md:group-hover:opacity-100 md:translate-y-2 md:group-hover:translate-y-0 transition-all duration-300">
                        Ver Historia
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Contacto Section */}
      <footer id="contacto" className="bg-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8 gradiente-dorado">Contáctanos</h2>
          <div className="flex justify-center gap-8 mb-12">
            <a href="https://wa.me/+573217578704" target="_blank" className="hover:text-dorado hover:scale-125 transition-all">
              <WhatsAppIcon size={32} />
            </a>
            <a href="https://www.instagram.com/naranjos.liquors/" target="_blank" className="hover:text-dorado hover:scale-125 transition-all">
              <Instagram size={32} />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61571331639085&locale=es_LA" target="_blank" className="hover:text-dorado hover:scale-125 transition-all">
              <Facebook size={32} />
            </a>
            <a href="https://tiktok.com" target="_blank" className="hover:text-dorado hover:scale-125 transition-all">
              <Music2 size={32} />
            </a>
          </div>
          <p className="text-white/40 text-sm">© 2026 Naranjo's Liquors. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Modal Historia */}
      <AnimatePresence>
        {licorHistoria && (
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 bg-black/90 backdrop-blur-md overflow-y-auto"
            onClick={(e) => { if (e.target === e.currentTarget) setLicorHistoria(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-4xl w-full bg-negro-premium border border-dorado/20 rounded-3xl overflow-hidden shadow-2xl relative mb-8"
            >
              <button
                onClick={() => setLicorHistoria(null)}
                className="absolute top-4 right-4 text-white/60 hover:text-white z-10 p-2 bg-black/40 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={22} />
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Imagen */}
                <div className="w-full md:w-2/5 aspect-[3/4] md:aspect-auto md:h-auto shrink-0">
                  <img
                    src={licorHistoria.imagen_url}
                    alt={licorHistoria.nombre_licor}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Contenido */}
                <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
                  <p className="text-dorado text-xs uppercase tracking-widest mb-2 font-bold">{licorHistoria.categoria}</p>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-5 gradiente-dorado uppercase leading-tight">
                    {licorHistoria.nombre_licor}
                  </h2>

                  <div className="mb-6">
                    <p className="text-base md:text-lg text-white/75 leading-relaxed italic">
                      "{licorHistoria.historia || 'Este licor guarda secretos que solo el tiempo sabe revelar. Una joya de nuestra colección privada lista para ser descubierta.'}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-px flex-grow bg-white/10" />
                    <button
                      onClick={() => setLicorHistoria(null)}
                      className="bg-dorado hover:bg-dorado-brillante text-negro-premium px-6 py-3 rounded-full font-bold transition-all transform hover:scale-105"
                    >
                      Volver al Catálogo
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Socials */}
      <div className="fixed bottom-8 right-8 z-[110] flex flex-col gap-4">
        <motion.a
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          href="https://wa.me/+573217578704"
          target="_blank"
          className="w-14 h-14 bg-[#25D366] text-white flex items-center justify-center rounded-full shadow-[0_4px_15px_rgba(37,211,102,0.4)] hover:shadow-[0_4px_25px_rgba(37,211,102,0.6)] transition-all"
        >
          <WhatsAppIcon size={30} />
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          href="https://www.instagram.com/naranjos.liquors/"
          target="_blank"
          className="w-14 h-14 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center rounded-full shadow-[0_4px_15px_rgba(220,39,67,0.4)] hover:shadow-[0_4px_25px_rgba(220,39,67,0.6)] transition-all"
        >
          <Instagram size={30} />
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          href="https://tiktok.com"
          target="_blank"
          className="w-14 h-14 bg-black text-white flex items-center justify-center rounded-full border border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.4)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.6)] transition-all"
        >
          <TikTokIcon size={26} />
        </motion.a>
      </div>
    </div>
  )
}

export default Inicio
