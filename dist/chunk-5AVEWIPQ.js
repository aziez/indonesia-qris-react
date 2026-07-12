"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/image/reader.ts
var _jsqr = require('jsqr'); var _jsqr2 = _interopRequireDefault(_jsqr);
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
        const code = _jsqr2.default.call(void 0, imageData.data, imageData.width, imageData.height, {
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
      if (typeof _optionalChain([event, 'access', _ => _.target, 'optionalAccess', _2 => _2.result]) === "string") {
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



exports.readQrisFromImage = readQrisFromImage;
//# sourceMappingURL=chunk-5AVEWIPQ.js.map