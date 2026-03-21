import { createClient } from '@supabase/supabase-js'

const urlSupabase = import.meta.env.VITE_SUPABASE_URL
const claveAnonima = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!urlSupabase || !claveAnonima) {
  throw new Error('Faltan las variables de entorno de Supabase')
}

export const supabase = createClient(urlSupabase, claveAnonima)
