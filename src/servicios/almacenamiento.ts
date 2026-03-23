import { supabase } from './supabase'
import { generarMiniatura } from '../utilidades/imagenes'

/**
 * Sube una imagen en dos versiones:
 * 1. Original: El archivo tal cual, sin comprimir ni redimensionar.
 * 2. Miniatura: Una versión optimizada en WebP para la vitrina/catálogo.
 */
export const subirImagenLicor = async (archivo: File) => {
  const nombreBase = archivo.name.split('.').slice(0, -1).join('.')
  const extension = archivo.name.split('.').pop()
  const timestamp = Date.now()
  
  // 1. Subir ARCHIVO ORIGINAL (Máxima calidad, sin cambios)
  const nombreOriginal = `${timestamp}-${nombreBase}-full.${extension}`
  const { data: dataOrig, error: errOrig } = await supabase.storage
    .from('licores')
    .upload(nombreOriginal, archivo)

  if (errOrig) throw errOrig

  // 2. Subir MINIATURA OPTIMIZADA (Para rapidez en la lista)
  const blobMini = await generarMiniatura(archivo)
  const nombreMini = `${timestamp}-${nombreBase}-thumb.webp`
  const { data: dataMini, error: errMini } = await supabase.storage
    .from('licores')
    .upload(nombreMini, blobMini, {
      contentType: 'image/webp'
    })

  if (errMini) throw errMini

  // Obtener las URLs de ambos
  const urlOriginal = supabase.storage.from('licores').getPublicUrl(dataOrig.path).data.publicUrl
  const urlMiniatura = supabase.storage.from('licores').getPublicUrl(dataMini.path).data.publicUrl

  return { urlOriginal, urlMiniatura }
}
