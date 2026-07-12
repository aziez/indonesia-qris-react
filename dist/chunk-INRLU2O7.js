"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/core/crc16.ts
function calculateCRC16(str) {
  let crc = 65535;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 32768) !== 0) {
        crc = (crc << 1 ^ 4129) & 65535;
      } else {
        crc = crc << 1 & 65535;
      }
    }
  }
  return (crc & 65535).toString(16).toUpperCase().padStart(4, "0");
}
function verifyCRC(qrisString) {
  if (qrisString.length < 4) return false;
  const payload = qrisString.slice(0, -4);
  const actualCrc = qrisString.slice(-4);
  const expectedCrc = calculateCRC16(payload);
  return actualCrc === expectedCrc;
}

// src/core/parser.ts
var TAG_NAMES = {
  "00": "Payload Format Indicator",
  "01": "Point of Initiation Method",
  "26": "Merchant Account Information",
  "51": "Merchant Account Information",
  "52": "Merchant Category Code",
  "53": "Transaction Currency",
  "54": "Transaction Amount",
  "55": "Tip Indicator",
  "56": "Value of Convenience Fee Fixed",
  "57": "Value of Convenience Fee Percentage",
  "58": "Country Code",
  "59": "Merchant Name",
  "60": "Merchant City",
  "61": "Postal Code",
  "62": "Additional Data Field",
  "63": "CRC"
};
function isNestedTag(tag) {
  const tagNum = parseInt(tag, 10);
  return tagNum >= 26 && tagNum <= 51 || tag === "62";
}
function parseTLV(data) {
  const elements = [];
  let pos = 0;
  while (pos < data.length) {
    if (pos + 4 > data.length) break;
    const tag = data.substring(pos, pos + 2);
    const lengthStr = data.substring(pos + 2, pos + 4);
    const length = parseInt(lengthStr, 10);
    if (isNaN(length) || pos + 4 + length > data.length) break;
    const value = data.substring(pos + 4, pos + 4 + length);
    const name = _nullishCoalesce(TAG_NAMES[tag], () => ( `Unknown (${tag})`));
    const element = { tag, name, length, value };
    if (isNestedTag(tag)) {
      element.children = parseTLV(value);
    }
    elements.push(element);
    pos += 4 + length;
  }
  return elements;
}
function parseQRIS(qrisString) {
  if (!verifyCRC(qrisString)) {
    throw new Error("Invalid QRIS CRC checksum.");
  }
  const raw = parseTLV(qrisString);
  const getTagValue = (tag) => _optionalChain([raw, 'access', _ => _.find, 'call', _2 => _2((t) => t.tag === tag), 'optionalAccess', _3 => _3.value]);
  const methodValue = getTagValue("01");
  const amountValue = getTagValue("54");
  return {
    version: _nullishCoalesce(getTagValue("00"), () => ( "01")),
    method: methodValue === "12" ? "dynamic" : "static",
    merchantCategoryCode: _nullishCoalesce(getTagValue("52"), () => ( "")),
    currency: _nullishCoalesce(getTagValue("53"), () => ( "360")),
    amount: amountValue ? parseFloat(amountValue) : void 0,
    countryCode: _nullishCoalesce(getTagValue("58"), () => ( "ID")),
    merchantName: _nullishCoalesce(getTagValue("59"), () => ( "")),
    merchantCity: _nullishCoalesce(getTagValue("60"), () => ( "")),
    postalCode: _nullishCoalesce(getTagValue("61"), () => ( "")),
    crc: _nullishCoalesce(getTagValue("63"), () => ( "")),
    raw
  };
}

// src/core/converter.ts
function buildTLVString(elements) {
  return elements.map((el) => {
    const value = el.children ? buildTLVString(el.children) : el.value;
    const length = value.length.toString().padStart(2, "0");
    return `${el.tag}${length}${value}`;
  }).join("");
}
function makeTLV(tag, value, name = "") {
  return { tag, name, length: value.length, value };
}
function staticToDynamic(staticQrisString, options) {
  if (options.amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }
  const elements = parseTLV(staticQrisString);
  const isDynamic = elements.some((el) => el.tag === "01" && el.value === "12");
  if (isDynamic) {
    throw new Error("QRIS payload is already dynamic");
  }
  const result = [];
  let amountInserted = false;
  let additionalDataInserted = false;
  const managedTags = /* @__PURE__ */ new Set(["54", "55", "56", "57", "62", "63"]);
  for (const el of elements) {
    if (managedTags.has(el.tag)) continue;
    if (el.tag === "01") {
      result.push(makeTLV("01", "12", "Point of Initiation Method"));
      continue;
    }
    if (el.tag === "58" && !amountInserted) {
      result.push(makeTLV("54", options.amount.toString(), "Transaction Amount"));
      if (options.fee) {
        if (options.fee.type === "fixed") {
          result.push(makeTLV("55", "02", "Tip Indicator"));
          result.push(makeTLV("56", options.fee.value.toString(), "Value of Convenience Fee Fixed"));
        } else if (options.fee.type === "percentage") {
          result.push(makeTLV("55", "03", "Tip Indicator"));
          result.push(makeTLV("57", options.fee.value.toString(), "Value of Convenience Fee Percentage"));
        }
      }
      amountInserted = true;
    }
    result.push(el);
  }
  if (options.merchantRef) {
    const additionalDataChildren = [];
    const originalTag62 = elements.find((el) => el.tag === "62");
    if (originalTag62 && originalTag62.children) {
      const filteredChildren = originalTag62.children.filter((c) => c.tag !== "05");
      additionalDataChildren.push(...filteredChildren);
    }
    additionalDataChildren.push(makeTLV("05", options.merchantRef, "Reference Label"));
    const additionalDataStr = buildTLVString(additionalDataChildren);
    result.push(makeTLV("62", additionalDataStr, "Additional Data Field"));
  } else {
    const originalTag62 = elements.find((el) => el.tag === "62");
    if (originalTag62) {
      result.push(originalTag62);
    }
  }
  const payloadWithoutCRC = buildTLVString(result);
  const crcInput = payloadWithoutCRC + "6304";
  const newCrc = calculateCRC16(crcInput);
  return crcInput + newCrc;
}







exports.calculateCRC16 = calculateCRC16; exports.verifyCRC = verifyCRC; exports.parseTLV = parseTLV; exports.parseQRIS = parseQRIS; exports.staticToDynamic = staticToDynamic;
//# sourceMappingURL=chunk-INRLU2O7.js.map