# indonesia-qris-react 🇮🇩

Library lengkap dan paling *user-friendly* untuk memanipulasi QRIS Statis menjadi QRIS Dinamis. Didesain secara spesifik dengan fitur yang siap pakai untuk ekosistem **React & Next.js**.

## ✨ Fitur Unggulan

- **Image Decoder (No More Copy-Paste String)**: Mengekstrak teks QRIS statis dari gambar secara lokal di browser menggunakan integrasi `jsQR`.
- **React Hooks Bawaan**: Gunakan `useQris` untuk me-*manage state* tanpa pusing.
- **UI Component Ready**: `QrisUploader` sudah tersedia, tinggal di-*drop* ke dalam form Anda.
- **Ringan & Modular**: *Core string manipulation* dipisah dari dependensi React & Canvas. Bisa digunakan di Node.js.

## 📦 Instalasi

```bash
npm install indonesia-qris-react jsqr
# atau
yarn add indonesia-qris-react jsqr
# atau
bun add indonesia-qris-react jsqr
```

*(Catatan: `jsqr` dibutuhkan sebagai peer dependency jika Anda menggunakan fitur upload gambar)*

## 🚀 Penggunaan Dasar

### 1. Menggunakan React Hooks (Cara Termudah)

```tsx
import { useQris, QrisUploader } from 'indonesia-qris-react/react';

export default function CheckoutPage() {
  const { parsedData, generateDynamic, processImageFile, staticQris } = useQris();

  return (
    <div>
      <h1>Pembayaran QRIS</h1>
      
      {!staticQris ? (
        <QrisUploader 
          onSuccess={(qrisString) => console.log('Berhasil baca:', qrisString)}
          buttonText="Upload Foto QRIS Anda"
        />
      ) : (
        <div>
          <p>Toko: {parsedData?.merchantName}</p>
          
          <button onClick={() => {
            const dynamicString = generateDynamic({ amount: 50000 });
            console.log('QRIS Dinamis untuk Rp 50.000:', dynamicString);
          }}>
            Generate QR Tagihan 50.000
          </button>
        </div>
      )}
    </div>
  );
}
```

### 2. Menggunakan Core (Node.js / Vanilla JS)

Bagian ini murni memanipulasi *string* dan tidak memiliki dependensi eksternal.

```typescript
import { staticToDynamic, parseQRIS } from 'indonesia-qris-react/core';

const staticString = "00020101021126570011ID.DANA.WWW...";

// Parsing data
const data = parseQRIS(staticString);
console.log(data.merchantName);

// Konversi statis ke dinamis
const dynamicString = staticToDynamic(staticString, { 
  amount: 150000, 
  merchantRef: "INV-2024-001" 
});
```

## 📚 API Reference

### `staticToDynamic(staticQrisString, options)`
- `amount` (number) - Wajib. Nominal transaksi dalam Rupiah.
- `merchantRef` (string) - Opsional. Referensi transaksi/Invoice ID untuk diinjeksi ke tag 62.
- `fee` (object) - Opsional. 
  - `type`: `'fixed' | 'percentage'`
  - `value`: number

## 📝 Lisensi
MIT License
