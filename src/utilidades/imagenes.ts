/**
 * Utilidad para procesar imágenes antes de subirlas a la nube.
 */

// Configuración de calidad
const CALIDAD_ALTA = 0.9;
const CALIDAD_MINI = 0.7;

export const optimizarImagen = async (archivo: File, maxDim: number = 1200, calidad: number = CALIDAD_ALTA): Promise<Blob> => {
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

        // Convertir a WebP
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Error al convertir imagen a Blob'));
          },
          'image/webp',
          calidad
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Genera una miniatura rápida para el catálogo.
 */
export const generarMiniatura = (archivo: File) => optimizarImagen(archivo, 500, CALIDAD_MINI);
