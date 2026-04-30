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

    // Manual overrides for specific blessing names
    const lowerName = blessing.bl_name.toLowerCase();

    if (lowerName.includes('object levitation')) {
      fileName = 'Object Levitation.png';
    } else if (lowerName.includes('spirit vision')) {
      fileName = 'Spirit Vision.png';
    } else if (lowerName.includes('sequential jump')) {
      fileName = 'Sequential Jump.png';
    } else if (lowerName.includes('duplication')) {
      fileName = 'Duplication.png';
    } else if (lowerName.includes('ephemeral point')) {
      fileName = 'Ephemeral Point.png';
    } else if (lowerName.includes('pattern lens')) {
      fileName = 'Pattern Lens.png';
    }

    // Try multiple path patterns if the first one fails via the onError mechanism
    const paths = [
      `/blessingcardmodels/${fileName}`,
      `./blessingcardmodels/${fileName}`,
      `blessingcardmodels/${fileName}`,
      `/public/blessingcardmodels/${fileName}` // Some dev setups need this
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
