import { useState } from 'react'
import { motion } from 'framer-motion'
import logo from '../assets/logo-NL.png'
import { useLicores, type Licor } from '../hooks/useLicores'
import { useVentas, type Venta } from '../hooks/useVentas'
import { usePerfiles } from '../hooks/usePerfiles'
import { useContenido } from '../hooks/useContenido'
import { useCategorias } from '../hooks/useCategorias'
import * as XLSX from 'xlsx'
import { supabase } from '../servicios/supabase'
import { subirImagenLicor } from '../servicios/almacenamiento'
import { useAutenticacion } from '../contextos/AutenticacionContexto'
import { Plus, Edit, Trash2, LogOut, Package, Image as ImageIcon, Save, X, Layout, Search, Filter, Calendar, Tag, FileDown, User, Phone, DollarSign, History, AlertTriangle, Users, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { esquemaLicor, esquemaContenido, type DatosLicor, type DatosContenido } from '../utilidades/validaciones'
import Swal from 'sweetalert2'

const Admin = () => {
  const { licores, refrescar: refrescarLicores, cargando: licoresCargando } = useLicores()
  const { ventas, cargando: ventasCargando, agregarVenta, actualizarVenta, eliminarVenta } = useVentas()
  const { contenido, actualizarContenido } = useContenido()
  const { categorias: categoriasDB, agregarCategoria, eliminarCategoria } = useCategorias()
  const { cerrarSesion } = useAutenticacion()
  const { perfiles, cargando: perfilesCargando, cambiarEstado, eliminarPerfil } = usePerfiles()

  const [pestaña, setPestaña] = useState<'licores' | 'contenido' | 'categorias' | 'ventas' | 'accesos'>('licores')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalVentaAbierto, setModalVentaAbierto] = useState(false)
  const [licorEnEdicion, setLicorEnEdicion] = useState<Licor | null>(null)
  const [ventaEnEdicion, setVentaEnEdicion] = useState<Venta | null>(null)
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null)
  const [nuevaCatNombre, setNuevaCatNombre] = useState('')
  const [formVenta, setFormVenta] = useState({
    cliente_nombre: '',
    cliente_telefono: '',
    id_licor: '',
    precio_venta: 0,
    fecha_venta: new Date().toISOString().split('T')[0]
  })

  const fechaHoy = new Date().toISOString().split('T')[0]

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

  const abrirModalVenta = (venta?: Venta) => {
    if (venta) {
      setVentaEnEdicion(venta)
      setFormVenta({
        cliente_nombre: venta.cliente_nombre,
        cliente_telefono: venta.cliente_telefono || '',
        id_licor: venta.id_licor,
        precio_venta: venta.precio_venta,
        fecha_venta: venta.fecha_venta
      })
    } else {
      setVentaEnEdicion(null)
      setFormVenta({
        cliente_nombre: '',
        cliente_telefono: '',
        id_licor: '',
        precio_venta: 0,
        fecha_venta: fechaHoy
      })
    }
    setModalVentaAbierto(true)
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

      await refrescarLicores()
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
        await refrescarLicores()
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

  const gananciaTotal = ventas.reduce((acc, v) => acc + (v.precio_venta - (v.Info_Licores?.precio_compra || 0)), 0)

  const exportarAExcel = () => {
    const datosExportar: any[] = ventas.map(v => {
      const precioCompra = v.Info_Licores?.precio_compra || 0;
      const ganancia = v.precio_venta - precioCompra;
      return {
        Cliente: v.cliente_nombre,
        Teléfono: v.cliente_telefono,
        Producto: v.Info_Licores?.nombre_licor || 'N/A',
        'Precio Compra': precioCompra,
        'Precio Venta': v.precio_venta,
        'Ganancia': ganancia,
        Fecha: v.fecha_venta
      }
    })

    datosExportar.push({
      Cliente: 'TOTAL GANANCIA',
      Teléfono: '',
      Producto: '',
      'Precio Compra': '',
      'Precio Venta': '',
      'Ganancia': gananciaTotal,
      Fecha: ''
    })

    const ws = XLSX.utils.json_to_sheet(datosExportar)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Ventas")
    XLSX.writeFile(wb, "Historico_Ventas_Naranjos.xlsx")
    Swal.fire('¡Éxito!', 'Archivo Excel generado correctamente', 'success')
  }

  const handleGuardarVenta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formVenta.id_licor || !formVenta.cliente_nombre) {
      return Swal.fire('Error', 'Completa los campos obligatorios', 'error')
    }

    let res;
    if (ventaEnEdicion) {
      res = await actualizarVenta(ventaEnEdicion.id, formVenta)
    } else {
      res = await agregarVenta(formVenta)
    }

    if (res.success) {
      setModalVentaAbierto(false)
      setFormVenta({
        cliente_nombre: '',
        cliente_telefono: '',
        id_licor: '',
        precio_venta: 0,
        fecha_venta: fechaHoy
      })
      Swal.fire('¡Éxito!', ventaEnEdicion ? 'Venta actualizada' : 'Venta registrada', 'success')
    } else {
      Swal.fire('Error', res.error, 'error')
    }
  }

  const handleEliminarVenta = async (id: string) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar registro de venta?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c5a059',
      confirmButtonText: 'Sí, eliminar'
    })

    if (isConfirmed) {
      const res = await eliminarVenta(id)
      if (res.success) {
        Swal.fire('Eliminado', '', 'success')
      } else {
        Swal.fire('Error', res.error, 'error')
      }
    }
  }

  const handleClickAprobar = async (id: string, email: string) => {
    const res = await cambiarEstado(id, 'aprobado')
    if (res.success) Swal.fire('Aprobado', `El usuario ${email} ahora tiene acceso al panel.`, 'success')
  }

  const handleClickRechazar = async (id: string, email: string) => {
    const res = await cambiarEstado(id, 'rechazado')
    if (res.success) Swal.fire('Rechazado', `Se ha denegado el acceso al usuario ${email}.`, 'success')
  }

  const handleClickEliminarPerfil = async (id: string, email: string) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar registro?',
      text: `¿Deseas borrar a ${email} del historial? Esto no borra su cuenta principal, solo elimina este registro de acceso.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#ef4444'
    })
    if (isConfirmed) {
      await eliminarPerfil(id)
      Swal.fire('Eliminado', '', 'success')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-negro-premium text-white p-3 md:p-8"
    >
      <header className="flex flex-col gap-4 mb-8 vidrio p-4 rounded-2xl border border-white/10">
        {/* Fila superior: Logo + Cerrar Sesión */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} width={60} height={60} alt="Logo Naranjo's Liquors" className="md:w-[80px] md:h-[80px]" />
            <div>
              <h1 className="text-lg md:text-2xl font-bold gradiente-dorado">Administración</h1>
              <p className="text-white/40 text-xs md:text-sm">Naranjo's Liquors Control Panel</p>
            </div>
          </div>
          <button onClick={cerrarSesion} className="flex items-center gap-2 text-white/50 hover:text-red-400 transition-colors bg-white/5 hover:bg-red-500/10 px-3 py-2 rounded-xl border border-white/10 hover:border-red-500/20 text-sm font-medium">
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Fila inferior: Pestañas de Navegación */}
        <div className="flex bg-white/5 p-1 rounded-xl overflow-x-auto gap-1">
          <button
            onClick={() => setPestaña('licores')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all shrink-0 text-sm font-medium ${pestaña === 'licores' ? 'bg-dorado text-negro-premium font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <Package size={16} /> Licores
          </button>
          <button
            onClick={() => setPestaña('categorias')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all shrink-0 text-sm font-medium ${pestaña === 'categorias' ? 'bg-dorado text-negro-premium font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <Tag size={16} /> Categorías
          </button>
          <button
            onClick={() => setPestaña('contenido')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all shrink-0 text-sm font-medium ${pestaña === 'contenido' ? 'bg-dorado text-negro-premium font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <Layout size={16} /> Landing
          </button>
          <button
            onClick={() => setPestaña('ventas')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all shrink-0 text-sm font-medium ${pestaña === 'ventas' ? 'bg-dorado text-negro-premium font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <History size={16} /> Histórico
          </button>
          <button
            onClick={() => setPestaña('accesos')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all shrink-0 text-sm font-medium ${pestaña === 'accesos' ? 'bg-dorado text-negro-premium font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <Users size={16} /> Accesos
          </button>
        </div>
      </header>

      {/* Alertas Globales de Inventario */}
      {licores.filter(l => l.stock === 0).length > 0 && (
        <div className="mb-8 space-y-3">
          {licores.filter(l => l.stock === 0).map(licor => (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              key={`alert-${licor.id}`}
              className="bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle size={24} className="shrink-0" />
                <p className="text-sm">
                  Alerta: El licor <strong className="font-bold text-white">{licor.nombre_licor}</strong> está <strong className="text-red-400">agotado (Stock 0)</strong> y ya no se puede despachar a los clientes. Reabastécelo o elimínalo.
                </p>
              </div>
              <div className="flex gap-2 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => {
                    setPestaña('licores');
                    abrirModal(licor);
                  }}
                  className="flex-1 md:flex-none text-xs bg-dorado/10 text-dorado hover:bg-dorado/20 px-4 py-2 rounded-lg transition-colors font-bold flex items-center justify-center gap-2 border border-dorado/20"
                >
                  <Edit size={14} /> Editar
                </button>
                <button
                  onClick={() => eliminarLicor(licor.id)}
                  className="flex-1 md:flex-none text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors font-bold flex items-center justify-center gap-2 border border-red-500/20"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {pestaña === 'licores' ? (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-end">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40 ml-1">Buscar nombre</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} placeholder="Ej: Ron..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-dorado focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40 ml-1">Fecha Compra</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input
                    type="date"
                    value={filtroFecha}
                    max={fechaHoy}
                    onChange={(e) => {
                      const val = e.target.value
                      if (!val || val <= fechaHoy) setFiltroFecha(val)
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm focus:border-dorado focus:outline-none"
                  />
                  {filtroFecha && (
                    <button
                      type="button"
                      onClick={() => setFiltroFecha('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 transition-colors"
                      title="Quitar filtro de fecha"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40 ml-1">Categoría</label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-dorado focus:outline-none appearance-none">
                    {opcionesCategorias.map(cat => <option key={cat} value={cat} className="bg-negro-premium">{cat}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <button onClick={() => abrirModal()} className="w-full lg:w-auto bg-dorado hover:bg-dorado-brillante text-negro-premium px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 whitespace-nowrap">
              <Plus size={20} /> Nuevo Licor
            </button>
          </div>

          <div className="vidrio rounded-2xl overflow-x-auto border border-white/10">
            <table className="w-full text-left text-sm min-w-[800px]">
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
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={`sk-${i}`} className="animate-pulse border-b border-white/5 last:border-0">
                      <td className="px-6 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5" />
                        <div className="space-y-2"><div className="h-4 w-32 bg-white/5 rounded" /><div className="h-3 w-16 bg-white/5 rounded" /></div>
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
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="vidrio p-4 md:p-8 rounded-3xl border border-white/10">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Plus className="text-dorado" /> Agregar Nueva Categoría
            </h2>
            <form onSubmit={handleAgregarCategoria} className="flex flex-col sm:flex-row gap-3">
              <input
                value={nuevaCatNombre}
                onChange={(e) => setNuevaCatNombre(e.target.value)}
                placeholder="Nombre de la categoría"
                className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-dorado focus:outline-none"
              />
              <button className="bg-dorado hover:bg-dorado-brillante text-negro-premium px-6 py-3 rounded-xl font-bold transition-all shrink-0 w-full sm:w-auto">
                Agregar
              </button>
            </form>
          </div>
          <div className="vidrio p-4 md:p-8 rounded-3xl border border-white/10">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Tag className="text-dorado" /> Categorías Existentes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categoriasDB.map(cat => (
                <div key={cat.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-dorado/30 transition-all">
                  <span className="font-medium">{cat.nombre}</span>
                  <button onClick={() => handleEliminarCategoria(cat.id, cat.nombre)} className="text-white/20 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : pestaña === 'contenido' ? (
        <div className="max-w-2xl mx-auto vidrio p-4 md:p-8 rounded-3xl border border-white/10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Layout className="text-dorado" /> Ajustes de la Landing Page
          </h2>
          <form onSubmit={handleContenido(guardarAjustesLanding)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm text-white/40">Título Principal</label>
              <input {...regContenido('titulo_principal')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-dorado focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/40">Descripción de Marca</label>
              <textarea {...regContenido('descripcion_marca')} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-dorado focus:outline-none resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/40">Mensaje de Bienvenida</label>
              <textarea {...regContenido('mensaje_bienvenida')} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-dorado focus:outline-none resize-none" />
            </div>
            <button disabled={subiendoContenido} className="w-full bg-dorado hover:bg-dorado-brillante text-negro-premium font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all text-base">
              <Save size={20} /> {subiendoContenido ? 'Guardando...' : 'Guardar Ajustes'}
            </button>
          </form>
        </div>
      ) : pestaña === 'ventas' ? (/*parte de historico de ventas*/
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <History className="text-dorado" /> Histórico de Ventas
              </h2>
              <div className="bg-green-500/10 border border-green-500/20 px-4 py-1.5 rounded-xl flex items-center gap-2 self-start md:self-auto">
                <span className="text-white/60 text-sm">Ganancia Total:</span>
                <span className="text-green-400 font-bold">${gananciaTotal.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <button onClick={exportarAExcel} className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/10">
                <FileDown size={20} /> Exportar Excel
              </button>
              <button onClick={() => abrirModalVenta()} className="flex-1 md:flex-none bg-dorado hover:bg-dorado-brillante text-negro-premium px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                <Plus size={20} /> Registrar Venta
              </button>
            </div>
          </div>

          <div className="vidrio rounded-2xl overflow-x-auto border border-white/10">
            <table className="w-full text-left text-sm min-w-[1000px]">
              <thead className="bg-white/5 text-dorado uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Licor</th>
                  <th className="px-6 py-4 text-center">Precio Compra</th>
                  <th className="px-6 py-4 text-center">Precio Venta (Real)</th>
                  <th className="px-6 py-4 text-center">Ganancia</th>
                  <th className="px-6 py-4 text-center">Fecha de venta</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventasCargando ? (
                  [1, 2, 3].map((i) => (
                    <tr key={`skv-${i}`} className="animate-pulse border-b border-white/5 last:border-0">
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-white/5 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-white/5 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-40 bg-white/5 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 mx-auto rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 mx-auto rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 mx-auto rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-white/5 mx-auto rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-10 bg-white/5 ml-auto rounded" /></td>
                    </tr>
                  ))
                ) : (
                  ventas.map((venta, index) => {
                    const precioCompra = venta.Info_Licores?.precio_compra || 0;
                    const ganancia = venta.precio_venta - precioCompra;

                    return (
                      <motion.tr
                        key={venta.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-white/2 transition-colors border-b border-white/5 last:border-0"
                      >
                        <td className="px-6 py-4 font-bold">{venta.cliente_nombre}</td>
                        <td className="px-6 py-4">
                          {venta.cliente_telefono ? (
                            <a
                              href={`https://wa.me/${venta.cliente_telefono.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-400 hover:underline transition-colors"
                              title="Abrir chat en WhatsApp"
                            >
                              {venta.cliente_telefono}
                            </a>
                          ) : (
                            <span className="text-white/60">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">{venta.Info_Licores?.nombre_licor || 'Producto Eliminado'}</td>
                        <td className="px-6 py-4 text-center font-bold text-dorado">${precioCompra.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center font-bold text-dorado">${venta.precio_venta.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center font-bold text-green-400">${ganancia.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center text-white/40">{venta.fecha_venta}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => abrirModalVenta(venta)} className="p-2 text-white/100 hover:text-dorado transition-colors">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleEliminarVenta(venta.id)} className="p-2 text-white/100 hover:text-red-400 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {pestaña === 'accesos' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="text-dorado" /> Gestión de Accesos
            </h2>
          </div>
          <div className="vidrio p-6 rounded-2xl border border-white/10 overflow-hidden">
            {perfilesCargando ? (
              <p className="text-center text-white/40 border border-dashed border-white/10 py-8 rounded-xl">Cargando perfiles...</p>
            ) : perfiles.length === 0 ? (
              <p className="text-center text-white/40 border border-dashed border-white/10 py-8 rounded-xl">No hay cuentas administrativas registradas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 text-sm">
                      <th className="py-3 px-4 font-normal">Correo Electrónico</th>
                      <th className="py-3 px-4 font-normal">Estado actual</th>
                      <th className="py-3 px-4 font-normal">Fecha de Solicitud</th>
                      <th className="py-3 px-4 text-right font-normal">Acciones Administrativas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perfiles.map(p => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="py-3 px-4 font-medium text-white">{p.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.estado === 'aprobado' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : p.estado === 'rechazado' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                            {p.estado}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white/60">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right flex justify-end gap-2">
                          {p.estado !== 'aprobado' && (
                            <button onClick={() => handleClickAprobar(p.id, p.email)} className="bg-green-500/10 hover:bg-green-500/20 text-green-400 p-2 rounded-lg transition-colors border border-green-500/20" title="Aprobar Acceso">
                              <Check size={16} />
                            </button>
                          )}
                          {p.estado !== 'rechazado' && (
                            <button onClick={() => handleClickRechazar(p.id, p.email)} className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 p-2 rounded-lg transition-colors border border-orange-500/20" title="Rechazar y Revocar Acceso">
                              <X size={16} />
                            </button>
                          )}
                          <button onClick={() => handleClickEliminarPerfil(p.id, p.email)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-lg transition-colors border border-red-500/20" title="Eliminar registro del historial">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Licor */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 bg-black/90 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-2xl w-full bg-negro-premium border border-dorado/20 rounded-3xl p-5 md:p-8 shadow-2xl mb-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold gradiente-dorado">{licorEnEdicion ? 'Editar Licor' : 'Nuevo Licor'}</h2>
              <button onClick={() => setModalAbierto(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <X className="text-white/60 hover:text-white" />
              </button>
            </div>
            <form onSubmit={handleSubmit(guardarLicor)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="col-span-1 sm:col-span-2 space-y-1">
                <label className="text-white/40">Nombre del Licor</label>
                <input {...register('nombre_licor')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-dorado focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-white/40">Precio Compra</label>
                <input type="number" {...register('precio_compra', { valueAsNumber: true })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-dorado focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-white/40">Precio Venta</label>
                <input type="number" {...register('precio_venta', { valueAsNumber: true })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-dorado focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-white/40">Fecha Compra</label>
                <input
                  type="date"
                  {...register('fecha_compra')}
                  max={fechaHoy}
                  onChange={(e) => {
                    const val = e.target.value
                    if (!val || val <= fechaHoy) {
                      e.target.value = val
                    } else {
                      e.target.value = fechaHoy
                    }
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-dorado focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-white/40">Stock</label>
                <input type="number" {...register('stock', { valueAsNumber: true })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-dorado focus:outline-none" />
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-1">
                <label className="text-white/40">Categoría</label>
                <select {...register('categoria')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-dorado focus:outline-none appearance-none">
                  <option value="" disabled className="bg-negro-premium">Selecciona una categoría</option>
                  {categoriasDB.map(cat => (
                    <option key={cat.id} value={cat.nombre} className="bg-negro-premium">{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-1">
                <label className="text-white/40">Descripción breve</label>
                <textarea {...register('descripcion')} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-dorado focus:outline-none resize-none" />
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-1">
                <label className="text-white/40">Historia Completa</label>
                <textarea {...register('historia')} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-dorado focus:outline-none resize-none" />
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-2">
                <label className="text-white/40">Imagen</label>
                <div className="flex gap-4 items-center">
                  {(licorEnEdicion?.imagen_url || archivoImagen) && (
                    <img src={archivoImagen ? URL.createObjectURL(archivoImagen) : licorEnEdicion?.imagen_url} className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0" />
                  )}
                  <label className="flex-grow border-2 border-dashed border-white/10 hover:border-dorado/50 p-4 rounded-xl flex flex-col items-center cursor-pointer transition-all">
                    <ImageIcon size={20} className="text-white/40" />
                    <span className="text-[10px] text-white/40 mt-1">Sube la etiqueta o botella</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setArchivoImagen(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
              <button disabled={isSubmitting} className="col-span-1 sm:col-span-2 bg-dorado hover:bg-dorado-brillante text-negro-premium font-bold py-4 rounded-xl mt-2 flex items-center justify-center gap-2 text-base">
                <Save size={18} /> {isSubmitting ? 'Guardando...' : 'Confirmar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nueva Venta */}
      {modalVentaAbierto && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 bg-black/90 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-md w-full bg-negro-premium border border-dorado/20 rounded-3xl p-5 md:p-8 shadow-2xl mb-6 relative">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold gradiente-dorado">{ventaEnEdicion ? 'Editar Venta' : 'Registrar Venta'}</h2>
              <button onClick={() => setModalVentaAbierto(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <X size={22} className="text-white/60" />
              </button>
            </div>
            <form onSubmit={handleGuardarVenta} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-white/40 flex items-center gap-2"><User size={14} /> Nombre del Cliente</label>
                <input required value={formVenta.cliente_nombre} onChange={e => setFormVenta({ ...formVenta, cliente_nombre: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-dorado focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-white/40 flex items-center gap-2"><Phone size={14} /> Teléfono</label>
                <input value={formVenta.cliente_telefono} onChange={e => setFormVenta({ ...formVenta, cliente_telefono: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-dorado focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-white/40 flex items-center gap-2"><Package size={14} /> Producto</label>
                <select required value={formVenta.id_licor} onChange={e => {
                  const licor = licores.find(l => l.id === e.target.value)
                  setFormVenta({ ...formVenta, id_licor: e.target.value, precio_venta: licor?.precio_venta || 0 })
                }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-dorado focus:outline-none appearance-none">
                  <option value="" disabled className="bg-negro-premium">Selecciona un licor</option>
                  {licores.map(l => <option key={l.id} value={l.id} className="bg-negro-premium">{l.nombre_licor} (${l.precio_venta.toLocaleString()})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-white/40 flex items-center gap-2"><DollarSign size={14} /> Precio Real</label>
                <input type="number" required value={formVenta.precio_venta} onChange={e => setFormVenta({ ...formVenta, precio_venta: Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-dorado focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-white/40 flex items-center gap-2"><Calendar size={14} /> Fecha</label>
                <input
                  type="date"
                  required
                  max={fechaHoy}
                  value={formVenta.fecha_venta}
                  onChange={e => {
                    const val = e.target.value
                    if (!val || val <= fechaHoy) setFormVenta({ ...formVenta, fecha_venta: val })
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-dorado focus:outline-none"
                />
              </div>
              <button className="w-full bg-dorado hover:bg-dorado-brillante text-negro-premium font-bold py-4 rounded-xl mt-4 text-base">
                {ventaEnEdicion ? 'Actualizar Venta' : 'Registrar Venta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default Admin
