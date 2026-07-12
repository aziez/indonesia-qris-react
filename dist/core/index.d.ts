import { Q as QRISData, T as TLV, C as ConvertOptions } from '../types-CarXk00x.js';

/**
 * Calculate CRC16-CCITT checksum for QRIS/EMVCo QR codes.
 * Polynomial: 0x1021, Initial Value: 0xFFFF
 */
declare function calculateCRC16(str: string): string;
/**
 * Verifies if the QRIS string has a valid CRC
 */
declare function verifyCRC(qrisString: string): boolean;

/**
 * Parse a raw QRIS/EMVCo string into a structured TLV array.
 */
declare function parseTLV(data: string): TLV[];
/**
 * Parses a QRIS string into a readable object.
 * Throws an error if CRC is invalid.
 */
declare function parseQRIS(qrisString: string): QRISData;

/**
 * Core function to convert a static QRIS string to a dynamic one.
 * @param staticQrisString The original static QRIS string
 * @param options Options like amount, fee, merchant reference
 * @returns The new dynamic QRIS string
 */
declare function staticToDynamic(staticQrisString: string, options: ConvertOptions): string;

export { ConvertOptions, QRISData, TLV, calculateCRC16, parseQRIS, parseTLV, staticToDynamic, verifyCRC };
