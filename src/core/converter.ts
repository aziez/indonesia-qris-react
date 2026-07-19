import type { ConvertOptions, TLV } from './types';
import { parseTLV } from './parser';
import { calculateCRC16 } from './crc16';

/**
 * Helper to build TLV string from parsed objects
 */
function buildTLVString(elements: TLV[]): string {
  return elements
    .map((el) => {
      const value = el.children ? buildTLVString(el.children) : el.value;
      const length = value.length.toString().padStart(2, '0');
      return `${el.tag}${length}${value}`;
    })
    .join('');
}

function makeTLV(tag: string, value: string, name = ''): TLV {
  return { tag, name, length: value.length, value };
}

/**
 * Core function to convert a static QRIS string to a dynamic one.
 * @param staticQrisString The original static QRIS string
 * @param options Options like amount, fee, merchant reference
 * @returns The new dynamic QRIS string
 */
export function staticToDynamic(staticQrisString: string, options: ConvertOptions): string {
  if (options.amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const elements = parseTLV(staticQrisString);
  
  // Some providers like DANA might issue QRIS with '12' (dynamic) even for static standees.
  // We can just proceed to overwrite the tags safely.

  const result: TLV[] = [];
  let amountInserted = false;
  let additionalDataInserted = false;

  // Tags we are managing manually
  const managedTags = new Set(['54', '55', '56', '57', '62', '63']);

  for (const el of elements) {
    // Skip tags we will inject manually
    if (managedTags.has(el.tag)) continue;

    // Change Initiation Method from 11 (Static) to 12 (Dynamic)
    if (el.tag === '01') {
      result.push(makeTLV('01', '12', 'Point of Initiation Method'));
      continue;
    }

    // Insert amount and fees right before country code (58)
    if (el.tag === '58' && !amountInserted) {
      // 54: Amount
      result.push(makeTLV('54', options.amount.toString(), 'Transaction Amount'));
      
      // 55, 56, 57: Fees/Tips
      if (options.fee) {
        if (options.fee.type === 'fixed') {
          result.push(makeTLV('55', '02', 'Tip Indicator'));
          result.push(makeTLV('56', options.fee.value.toString(), 'Value of Convenience Fee Fixed'));
        } else if (options.fee.type === 'percentage') {
          result.push(makeTLV('55', '03', 'Tip Indicator'));
          result.push(makeTLV('57', options.fee.value.toString(), 'Value of Convenience Fee Percentage'));
        }
      }
      
      amountInserted = true;
    }
    
    result.push(el);
  }

  // Handle Tag 62 (Additional Data) if merchantRef is provided
  if (options.merchantRef) {
    const additionalDataChildren: TLV[] = [];
    
    // Check if original had tag 62, preserve it
    const originalTag62 = elements.find((el) => el.tag === '62');
    if (originalTag62 && originalTag62.children) {
      // Filter out tag 05 (merchant ref) if it already exists, as we will override it
      const filteredChildren = originalTag62.children.filter(c => c.tag !== '05');
      additionalDataChildren.push(...filteredChildren);
    }
    
    additionalDataChildren.push(makeTLV('05', options.merchantRef, 'Reference Label'));
    
    const additionalDataStr = buildTLVString(additionalDataChildren);
    result.push(makeTLV('62', additionalDataStr, 'Additional Data Field'));
  } else {
    // Just preserve original tag 62 if no new ref provided
    const originalTag62 = elements.find((el) => el.tag === '62');
    if (originalTag62) {
      result.push(originalTag62);
    }
  }

  // Build the payload without CRC
  const payloadWithoutCRC = buildTLVString(result);
  
  // Calculate new CRC (Tag 63)
  const crcInput = payloadWithoutCRC + '6304';
  const newCrc = calculateCRC16(crcInput);

  return crcInput + newCrc;
}
