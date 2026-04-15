import { useState, useEffect } from 'react'
import { formatBlessingImage } from '../utils/formatUtils'

/**
 * BlessingAvatar Component
 * Handles image fallback logic for blessings.
 * 
 * Order of operations:
 * 1. Try DB image (bl_image)
 * 2. Try Local fallback derived from bl_name
 * 3. Final fallback to placeholder
 */
function BlessingAvatar({ blessing, className, style = {} }) {
  const [imgUrl, setImgUrl] = useState(null)
  const [attempt, setAttempt] = useState(0) // 0: DB, 1: Local, 2: Placeholder

  // Helper to ensure path is correct relative to deployment root
  const getProcessedUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    
    // Standard Vite base path handling
    const base = import.meta.env.BASE_URL || '/';
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Ensure the base ends with a slash and combine
    const root = base.endsWith('/') ? base : base + '/';
    return root + cleanPath;
  };

  useEffect(() => {
    if (!blessing) return
    
    setAttempt(0)
    const dbImage = blessing.bl_image;
    
    if (dbImage && dbImage !== 'none' && dbImage !== 'undefined') {
      // If dbImage is just a filename, it'll likely fail as-is and handleError will move to attempt 1
      setImgUrl(dbImage);
    } else {
      // No DB image? Jump to local folder fallback
      const fallbackName = formatBlessingImage(blessing.bl_name);
      setImgUrl(`blessingscardmodels/${fallbackName}`);
      setAttempt(1); 
    }
  }, [blessing])

  const handleError = () => {
    const fallbackName = formatBlessingImage(blessing.bl_name);

    if (attempt === 0) {
      // DB attempt failed. Try local fallback folder.
      setImgUrl(`blessingscardmodels/${fallbackName}`);
      setAttempt(1);
    } else if (attempt === 1) {
      // Local fallback failed. Use placeholder.
      console.warn(`Blessing image not found: ${blessing.bl_name}. Tried local folder: blessingscardmodels/${fallbackName}`);
      setImgUrl("https://cdn-icons-png.flaticon.com/512/3204/3204000.png");
      setAttempt(2);
    }
  }

  const finalUrl = getProcessedUrl(imgUrl);

  return (
    <div 
      className={className} 
      style={{
        backgroundImage: finalUrl ? `url("${encodeURI(finalUrl)}")` : 'none',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        ...style
      }}
    >
      {finalUrl && (
        <img 
          src={finalUrl} 
          alt={blessing.bl_name} 
          style={{ display: 'none' }} 
          onError={handleError} 
        />
      )}
    </div>
  )
}

export default BlessingAvatar;
