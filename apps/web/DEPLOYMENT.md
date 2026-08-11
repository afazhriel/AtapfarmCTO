# Panduan Deploy FarmFleet ke `farmfleet-30b6a.web.app`

## Prasyarat

- Akses Owner/Editor ke Firebase project `farmfleet-30b6a`.
- Node.js 18 atau lebih baru.
- npm dan Firebase CLI.

## 1. Daftarkan Firebase Web App

1. Buka Firebase Console.
2. Pilih project `farmfleet-30b6a`.
3. Buka **Project settings → General → Your apps**.
4. Tambahkan Web App apabila belum ada, misalnya dengan nickname `FarmFleet Web`.
5. Salin nilai object `firebaseConfig`.
6. Di root project, salin file environment:

```bash
cp .env.example .env
```

7. Isi `.env` dengan nilai dari Firebase Console:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=farmfleet-30b6a.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=farmfleet-30b6a
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Jangan commit `.env` ke repository publik. Konfigurasi Web Firebase bukan service-account secret, tetapi tetap harus dikelola melalui environment per deployment. Jangan pernah memasukkan private key service account ke aplikasi browser.

## 2. Aktifkan Authentication

Pada **Authentication → Sign-in method**:

1. Aktifkan **Email/Password**.
2. Aktifkan **Google** dan pilih support email.
3. Pada **Settings → Authorized domains**, pastikan domain berikut tersedia:
   - `localhost` untuk pengujian lokal.
   - `farmfleet-30b6a.web.app`.
   - `farmfleet-30b6a.firebaseapp.com`.

Domain Hosting default biasanya ditambahkan otomatis, tetapi tetap periksa sebelum pengujian Google Sign-In.

## 3. Buat Cloud Firestore

1. Buka **Firestore Database**.
2. Buat database `(default)` menggunakan Firestore Standard/Native mode.
3. Pilih lokasi yang sesuai dengan kebutuhan data residency dan pengguna. Lokasi database sulit atau tidak dapat dipindahkan setelah dibuat, jadi tetapkan dengan hati-hati.
4. Production mode dapat dipilih karena rules pada project ini akan langsung dideploy.

Jangan membuat collection secara manual. Aplikasi membuat struktur database saat owner membuat farm dan menekan **Load demo fleet** atau menambahkan data pertama.

## 4. Instal dependency dan uji build

Dari root folder:

```bash
npm install
npm run build
npm run preview
```

Pastikan tidak ada build error dan halaman konfigurasi Firebase tidak muncul lagi.

## 5. Instal dan login Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase projects:list
firebase use farmfleet-30b6a
```

File `.firebaserc` sudah menunjuk ke `farmfleet-30b6a`, tetapi perintah `firebase use` tetap disarankan untuk verifikasi akun aktif.

## 6. Deploy rules, indexes, dan Hosting

```bash
firebase deploy --only firestore:rules,firestore:indexes,hosting
```

Atau gunakan script:

```bash
npm run deploy
```

Perhatian: deployment rules melalui CLI akan mengganti rules yang saat ini tersimpan di Firebase Console untuk database yang sama.

## 7. Verifikasi deployment

Buka:

```text
https://farmfleet-30b6a.web.app
```

Lakukan smoke test berikut:

1. Register menggunakan Email/Password.
2. Buka email verifikasi dan verifikasi akun.
3. Login kembali.
4. Buat farm workspace pertama.
5. Tekan **Load demo fleet** pada dashboard.
6. Pastikan Asset, Monitoring, Operations, Alerts, Maintenance, dan Reports terisi.
7. Tambahkan manual telemetry di Monitoring. Nilai di luar target harus membuat warning alert.
8. Logout dan login kembali untuk memastikan session persistence serta membership farm bekerja.
9. Uji Google Sign-In.

## 8. Menambahkan anggota tim

Karena versi ini sepenuhnya client-side dan tidak memakai privileged Cloud Function:

1. Anggota harus register lebih dahulu.
2. Owner membuka Firebase Console → Authentication → Users.
3. Salin UID anggota.
4. Di FarmFleet buka **Team → Add member**.
5. Masukkan UID, email, display name, dan role.

Security Rules memverifikasi bahwa UID tersebut telah memiliki document user dan hanya owner/manager yang dapat menambah role non-owner.

## Troubleshooting

### `auth/unauthorized-domain`
Tambahkan domain aktif ke Authentication → Settings → Authorized domains.

### `Missing or insufficient permissions`
Pastikan rules terbaru sudah dideploy dan pengguna memiliki document membership untuk farm tersebut. Ulangi:

```bash
firebase deploy --only firestore:rules
```

### Halaman 404 ketika refresh route
Pastikan `firebase.json` memiliki rewrite `**` ke `/index.html`, lalu deploy Hosting kembali.

### Aplikasi menampilkan “Firebase configuration required”
Nilai `.env` belum diisi atau proses build dilakukan sebelum `.env` tersedia. Isi `.env`, lalu jalankan ulang `npm run build` dan deploy.

### Google popup gagal
Periksa provider Google, authorized domains, popup blocker, dan nilai `VITE_FIREBASE_AUTH_DOMAIN`.
