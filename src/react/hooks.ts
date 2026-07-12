import { useState, useCallback } from 'react';
import { readQrisFromImage } from '../image';
import { staticToDynamic, parseQRIS } from '../core';
import type { QRISData, ConvertOptions } from '../core';

export function useQris() {
  const [staticQris, setStaticQris] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<QRISData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Reads a QRIS from a file (e.g. from an <input type="file" />)
   */
  const processImageFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    try {
      const qrisString = await readQrisFromImage(file);
      if (!qrisString) {
        throw new Error('Tidak ditemukan kode QR pada gambar.');
      }
      
      const parsed = parseQRIS(qrisString);
      
      setStaticQris(qrisString);
      setParsedData(parsed);
      
      return { qrisString, parsed };
    } catch (err: any) {
      setError(err.message || 'Gagal memproses gambar QRIS');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Set a raw QRIS string directly
   */
  const setRawString = useCallback((qrisString: string) => {
    try {
      const parsed = parseQRIS(qrisString);
      setStaticQris(qrisString);
      setParsedData(parsed);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'QRIS string tidak valid');
    }
  }, []);

  /**
   * Generates a dynamic QRIS based on the currently loaded static QRIS
   */
  const generateDynamic = useCallback((options: ConvertOptions) => {
    if (!staticQris) {
      throw new Error('QRIS Statis belum dimuat. Silakan upload atau set string terlebih dahulu.');
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
    generateDynamic,
  };
}
