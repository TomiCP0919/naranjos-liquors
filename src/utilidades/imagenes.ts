/**
 * Utilidad para procesar imágenes antes de subirlas a la nube.
 */

// Configuración de calidad
const CALIDAD_ALTA = 0.9;
const CALIDAD_MINI = 0.6; // AVIF es tan eficiente que podemos bajar un poco más sin perder calidad visible

export const optimizarImagen = async (archivo: File, maxDim: number = 1200, calidad: number = CALIDAD_ALTA, formato: 'image/webp' | 'image/avif' = 'image/webp'): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(archivo);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Mantener proporción pero limitar a maxDim
        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir al formato solicitado
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error(`Error al convertir imagen a ${formato}`));
          },
          formato,
          calidad
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Genera una miniatura ultra-optimizada en formato AVIF para el catálogo.
 * AVIF es un 30% más eficiente que WebP manteniendo la misma calidad.
 */
export const generarMiniatura = (archivo: File) => optimizarImagen(archivo, 500, CALIDAD_MINI, 'image/avif');
