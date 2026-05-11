import { useState, useEffect } from 'react'

/**
 * CategoryAvatar Component
 * Fetches category images from the local /categories/ folder.
 */
function CategoryAvatar({ categoryName, className, style = {} }) {
  const [imgUrl, setImgUrl] = useState(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!categoryName) return
    
    let fileName = `${categoryName}.png`;
    const lowerName = categoryName.toLowerCase();

    // Mapping logic for category names to filenames
    if (lowerName.includes('scanning') || lowerName.includes('informação')) {
      fileName = 'InfoScanning.png';
    } else if (lowerName.includes('física') || lowerName.includes('physical')) {
      fileName = 'PhysicalManipulation.png';
    } else if (lowerName.includes('matéria') || lowerName.includes('matter')) {
      fileName = 'MatterCreation.png';
    } else if (lowerName.includes('ajuda') || lowerName.includes('help')) {
      fileName = 'HelpPassives.png';
    } else if (lowerName.includes('admin') || lowerName.includes('noclip')) {
      fileName = 'NoClip.png';
    }

    // Try multiple path patterns to ensure we find the local image
    const paths = [
      `/categories/${fileName}`,
      `./categories/${fileName}`,
      `/public/categories/${fileName}`
    ];

    setImgUrl(paths[Math.min(retry, paths.length - 1)]);
  }, [categoryName, retry])

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

export default CategoryAvatar;
