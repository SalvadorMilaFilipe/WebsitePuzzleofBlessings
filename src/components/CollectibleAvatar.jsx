import { useState, useEffect } from 'react'

/**
 * CollectibleAvatar Component
 * Fetches collectible images from the local /collectibles/ folder or relative paths.
 */
function CollectibleAvatar({ collectibleName, className, style = {} }) {
  const [imgUrl, setImgUrl] = useState(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!collectibleName) return
    
    const fileName = `${collectibleName}.png`;

    // Try multiple path patterns to ensure we find the local image
    const paths = [
      `/collectibles/${fileName}`,
      `./collectibles/${fileName}`,
      `/public/collectibles/${fileName}`
    ];

    setImgUrl(paths[Math.min(retry, paths.length - 1)]);
  }, [collectibleName, retry])

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

export default CollectibleAvatar;
