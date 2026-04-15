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
  const [attempt, setAttempt] = useState(0) // 0: DB, 1: Local, 2: Placeholder

  useEffect(() => {
    if (!blessing) return
    
    // Reset state for new blessing
    setAttempt(0)

    // 1. Initial attempt: from DB. 
    const dbImage = blessing.bl_image;
    
    if (dbImage && dbImage !== 'none' && dbImage !== 'undefined') {
      setImgUrl(dbImage);
    } else {
      // Jump to local fallback immediately if DB is empty/invalid
      const fallbackName = formatBlessingImage(blessing.bl_name);
      setImgUrl(`/blessingscardmodels/${fallbackName}`);
      setAttempt(1); // Mark as already on local fallback
    }
  }, [blessing])

  const handleError = () => {
    if (attempt === 0) {
      // Failed DB image -> Try local fallback
      const fallbackName = formatBlessingImage(blessing.bl_name);
      console.warn(`Failed to load DB image for ${blessing.bl_name}, trying local fallback: ${fallbackName}`);
      setImgUrl(`/blessingscardmodels/${fallbackName}`);
      setAttempt(1);
    } else if (attempt === 1) {
      // Failed local fallback -> Use generic placeholder
      console.error(`Failed to load local fallback for ${blessing.bl_name}. Using placeholder.`);
      setImgUrl("https://cdn-icons-png.flaticon.com/512/3204/3204000.png");
      setAttempt(2);
    }
  }

  // Ensure the URL is correctly encoded for CSS and HTML
  const getEncodedUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return encodeURI(url);
  };

  const finalUrl = getEncodedUrl(imgUrl);

  // Common styles for the avatar
  const baseStyle = {
    backgroundImage: finalUrl ? `url("${finalUrl}")` : 'none',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    ...style
  };

  return (
    <div className={className} style={baseStyle}>
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
