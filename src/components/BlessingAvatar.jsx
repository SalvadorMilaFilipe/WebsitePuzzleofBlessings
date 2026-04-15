import { useState, useEffect } from 'react'
import { formatBlessingImage } from '../utils/formatUtils'

/**
 * BlessingAvatar Component
 * Strictly fetches blessing images from the local /blessingscardmodels/ folder.
 * Enhanced to handle potential path/encoding issues specifically for 'Object Levitation'.
 */
function BlessingAvatar({ blessing, className, style = {} }) {
  const [imgUrl, setImgUrl] = useState(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!blessing) return
    
    let fileName = formatBlessingImage(blessing.bl_name);
    
    // Manual override to ensure 'Object Levitation' is exactly right
    if (blessing.bl_name.toLowerCase().includes('object levitation')) {
      fileName = 'Object Levitation.png';
    }

    // Try multiple path patterns if the first one fails via the onError mechanism
    const paths = [
      `/blessingscardmodels/${fileName}`,
      `./blessingscardmodels/${fileName}`,
      `blessingscardmodels/${fileName}`,
      `/public/blessingscardmodels/${fileName}` // Some dev setups need this
    ];

    setImgUrl(paths[Math.min(retry, paths.length - 1)]);
  }, [blessing, retry])

  const handleError = () => {
    if (retry < 3) {
      setRetry(prev => prev + 1);
    }
  }

  // Use the image URL. We encode it but handle spaces specifically for CSS.
  // CSS url() can be tricky with spaces even when quoted.
  const encodedUrl = imgUrl ? imgUrl.split(' ').map(part => encodeURIComponent(part)).join('%20') : null;

  return (
    <div 
      className={className} 
      style={{
        backgroundImage: imgUrl ? `url("${imgUrl}")` : 'none', // Browsers are often better at auto-encoding in JS style
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        ...style
      }}
    >
      {/* Hidden image to trigger the retry logic if the path fails */}
      {imgUrl && (
        <img 
          src={imgUrl} 
          alt="" 
          style={{ display: 'none' }} 
          onError={handleError} 
        />
      )}
    </div>
  )
}

export default BlessingAvatar;
