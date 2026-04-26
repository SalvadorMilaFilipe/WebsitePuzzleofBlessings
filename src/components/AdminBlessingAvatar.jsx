import { useState, useEffect } from 'react'
import { formatBlessingImage } from '../utils/formatUtils'

/**
 * AdminBlessingAvatar Component
 * Specifically fetches admin blessing images from the local /blessingcardmodels/ (singular) folder.
 */
function AdminBlessingAvatar({ blessing, className, style = {} }) {
  const [imgUrl, setImgUrl] = useState(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!blessing) return

    const fileName = formatBlessingImage(blessing.bl_name || blessing.name);

    // Try multiple path patterns if the first one fails via the onError mechanism
    // Focusing only on the NEW singular folder for admins
    const paths = [
      `/blessingcardmodels/${fileName}`,
      `./blessingcardmodels/${fileName}`,
      `blessingcardmodels/${fileName}`
    ];

    setImgUrl(paths[Math.min(retry, paths.length - 1)]);
  }, [blessing, retry])

  const handleError = () => {
    if (retry < 2) {
      setRetry(prev => prev + 1);
    }
  }

  return (
    <div
      className={className}
      style={{
        backgroundImage: imgUrl ? `url("${imgUrl}")` : 'none',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        ...style
      }}
    >
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

export default AdminBlessingAvatar;
