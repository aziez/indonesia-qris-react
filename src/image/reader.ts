import jsQR from 'jsqr';

/**
 * Reads a QR code from a browser File or Blob object.
 * Returns the decoded string if successful, or null if no QR code is found.
 */
export async function readQrisFromImage(file: File | Blob): Promise<string | null> {
  if (typeof window === 'undefined') {
    throw new Error('readQrisFromImage can only be used in a browser environment. For Node.js, use a server-side image processing library.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create an offscreen canvas to extract image data
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        context.drawImage(img, 0, 0, img.width, img.height);
        const imageData = context.getImageData(0, 0, img.width, img.height);

        // Decode using jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code) {
          resolve(code.data);
        } else {
          resolve(null); // No QR code found
        }
      };
      img.onerror = () => {
        reject(new Error('Failed to load image for QR decoding'));
      };
      
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      } else {
        reject(new Error('FileReader result is not a string'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
