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
    
    let fileName = `${collectibleName}.png`;

    if (collectibleName.toLowerCase() === 'vhs tape') {
      fileName = 'VHS Tape.png';
    } else if (collectibleName.toLowerCase() === 'dream pillows' || collectibleName.toLowerCase() === 'dreams pillow') {
      fileName = 'Dreams Pillow.png';
    } else if (collectibleName.toLowerCase() === 'climbing trophy') {
      fileName = 'Climbing Trophy.png';
    }

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
        backgroundSize: '85%',
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
