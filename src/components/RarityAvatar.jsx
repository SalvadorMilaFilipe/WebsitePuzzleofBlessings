import { useState, useEffect } from 'react'

/**
 * RarityAvatar Component
 * Fetches rarity images from the local /rarityimg/ folder.
 */
function RarityAvatar({ rarityName, className, style = {} }) {
  const [imgUrl, setImgUrl] = useState(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!rarityName) return
    
    let fileName = `${rarityName}.png`;
    const lowerName = rarityName.toLowerCase();

    // Manual overrides for rarity names
    if (lowerName.includes('common') && !lowerName.includes('uncommon')) {
      fileName = 'common_rar.png';
    } else if (lowerName.includes('uncommon')) {
      fileName = 'uncommon_rar.png';
    } else if (lowerName.includes('rare')) {
      fileName = 'rare_rar.png';
    } else if (lowerName.includes('epic')) {
      fileName = 'epic_rar.png';
    } else if (lowerName.includes('legendary')) {
      fileName = 'legendary_rar.png';
    }

    // Try multiple path patterns to ensure we find the local image
    const paths = [
      `/rarityimg/${fileName}`,
      `./rarityimg/${fileName}`,
      `/public/rarityimg/${fileName}`
    ];

    setImgUrl(paths[Math.min(retry, paths.length - 1)]);
  }, [rarityName, retry])

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

export default RarityAvatar;
