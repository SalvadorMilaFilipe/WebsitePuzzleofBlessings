import { useState, useEffect } from 'react'
import { formatBlessingImage } from '../utils/formatUtils'

/**
 * BlessingAvatar Component
 * Normalizes image loading by strictly fetching from the local public/blessingscardmodels/ folder.
 * This ignores the bl_image database column to ensure consistency and prevent broken external links.
 */
function BlessingAvatar({ blessing, className, style = {} }) {
  const [imgUrl, setImgUrl] = useState(null)

  useEffect(() => {
    if (!blessing) return
    
    // Normalize search to local folder only, using the blessing name
    const fileName = formatBlessingImage(blessing.bl_name);
    
    // Using absolute path from root for stability
    setImgUrl(`/blessingscardmodels/${fileName}`);
  }, [blessing])

  return (
    <div 
      className={className} 
      style={{
        backgroundImage: imgUrl ? `url("${encodeURI(imgUrl)}")` : 'none',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        ...style
      }}
    />
  )
}

export default BlessingAvatar;
