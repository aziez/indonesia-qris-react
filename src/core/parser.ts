import type { TLV, QRISData } from './types';
import { verifyCRC } from './crc16';

const TAG_NAMES: Record<string, string> = {
  '00': 'Payload Format Indicator',
  '01': 'Point of Initiation Method',
  '26': 'Merchant Account Information',
  '51': 'Merchant Account Information',
  '52': 'Merchant Category Code',
  '53': 'Transaction Currency',
  '54': 'Transaction Amount',
  '55': 'Tip Indicator',
  '56': 'Value of Convenience Fee Fixed',
  '57': 'Value of Convenience Fee Percentage',
  '58': 'Country Code',
  '59': 'Merchant Name',
  '60': 'Merchant City',
  '61': 'Postal Code',
  '62': 'Additional Data Field',
  '63': 'CRC',
};

// Identify tags that have nested TLVs (Tag 26 to 51, and Tag 62)
function isNestedTag(tag: string): boolean {
  const tagNum = parseInt(tag, 10);
  return (tagNum >= 26 && tagNum <= 51) || tag === '62';
}

/**
 * Parse a raw QRIS/EMVCo string into a structured TLV array.
 */
export function parseTLV(data: string): TLV[] {
  const elements: TLV[] = [];
  let pos = 0;

  while (pos < data.length) {
    if (pos + 4 > data.length) break;

    const tag = data.substring(pos, pos + 2);
    const lengthStr = data.substring(pos + 2, pos + 4);
    const length = parseInt(lengthStr, 10);

    if (isNaN(length) || pos + 4 + length > data.length) break;

    const value = data.substring(pos + 4, pos + 4 + length);
    const name = TAG_NAMES[tag] ?? `Unknown (${tag})`;

    const element: TLV = { tag, name, length, value };

    if (isNestedTag(tag)) {
      element.children = parseTLV(value);
    }

    elements.push(element);
    pos += 4 + length;
  }

  return elements;
}

/**
 * Parses a QRIS string into a readable object.
 * Throws an error if CRC is invalid.
 */
export function parseQRIS(qrisString: string): QRISData {
  if (!verifyCRC(qrisString)) {
    throw new Error('Invalid QRIS CRC checksum.');
  }

  const raw = parseTLV(qrisString);
  const getTagValue = (tag: string) => raw.find((t) => t.tag === tag)?.value;

  const methodValue = getTagValue('01');
  const amountValue = getTagValue('54');

  return {
    version: getTagValue('00') ?? '01',
    method: methodValue === '12' ? 'dynamic' : 'static',
    merchantCategoryCode: getTagValue('52') ?? '',
    currency: getTagValue('53') ?? '360',
    amount: amountValue ? parseFloat(amountValue) : undefined,
    countryCode: getTagValue('58') ?? 'ID',
    merchantName: getTagValue('59') ?? '',
    merchantCity: getTagValue('60') ?? '',
    postalCode: getTagValue('61') ?? '',
    crc: getTagValue('63') ?? '',
    raw,
  };
}
