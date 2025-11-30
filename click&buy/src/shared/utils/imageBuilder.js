// src/shared/utils/imageBuilder.js - SIMPLIFICADO
const FALLBACK_IMAGE = '../../assets/images/no-imagen.png';

/**
 * ✅ SIMPLIFICADO: Solo retorna la URL tal como viene
 * La BD ya guarda URLs completas y correctas
 */
export function buildImageUrl(imageUrl) {
  if (!imageUrl) {
    return FALLBACK_IMAGE;
  }
  
  // Retornar URL tal como viene de la BD
  return imageUrl;
}

/**
 * Configura el fallback de imagen en caso de error
 */
export function setupImageFallback(imgElement) {
  if (!imgElement) return;
  
  imgElement.addEventListener('error', function() {
    if (this.src !== FALLBACK_IMAGE) {
      this.src = FALLBACK_IMAGE;
    }
  });
}

/**
 * Precarga una imagen
 */
export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}