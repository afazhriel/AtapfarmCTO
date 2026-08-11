# FarmFleet — Integrated Fleet Farm Management System

FarmFleet adalah aplikasi React + Vite berbasis Firebase untuk mengelola aset dan operasi farm secara generik. Model aset yang sama dapat digunakan untuk sapi, ayam, kambing, perikanan, crop block, alat, kendaraan, dan fasilitas.

## Modul yang tersedia

- Firebase Authentication: register, login email/password, Google Sign-In, verifikasi email, reset password, persistence, dan logout.
- Multi-farm workspace dengan role `owner`, `manager`, `operator`, dan `viewer`.
- Fleet asset registry: livestock, equipment, vehicle, facility, aquaculture, dan crop block.
- Monitoring real-time menggunakan listener Firestore, input telemetry manual, tren sensor, dan pembuatan warning otomatis.
- Operations board untuk task `todo`, `in-progress`, dan `done`.
- Alerts dengan severity, status, dan resolution workflow.
- Preventive maintenance, biaya, jadwal, serta pembaruan status aset setelah pekerjaan selesai.
- Dashboard dan reports berbasis Recharts, termasuk fleet health, utilization, telemetry, alert distribution, dan CSV export.
- Team membership serta role-based Firestore Security Rules.
- Demo seeding langsung dari dashboard untuk menguji seluruh alur dan koneksi database.
- Responsive UI untuk desktop, tablet, dan mobile.

## Menjalankan lokal

```bash
cp .env.example .env
# isi nilai Firebase Web App pada .env
npm install
npm run dev
```

Buka URL yang diberikan Vite, biasanya `http://localhost:5173`.

## Build produksi

```bash
npm run build
npm run preview
```

Hasil build berada di folder `dist`.

## Deploy

Panduan khusus project `farmfleet-30b6a` tersedia pada [DEPLOYMENT.md](./DEPLOYMENT.md).

## Batasan keamanan yang disengaja

Aplikasi tidak mengizinkan perangkat IoT anonim menulis langsung ke Firestore. Telemetry saat ini dapat dikirim oleh user farm dengan role owner, manager, atau operator. Untuk perangkat fisik produksi, gunakan Cloud Functions, Cloud Run, atau API server dengan Firebase Admin SDK dan device authentication. Lihat [IOT_INTEGRATION.md](./IOT_INTEGRATION.md).
