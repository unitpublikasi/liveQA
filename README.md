# LiveQ — Real-Time Interactive Q&A Platform dengan AI Smart Scoring

LiveQ adalah platform tanya jawab interaktif untuk konferensi, webinar, dan townhall dengan evaluasi kualitas otomatis berbasis Google Gemini AI, pemungutan suara real-time, dasbor moderator, dan tampilan panggung presenter.

## 🚀 Cara Menjalankan di Komputer Lokal (Local Development)

### 1. Kloning Repositori
```bash
git clone <URL_REPO_GITHUB_ANDA>
cd <NAMA_FOLDER_REPO>
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` dan masukkan API Key Gemini Anda:
```env
GEMINI_API_KEY=AIzaSy...your-gemini-api-key
PORT=3000
```
*(Catatan: Aplikasi tetap dapat berjalan secara fallback heuristik jika GEMINI_API_KEY belum diisi)*

### 4. Jalankan Aplikasi (Mode Pengembangan)
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 🛠️ Script yang Tersedia

- `npm run dev`: Menjalankan server pengembangan (Express + Vite + TSX)
- `npm run build`: Membangun bundle frontend Vite dan bundle server CommonJS (`dist/server.cjs`)
- `npm start`: Menjalankan server hasil build produksi (`node dist/server.cjs`)
- `npm run lint`: Memvalidasi tipe data TypeScript (`tsc --noEmit`)

---

## 🌐 Panduan Deployment

### Deploy ke Platform Node.js (Render, Railway, Heroku, Cloud Run, VPS):
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `GEMINI_API_KEY`: Kunci API Google Gemini Anda
  - `NODE_ENV`: `production`
