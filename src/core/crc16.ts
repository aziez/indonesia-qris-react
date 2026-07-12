/**
 * Calculate CRC16-CCITT checksum for QRIS/EMVCo QR codes.
 * Polynomial: 0x1021, Initial Value: 0xFFFF
 */
export function calculateCRC16(str: string): string {
  let crc = 0xffff;

  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  // Ensure 4 characters hex, uppercase
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Verifies if the QRIS string has a valid CRC
 */
export function verifyCRC(qrisString: string): boolean {
  if (qrisString.length < 4) return false;
  
  // The payload without the last 4 characters of CRC
  const payload = qrisString.slice(0, -4);
  // The actual CRC value attached to the string
  const actualCrc = qrisString.slice(-4);
  
  const expectedCrc = calculateCRC16(payload);
  
  return actualCrc === expectedCrc;
}
