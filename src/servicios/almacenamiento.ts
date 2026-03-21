import { supabase } from './supabase'

export const subirImagenLicor = async (archivo: File) => {
  const nombreArchivo = `${Date.now()}-${archivo.name}`
  const { data, error } = await supabase.storage
    .from('licores')
    .upload(nombreArchivo, archivo)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('licores')
    .getPublicUrl(data.path)

  return publicUrl
}
