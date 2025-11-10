// src/shared/utils/imageBuilder.js

const FALLBACK_IMAGE = '../assets/no-imagen.png';

/**
 * Construye la URL de imagen de alta calidad
 */
export function buildImageUrl(baseUrl) {
  if (!baseUrl) {
    return FALLBACK_IMAGE;
  }

  try {
    // Localizar a español si viene en inglés
    const localized = baseUrl.includes('/en/') 
      ? baseUrl.replace('/en/', '/es/') 
      : baseUrl;
    
    // Retornar URL de alta calidad
    return `${localized}/high.jpg`;
  } catch (error) {
    console.warn('Error building image URL:', error);
    return FALLBACK_IMAGE;
  }
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