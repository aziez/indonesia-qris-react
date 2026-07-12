import {
  parseQRIS,
  staticToDynamic
} from "../chunk-VLFANNBB.mjs";
import {
  readQrisFromImage
} from "../chunk-JIT66JQF.mjs";

// src/react/hooks.ts
import { useState, useCallback } from "react";
function useQris() {
  const [staticQris, setStaticQris] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processImageFile = useCallback(async (file) => {
    setIsProcessing(true);
    setError(null);
    try {
      const qrisString = await readQrisFromImage(file);
      if (!qrisString) {
        throw new Error("Tidak ditemukan kode QR pada gambar.");
      }
      const parsed = parseQRIS(qrisString);
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
  const setRawString = useCallback((qrisString) => {
    try {
      const parsed = parseQRIS(qrisString);
      setStaticQris(qrisString);
      setParsedData(parsed);
      setError(null);
    } catch (err) {
      setError(err.message || "QRIS string tidak valid");
    }
  }, []);
  const generateDynamic = useCallback((options) => {
    if (!staticQris) {
      throw new Error("QRIS Statis belum dimuat. Silakan upload atau set string terlebih dahulu.");
    }
    return staticToDynamic(staticQris, options);
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
import React, { useRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function QrisUploader({
  onSuccess,
  onError,
  className = "",
  buttonText = "Upload Gambar QRIS",
  loadingText = "Memproses..."
}) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const inputRef = useRef(null);
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const { readQrisFromImage: readQrisFromImage2 } = await import("../image-IO4TBUSA.mjs");
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
  return /* @__PURE__ */ jsxs("div", { className: `indonesia-qris-uploader ${className}`, children: [
    /* @__PURE__ */ jsx(
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
    /* @__PURE__ */ jsx(
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
export {
  QrisUploader,
  useQris
};
//# sourceMappingURL=index.mjs.map