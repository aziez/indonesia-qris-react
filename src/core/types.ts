/**
 * Single TLV (Tag-Length-Value) Node in the QRIS payload
 */
export interface TLV {
  tag: string;
  name: string;
  length: number;
  value: string;
  children?: TLV[];
}

/**
 * Parsed QRIS Data Structure
 */
export interface QRISData {
  version: string;
  method: 'static' | 'dynamic';
  merchantCategoryCode: string;
  currency: string;
  amount?: number;
  countryCode: string;
  merchantName: string;
  merchantCity: string;
  postalCode: string;
  crc: string;
  raw: TLV[];
}

/**
 * Options for converting Static QRIS to Dynamic
 */
export interface ConvertOptions {
  /** The transaction amount in Rupiah (IDR) */
  amount: number;
  /** Optional transaction reference (max 25 chars) to be injected into tag 62 (Additional Data) */
  merchantRef?: string;
  /** Optional fee/tip */
  fee?: {
    type: 'fixed' | 'percentage';
    value: number;
  };
}
