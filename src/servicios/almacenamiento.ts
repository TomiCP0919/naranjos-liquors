import { supabase } from './supabase'
import { generarMiniatura } from '../utilidades/imagenes'

/**
 * Sube una imagen en dos versiones:
 * 1. Original: El archivo tal cual, sin comprimir ni redimensionar.
 * 2. Miniatura: Una versión optimizada en AVIF para la vitrina/catálogo.
 */
export const subirImagenLicor = async (archivo: File) => {
  // Generamos un ID corto y único para evitar errores de longitud de nombre (común en móviles)
  const idUnico = (typeof crypto.randomUUID !== 'undefined') 
    ? crypto.randomUUID().split('-')[0] 
    : Math.random().toString(36).substring(2, 10)
  
  const extension = archivo.name.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  
  // 1. Subir ARCHIVO ORIGINAL
  const nombreOriginal = `${timestamp}-${idUnico}-full.${extension}`
  const { data: dataOrig, error: errOrig } = await supabase.storage
    .from('licores')
    .upload(nombreOriginal, archivo)

  if (errOrig) throw errOrig

  // 2. Subir MINIATURA OPTIMIZADA (Para rapidez en la lista)
  const blobMini = await generarMiniatura(archivo)
  const nombreMini = `${timestamp}-${idUnico}-thumb.avif`
  const { data: dataMini, error: errMini } = await supabase.storage
    .from('licores')
    .upload(nombreMini, blobMini, {
      contentType: 'image/avif'
    })

  if (errMini) throw errMini

  // Obtener las URLs de ambos
  const urlOriginal = supabase.storage.from('licores').getPublicUrl(dataOrig.path).data.publicUrl
  const urlMiniatura = supabase.storage.from('licores').getPublicUrl(dataMini.path).data.publicUrl

  return { urlOriginal, urlMiniatura }
}
