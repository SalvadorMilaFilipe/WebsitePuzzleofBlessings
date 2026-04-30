/**
 * Shared utility functions for formatting and consistent naming across the site.
 */

export const formatBlessingImage = (imageName) => {
    if (!imageName || imageName === 'null' || imageName === 'undefined') return 'none';
    
    // 1. Standardize underscores and trim
    let formatted = String(imageName).replace(/_/g, ' ').trim();
    
    // 2. Fix specific case-sensitivity issues for Linux (Vercel)
    // Map of common lowercase/typo names to exact filenames on disk
    const corrections = {
        'object levitation': 'Object Levitation.png',
        'pattern lens': 'Pattern Lens.png',
        'sequential jump': 'Sequential Jump.png',
        'magnetic mold': 'Magnetic Mold.png',
        'double jump': 'Sequential Jump.png',
        'duplication': 'Duplication.png',
        'spirit vision': 'Spirit Vision.png',
        'ephemeral point': 'Ephemeral Point.png',
        'admin noclip': 'Admin_NoClip.png'
    };

    const lowerName = formatted.toLowerCase();
    
    // Check if the current name (without extension) matches a correction key
    for (const key in corrections) {
        if (lowerName.includes(key)) {
            formatted = corrections[key];
            break;
        }
    }

    // 3. If it doesn't have an extension yet, assume .png
    if (!formatted.includes('.')) {
        formatted += '.png';
    }

    return formatted;
};

/**
 * Specifically for blessings located in /blessingcardmodels/
 */
export const getAdminBlessingUrl = (imageName) => {
    const fileName = formatBlessingImage(imageName);
    if (fileName === 'none') return 'none';
    return `url("${encodeURI(`/blessingcardmodels/${fileName}`)}")`;
};

export const getBlessingUrl = (imageName) => {
    const fileName = formatBlessingImage(imageName);
    if (fileName === 'none') return 'none';
    return `url("${encodeURI(`/blessingcardmodels/${fileName}`)}")`;
};
