import { useState } from 'react'
import { motion } from 'framer-motion'
import logo from '../assets/logo-NL.png'
import { useLicores, type Licor } from '../hooks/useLicores'
import { useContenido } from '../hooks/useContenido'
import { useCategorias } from '../hooks/useCategorias'
import { supabase } from '../servicios/supabase'
import { subirImagenLicor } from '../servicios/almacenamiento'
import { useAutenticacion } from '../contextos/AutenticacionContexto'
import { Plus, Edit, Trash2, LogOut, Package, Image as ImageIcon, Save, X, Layout, Search, Filter, Calendar, Tag } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { esquemaLicor, esquemaContenido, type DatosLicor, type DatosContenido } from '../utilidades/validaciones'
import Swal from 'sweetalert2'

const Admin = () => {
  const { licores, refrescar, cargando: licoresCargando } = useLicores()
  const { contenido, actualizarContenido } = useContenido()
  const { categorias: categoriasDB, agregarCategoria, eliminarCategoria } = useCategorias()
  const { cerrarSesion } = useAutenticacion()

  const [pestaña, setPestaña] = useState<'licores' | 'contenido' | 'categorias'>('licores')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [licorEnEdicion, setLicorEnEdicion] = useState<Licor | null>(null)
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null)
  const [nuevaCatNombre, setNuevaCatNombre] = useState('')

  // Filtros
  const [filtroNombre, setFiltroNombre] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroCat, setFiltroCat] = useState('Todas')

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<DatosLicor>({
    resolver: zodResolver(esquemaLicor)
  })

  const { register: regContenido, handleSubmit: handleContenido, formState: { isSubmitting: subiendoContenido } } = useForm<DatosContenido>({
    resolver: zodResolver(esquemaContenido),
    values: contenido || undefined
  })

  const abrirModal = (licor?: Licor) => {
    if (licor) {
      setLicorEnEdicion(licor)
      setValue('nombre_licor', licor.nombre_licor)
      setValue('descripcion', licor.descripcion)
      setValue('precio_venta', licor.precio_venta)
      setValue('precio_compra', licor.precio_compra)
      setValue('fecha_compra', licor.fecha_compra)
      setValue('categoria', licor.categoria)
      setValue('stock', licor.stock)
      setValue('historia', licor.historia)
    } else {
      setLicorEnEdicion(null)
      reset()
    }
    setModalAbierto(true)
  }

  const guardarLicor = async (datos: DatosLicor) => {
    try {
      let urlFinal = licorEnEdicion?.imagen_url || ''
      if (archivoImagen) {
        urlFinal = await subirImagenLicor(archivoImagen)
      }

      const infoFinal = { ...datos, imagen_url: urlFinal }

      if (licorEnEdicion) {
        const { error } = await supabase.from('Info_Licores').update(infoFinal).eq('id', licorEnEdicion.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('Info_Licores').insert([infoFinal])
        if (error) throw error
      }

      await refrescar()
      setModalAbierto(false)
      setArchivoImagen(null)
      Swal.fire('¡Éxito!', 'Producto guardado', 'success')
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error')
    }
  }

  const eliminarLicor = async (id: string) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar licor?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c5a059',
      confirmButtonText: 'Sí, eliminar'
    })

    if (isConfirmed) {
      const { error } = await supabase.from('Info_Licores').delete().eq('id', id)
      if (error) Swal.fire('Error', error.message, 'error')
      else {
        await refrescar()
        Swal.fire('Eliminado', '', 'success')
      }
    }
  }

  const guardarAjustesLanding = async (datos: DatosContenido) => {
    const res = await actualizarContenido(datos)
    if (res.success) Swal.fire('¡Éxito!', 'Contenido de landing actualizado', 'success')
    else Swal.fire('Error', res.error, 'error')
  }

  const licoresFiltrados = licores.filter(l => {
    const coincideNombre = l.nombre_licor.toLowerCase().includes(filtroNombre.toLowerCase())
    const coincideFecha = !filtroFecha || l.fecha_compra === filtroFecha
    const coincideCat = filtroCat === 'Todas' || l.categoria === filtroCat
    return coincideNombre && coincideFecha && coincideCat
  })

  // Usar categorías de la base de datos
  const opcionesCategorias = ['Todas', ...categoriasDB.map(c => c.nombre)]

  const handleAgregarCategoria = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevaCatNombre.trim()) return
    const res = await agregarCategoria(nuevaCatNombre)
    if (res.success) {
      setNuevaCatNombre('')
      Swal.fire('¡Éxito!', 'Categoría agregada', 'success')
    } else {
      Swal.fire('Error', res.error, 'error')
    }
  }

  const handleEliminarCategoria = async (id: string, nombre: string) => {
    const { isConfirmed } = await Swal.fire({
      title: `¿Eliminar ${nombre}?`,
      text: "Esto podría afectar a los licores que usen esta categoría",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c5a059',
      confirmButtonText: 'Sí, eliminar'
    })
    if (isConfirmed) {
      const res = await eliminarCategoria(id)
      if (res.success) Swal.fire('Eliminado', '', 'success')
      else Swal.fire('Error', res.error || 'No se pudo eliminar', 'error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-negro-premium text-white p-4 md:p-8"
    >
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 vidrio p-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-4">
          <img src={logo} width={90} height={90} alt="Logo Naranjo's Liquors" />
          <div>
            <h1 className="text-2xl font-bold gradiente-dorado">Administración</h1>
            <p className="text-white/40 text-sm">Naranjo's Liquors Control Panel</p>
          </div>
        </div>

        <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => setPestaña('licores')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${pestaña === 'licores' ? 'bg-dorado text-negro-premium font-bold' : 'text-white/60 hover:text-white'}`}
          >
            <Package size={18} /> Licores
          </button>
          <button
            onClick={() => setPestaña('categorias')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${pestaña === 'categorias' ? 'bg-dorado text-negro-premium font-bold' : 'text-white/60 hover:text-white'}`}
          >
            <Tag size={18} /> Categorías
          </button>
          <button
            onClick={() => setPestaña('contenido')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${pestaña === 'contenido' ? 'bg-dorado text-negro-premium font-bold' : 'text-white/60 hover:text-white'}`}
          >
            <Layout size={18} /> Landing
          </button>
        </div>

        <button onClick={cerrarSesion} className="text-white/40 hover:text-red-400 transition-colors flex items-center gap-2">
          <LogOut size={20} /> <span className="hidden md:inline">Cerrar Sesión</span>
        </button>
      </header>

      {pestaña === 'licores' ? (
        <div className="space-y-6">
          {/* Header de Licores: Filtros */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-end">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40 ml-1">Buscar nombre</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} placeholder="Ej: Ron..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-dorado focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40 ml-1">Fecha Compra</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-dorado focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40 ml-1">Categoría</label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-dorado focus:outline-none appearance-none">
                    {opcionesCategorias.map(cat => <option key={cat} value={cat} className="bg-negro-premium">{cat}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <button onClick={() => abrirModal()} className="bg-dorado hover:bg-dorado-brillante text-negro-premium px-6 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap">
              <Plus size={20} /> Nuevo Licor
            </button>
          </div>

          {/* Tabla */}
          <div className="vidrio rounded-2xl overflow-x-auto border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-dorado uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4 text-center">Fecha Compra</th>
                  <th className="px-6 py-4 text-center">Compra</th>
                  <th className="px-6 py-4 text-center">Venta</th>
                  <th className="px-6 py-4 text-center">Stock</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {licoresCargando ? (
                  // Skeleton Rows
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={`sk-${i}`} className="animate-pulse border-b border-white/5 last:border-0">
                      <td className="px-6 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-white/5 rounded" />
                          <div className="h-3 w-16 bg-white/5 rounded" />
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-white/5 mx-auto rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 mx-auto rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 mx-auto rounded" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-8 bg-white/5 mx-auto rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 ml-auto rounded" /></td>
                    </tr>
                  ))
                ) : (
                  licoresFiltrados.map((licor, index) => (
                    <motion.tr
                      key={licor.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-white/2 transition-colors border-b border-white/5 last:border-0"
                    >
                      <td className="px-6 py-4 flex items-center gap-4 min-w-[200px]">
                        <img src={licor.imagen_url || ''} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold">{licor.nombre_licor}</p>
                          <p className="text-[10px] opacity-40 uppercase">{licor.categoria}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-white/60">{licor.fecha_compra}</td>
                      <td className="px-6 py-4 text-center font-bold text-dorado">${licor.precio_compra.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center font-bold text-dorado">${licor.precio_venta.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-md ${licor.stock < 5 ? 'bg-red-500/20 text-red-400' : 'bg-white/5'}`}>
                          {licor.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => abrirModal(licor)} className="p-2 hover:text-dorado"><Edit size={16} /></button>
                          <button onClick={() => eliminarLicor(licor.id)} className="p-2 hover:text-red-400"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : pestaña === 'categorias' ? (
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="vidrio p-8 rounded-3xl border border-white/10">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="text-dorado" /> Agregar Nueva Categoría
            </h2>
            <form onSubmit={handleAgregarCategoria} className="flex gap-4">
              <input
                value={nuevaCatNombre}
                onChange={(e) => setNuevaCatNombre(e.target.value)}
                placeholder="Nombre de la categoría (ej: Gin, Tequila...)"
                className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-dorado focus:outline-none"
              />
              <button className="bg-dorado hover:bg-dorado-brillante text-negro-premium px-6 py-2 rounded-xl font-bold transition-all">
                Agregar
              </button>
            </form>
          </div>

          <div className="vidrio p-8 rounded-3xl border border-white/10">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Tag className="text-dorado" /> Categorías Existentes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoriasDB.map(cat => (
                <div key={cat.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-dorado/30 transition-all">
                  <span className="font-medium">{cat.nombre}</span>
                  <button
                    onClick={() => handleEliminarCategoria(cat.id, cat.nombre)}
                    className="text-white/20 hover:text-red-400 transition-colors p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto vidrio p-8 rounded-3xl border border-white/10">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
            <Layout className="text-dorado" /> Ajustes de la Landing Page
          </h2>
          <form onSubmit={handleContenido(guardarAjustesLanding)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-white/40">Título Principal</label>
              <input {...regContenido('titulo_principal')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-dorado focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/40">Descripción de Marca</label>
              <textarea {...regContenido('descripcion_marca')} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-dorado focus:outline-none resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/40">Mensaje de Bienvenida</label>
              <textarea {...regContenido('mensaje_bienvenida')} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-dorado focus:outline-none resize-none" />
            </div>
            <button disabled={subiendoContenido} className="w-full bg-dorado hover:bg-dorado-brillante text-negro-premium font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
              <Save size={20} /> {subiendoContenido ? 'Guardando...' : 'Guardar Ajustes'}
            </button>
          </form>
        </div>
      )}

      {/* Modal Licor */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="max-w-2xl w-full bg-negro-premium border border-dorado/20 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold gradiente-dorado">{licorEnEdicion ? 'Editar Licor' : 'Nuevo Licor'}</h2>
              <button onClick={() => setModalAbierto(false)}><X className="text-white/40 hover:text-white" /></button>
            </div>
            <form onSubmit={handleSubmit(guardarLicor)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="col-span-2 space-y-1">
                <label className="text-white/40">Nombre del Licor</label>
                <input {...register('nombre_licor')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-dorado focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-white/40">Precio Compra</label>
                <input type="number" {...register('precio_compra', { valueAsNumber: true })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-dorado focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-white/40">Precio Venta</label>
                <input type="number" {...register('precio_venta', { valueAsNumber: true })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-dorado focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-white/40">Fecha Compra</label>
                <input type="date" {...register('fecha_compra')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-dorado focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-white/40">Stock</label>
                <input type="number" {...register('stock', { valueAsNumber: true })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-dorado focus:outline-none" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-white/40">Categoría</label>
                <select {...register('categoria')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-dorado focus:outline-none appearance-none">
                  <option value="" disabled className="bg-negro-premium">Selecciona una categoría</option>
                  {categoriasDB.map(cat => (
                    <option key={cat.id} value={cat.nombre} className="bg-negro-premium">{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-white/40">Descripción Storytelling (Corta)</label>
                <textarea {...register('descripcion')} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-dorado focus:outline-none resize-none" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-white/40">Historia Completa de la Botella</label>
                <textarea {...register('historia')} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-dorado focus:outline-none resize-none" placeholder="Escribe aquí la historia legendaria de este licor..." />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-white/40">Imagen</label>
                <div className="flex gap-4 items-center">
                  {(licorEnEdicion?.imagen_url || archivoImagen) && (
                    <img src={archivoImagen ? URL.createObjectURL(archivoImagen) : licorEnEdicion?.imagen_url} className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                  )}
                  <label className="flex-grow border-2 border-dashed border-white/10 hover:border-dorado/50 p-4 rounded-xl flex flex-col items-center cursor-pointer transition-all">
                    <ImageIcon size={20} className="text-white/40" />
                    <span className="text-[10px] text-white/40 mt-1">Sube la etiqueta o botella</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setArchivoImagen(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
              <button disabled={isSubmitting} className="col-span-2 bg-dorado hover:bg-dorado-brillante text-negro-premium font-bold py-3 rounded-xl mt-4 flex items-center justify-center gap-2">
                <Save size={18} /> {isSubmitting ? 'Guardando...' : 'Confirmar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default Admin
