import { z } from 'zod'

export const esquemaAcceso = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
})

export const esquemaLicor = z.object({
  nombre_licor: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  historia: z.string().optional(),
  precio_venta: z.number().min(0, 'El precio debe ser positivo'),
  precio_compra: z.number().min(0, 'El precio debe ser positivo'),
  fecha_compra: z.string().min(1, 'La fecha es requerida'),
  categoria: z.string().min(1, 'La categoría es requerida'),
  stock: z.number().min(0)
})

export const esquemaContenido = z.object({
  titulo_principal: z.string().min(1, 'El título es requerido'),
  descripcion_marca: z.string().min(1, 'La descripción es requerida'),
  mensaje_bienvenida: z.string().min(1, 'El mensaje es requerido'),
})

export type DatosAcceso = z.infer<typeof esquemaAcceso>
export type DatosLicor = z.infer<typeof esquemaLicor>
export type DatosContenido = z.infer<typeof esquemaContenido>
