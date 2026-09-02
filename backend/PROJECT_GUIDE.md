# 🚀 Project Guide - Headless CMS Backend

Selamat datang di repositori Headless CMS! Project ini menggunakan arsitektur REST API dengan Node.js, Express.js, TypeScript, dan Prisma (PostgreSQL).

## 🛠️ Stack Teknologi
- **Runtime & Framework:** Node.js, Express.js
- **Bahasa:** TypeScript (`ts-node` untuk development)
- **Database & ORM:** PostgreSQL + Prisma
- **Autentikasi:** JWT (JSON Web Token)
- **File Upload:** Multer
- **Payment Gateway:** Midtrans (Webhook)

## 📁 Struktur Direktori
```text
backend/
├── prisma/
│   ├── schema.prisma      # Definisi seluruh model database
│   └── seed.ts            # (Opsional) Data awal
├── src/
│   ├── config/            # Konfigurasi eksternal (Midtrans, S3, dll)
│   ├── controllers/       # "Fat Controller", berisi semua logika bisnis & DB queries
│   ├── generated/         # Hasil generate Prisma Client (otomatis)
│   ├── middlewares/       # Auth JWT, Role Check, Multer, Validasi
│   ├── routes/            # Kumpulan route untuk setiap endpoint (Auth, CMS, dll)
│   ├── utils/             # Helper tambahan
│   └── index.ts           # 🌟 ENTRY POINT UTAMA
├── .env                   # Environment variable (credentials, ports, keys)
└── docker-compose.yml     # Konfigurasi PostgreSQL untuk Local Environment
```

## ⚙️ Cara Menjalankan di Lokal (Local Setup)
Jika Anda baru pertama kali melakukan clone, ikuti langkah-langkah ini:

1. **Pastikan Docker Desktop menyala.** 
2. Jalankan PostgreSQL lokal dengan Docker:
   ```bash
   docker-compose up -d
   ```
3. Install package:
   ```bash
   npm install
   ```
4. Push struktur tabel (schema) ke dalam database lokal:
   ```bash
   npx prisma db push
   ```
5. (Opsional) Jika ada seeder data, jalankan:
   ```bash
   npx prisma db seed
   ```
6. Mulai server *development*:
   ```bash
   npm run dev
   ```

*Server akan menyala di `http://localhost:3000` (atau sesuai `PORT` di .env).*

## 🐞 Known Issues & Bugs (Audit Report) - ✅ **RESOLVED**
Semua bug peninggalan developer sebelumnya telah berhasil diselesaikan pada Tahap 1:

1. ~~**Dead Code (Route Tidak Terhubung):** `mediaAsset.routes.ts` dan `mediaFolder.routes.ts` tidak diimport.~~ (Telah dihubungkan di `index.ts`).
2. ~~**File `apiTokenAuth.ts` Rusak:** File ini berisi *copy-paste* dari kode login user.~~ (Telah ditulis ulang menjadi middleware otentikasi API Token yang benar dengan validasi `bcrypt`).
3. ~~**Konflik Port & CORS:** `FRONTEND_URL` bentrok.~~ (Telah diperbaiki; backend sekarang menggunakan port 8080 secara dinamis, dan CORS membaca URL dari `FRONTEND_URL`).
4. ~~**Copy-paste Error di Routes:** Endpoint salah memanggil controller.~~ (Telah dikoreksi dan middleware `authMiddleware` telah dipasang di semua endpoint terkait).

---
*(Dokumen ini dibuat otomatis sebagai panduan dasar pengenalan proyek CMS ini).*
