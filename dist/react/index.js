"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }


var _chunkINRLU2O7js = require('../chunk-INRLU2O7.js');


var _chunk5AVEWIPQjs = require('../chunk-5AVEWIPQ.js');

// src/react/hooks.ts
var _react = require('react'); var _react2 = _interopRequireDefault(_react);
function useQris() {
  const [staticQris, setStaticQris] = _react.useState.call(void 0, null);
  const [parsedData, setParsedData] = _react.useState.call(void 0, null);
  const [error, setError] = _react.useState.call(void 0, null);
  const [isProcessing, setIsProcessing] = _react.useState.call(void 0, false);
  const processImageFile = _react.useCallback.call(void 0, async (file) => {
    setIsProcessing(true);
    setError(null);
    try {
      const qrisString = await _chunk5AVEWIPQjs.readQrisFromImage.call(void 0, file);
      if (!qrisString) {
        throw new Error("Tidak ditemukan kode QR pada gambar.");
      }
      const parsed = _chunkINRLU2O7js.parseQRIS.call(void 0, qrisString);
      setStaticQris(qrisString);
      setParsedData(parsed);
      return { qrisString, parsed };
    } catch (err) {
      setError(err.message || "Gagal memproses gambar QRIS");
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);
  const setRawString = _react.useCallback.call(void 0, (qrisString) => {
    try {
      const parsed = _chunkINRLU2O7js.parseQRIS.call(void 0, qrisString);
      setStaticQris(qrisString);
      setParsedData(parsed);
      setError(null);
    } catch (err) {
      setError(err.message || "QRIS string tidak valid");
    }
  }, []);
  const generateDynamic = _react.useCallback.call(void 0, (options) => {
    if (!staticQris) {
      throw new Error("QRIS Statis belum dimuat. Silakan upload atau set string terlebih dahulu.");
    }
    return _chunkINRLU2O7js.staticToDynamic.call(void 0, staticQris, options);
  }, [staticQris]);
  return {
    staticQris,
    parsedData,
    error,
    isProcessing,
    processImageFile,
    setRawString,
    generateDynamic
  };
}

// src/react/components.tsx

var _jsxruntime = require('react/jsx-runtime');
function QrisUploader({
  onSuccess,
  onError,
  className = "",
  buttonText = "Upload Gambar QRIS",
  loadingText = "Memproses..."
}) {
  const [isProcessing, setIsProcessing] = _react2.default.useState(false);
  const inputRef = _react.useRef.call(void 0, null);
  const handleFileChange = async (e) => {
    const file = _optionalChain([e, 'access', _ => _.target, 'access', _2 => _2.files, 'optionalAccess', _3 => _3[0]]);
    if (!file) return;
    setIsProcessing(true);
    try {
      const { readQrisFromImage: readQrisFromImage2 } = await Promise.resolve().then(() => _interopRequireWildcard(require("../image-ZVBTAJSX.js")));
      const qrisString = await readQrisFromImage2(file);
      if (!qrisString) {
        throw new Error("Kode QR tidak terdeteksi pada gambar");
      }
      onSuccess(qrisString);
    } catch (err) {
      if (onError) onError(err);
      else console.error(err);
    } finally {
      setIsProcessing(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };
  return /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: `indonesia-qris-uploader ${className}`, children: [
    /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
      "input",
      {
        type: "file",
        accept: "image/*",
        ref: inputRef,
        onChange: handleFileChange,
        style: { display: "none" },
        id: "qris-upload-input"
      }
    ),
    /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
      "label",
      {
        htmlFor: "qris-upload-input",
        style: {
          cursor: isProcessing ? "not-allowed" : "pointer",
          display: "inline-block",
          padding: "8px 16px",
          backgroundColor: "#0066cc",
          color: "white",
          borderRadius: "4px",
          fontWeight: 500,
          opacity: isProcessing ? 0.7 : 1
        },
        children: isProcessing ? loadingText : buttonText
      }
    )
  ] });
}



exports.QrisUploader = QrisUploader; exports.useQris = useQris;
//# sourceMappingURL=index.js.map