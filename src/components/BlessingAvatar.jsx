import { useState, useEffect } from 'react'
import { formatBlessingImage } from '../utils/formatUtils'

/**
 * BlessingAvatar Component
 * Handles image fallback logic for blessings.
 * 1. Tries the image provided in the database (bl_image).
 * 2. If it fails or is empty, tries the local model path (/blessingscardmodels/NAME.png).
 * 3. If that also fails, uses a generic placeholder.
 */
function BlessingAvatar({ blessing, className, style = {} }) {
  const [imgUrl, setImgUrl] = useState(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!blessing) return
    
    // Reset state for new blessing
    setHasError(false)

    // 1. Initial attempt: from DB. 
    const dbImage = blessing.bl_image;
    
    if (dbImage && dbImage !== 'none' && dbImage !== 'undefined') {
      setImgUrl(dbImage);
    } else {
      // Jump to local fallback immediately if DB is empty/invalid
      const fallbackName = formatBlessingImage(blessing.bl_name);
      setImgUrl(`/blessingscardmodels/${fallbackName}`);
      setHasError(true);
    }
  }, [blessing])

  const handleError = () => {
    if (!hasError) {
      // First error? Try local fallback based on name
      const fallbackName = formatBlessingImage(blessing.bl_name);
      console.warn(`Failed to load DB image for ${blessing.bl_name}, trying local fallback: ${fallbackName}`);
      setImgUrl(`/blessingscardmodels/${fallbackName}`);
      setHasError(true);
    } else {
      // Second error? Use generic placeholder
      console.error(`Failed to load local fallback for ${blessing.bl_name}. Using placeholder.`);
      setImgUrl("https://cdn-icons-png.flaticon.com/512/3204/3204000.png");
    }
  }

  // Common styles for the avatar
  const baseStyle = {
    backgroundImage: imgUrl ? `url("${encodeURI(imgUrl)}")` : 'none',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    ...style
  };

  return (
    <div className={className} style={baseStyle}>
      {imgUrl && (
        <img 
          src={imgUrl} 
          alt={blessing.bl_name} 
          style={{ display: 'none' }} 
          onError={handleError} 
        />
      )}
    </div>
  )
}

export default BlessingAvatar;
