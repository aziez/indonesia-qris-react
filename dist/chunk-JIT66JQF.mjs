// src/image/reader.ts
import jsQR from "jsqr";
async function readQrisFromImage(file) {
  if (typeof window === "undefined") {
    throw new Error("readQrisFromImage can only be used in a browser environment. For Node.js, use a server-side image processing library.");
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        context.drawImage(img, 0, 0, img.width, img.height);
        const imageData = context.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert"
        });
        if (code) {
          resolve(code.data);
        } else {
          resolve(null);
        }
      };
      img.onerror = () => {
        reject(new Error("Failed to load image for QR decoding"));
      };
      if (typeof event.target?.result === "string") {
        img.src = event.target.result;
      } else {
        reject(new Error("FileReader result is not a string"));
      }
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}

export {
  readQrisFromImage
};
//# sourceMappingURL=chunk-JIT66JQF.mjs.map