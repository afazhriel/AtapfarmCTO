# FarmFleet Skills — Inventaris & Panduan Penggunaan

Status: disetujui CTO, diimplementasikan 2026.

Skill terdeteksi dan dimuat otomatis oleh opencode saat tugas cocok dengan deskripsi skill ("routing"). Tidak perlu mengaktifkan manual — mulai bekerja, skill relevan akan ter-load. Restart sesi opencode setelah perubahan repo agar skill terdeteksi.

---

## 1. Inventaris skill

### A. Skill domain FarmFleet (`.agents/skills/farmfleet-*`)

| Skill | Dipakai saat | Rute AGENTS.md |
|---|---|---|
| `farmfleet-business` | Requirement bisnis: business rules, business events, workflow keputusan | §3, §5, §8, §23 |
| `farmfleet-farm` | Operasional farm: site, field, crop, planting, harvesting, task, worker, production, inventory | §2, §15 |
| `farmfleet-fleet` | Fleet: vehicle, trip, route, GPS/geofence, fuel, maintenance, work order, vehicle lifecycle | §7 |
| `farmfleet-iot` | IoT: sensor, device, gateway, MQTT, telemetry, command/control, device lifecycle | §3, §6 |
| `farmfleet-architecture` | Arsitektur & deployment: domain model, DB, API/event contract, security boundary | §4, §13, §14 |
| `farmfleet-data` | Data: schema, entity model, event contract, ETL, data integrity, timestamp semantics | §5 |
| `farmfleet-ai` | AI/ML: KPI, prediction, anomaly, forecasting, AI agents, decision support | §9 |
| `farmfleet-api` | API: endpoint, contract, authorization, validation, integrasi eksternal | §10, §14 |
| `farmfleet-security` | Keamanan: auth, RBAC, secret, MQTT/device security, audit, dependency | §10 |
| `farmfleet-testing` | Validasi: unit/integration test, type check, lint, build, IoT validation | §14 Step 8 |

### B. Skill security operasional (Strix)

| Skill | Fungsi |
|---|---|
| `ci-security-scanning-with-strix` | Tambah security scan di CI/CD; PR diff-scoped AI pentest; SARIF; gate build |
| `fix-security-vulnerabilities-with-strix` | Triage & patch vuln hasil scan; buktikan fix menutup exploit |
| `penetration-testing-with-strix` | Pentest web app/API/repo — OSS CLI lokal (Docker + LLM key) atau cloud `app.strix.ai` |
| `managed-pentesting-with-strix` | Pentest-as-a-service via REST API; scan terjadwal; laporan PDF/DOCX; PR review |

**Syarat sebelum dipakai:**
- Cloud: akun `app.strix.ai` + API token (env/CI secret, jangan di-hardcode).
- OSS CLI: Docker + LLM key. Instal: `curl -sSL https://strix.ai/install | bash`.

### C. Skill engineering (kualitas)

| Skill | Fungsi |
|---|---|
| `ponytail` | Engineering minimalism (via plugin `opencode.json`). `/ponytail lite\|full\|ultra\|off`, `/ponytail-review`, `/ponytail-audit`, `/ponytail-debt`, `/ponytail-gain`, `/ponytail-help` |
| `no-ai-slop` | Pembersih prosa AI-slop pada dokumentasi akhir |
| `book-to-skill` | Konversi buku/dokumen mentah → skill terstruktur (panduan §2) |

---

## 2. Panduan book-to-skill — dari data mentah buku jadi skill / dokumen

Tujuan: mengubah buku/dokumen (PDF, EPUB, DOCX, HTML, MD, TXT, RTF, MOBI/AZW) menjadi skill terstruktur — **bukan ringkasan**, tapi frameworks, prinsip, teknik, anti-pattern yang bisa dipakai berulang saat mengerjakan kodingan.

### 2.1 Prasyarat (sekali)

Periksa ekstraktor yang tersedia:

```bash
python3 scripts/extract.py --check
```

Instal yang kurang sesuai format (PDF/EPUB/DOCX/RTF/technical). Path eksekusi relatif terhadap folder skill:
`C:\Dev\github\AtapfarmCTO\.agents\skills\book-to-skill\scripts\extract.py`

### 2.2 Empat mode

| Mode | Pemicu | Aksi |
|---|---|---|
| Full conversion (default) | Sertakan path dokumen tanpa instruksi | Langkah 0–9: ekstrak → buat SKILL.md, chapters/, glossary, pattern, cheatsheet |
| Analyze only | Katakan "analyze" / "hanya ekstrak" | Hanya ekstrak & lapor struktur; TIDAK generate file |
| Generate from analysis | Punya catatan analisis | Skip ekstraksi, langsung bangun skill dari analisis |
| Update / fold-in | Update skill existing | Ekstrak input baru, merge ke skill lama |

### 2.3 Alur kerja dari buku mentah → hasil

```
1. Siapkan dokumen → folder sumber (contoh: knowledge/buku-antropologi/)
2. Validasi ekstraktor   → python3 scripts/extract.py --check
3. Ekstrak struktur      → python3 scripts/extract.py <path> --mode <technical|text>
   Hasil: full_text.txt + hasil analisis struktur (frameworks, prinsip, teknik, anti-pattern)
4. Review (analyze-only) → verifikasi struktur sebelum generate
5. Generate skill        → SKILL.md + chapters/ + glossary + pattern + cheatsheet
6. Simpan di             → .agents/skills/<skill-name>/
7. Validasi skill        → python3 tools/validate_skill.py .agents/skills/<skill-name>/SKILL.md
8. Pakai                 → skill otomatis muncul saat tugas relevan (routing)
```

**Untuk dokumen/kodingan (bukan skill):** gunakan output fase analisis (frameworks/prinsip/teknik) sebagai kerangka kerja penulisan dokumen teknis FarmFleet di `docs/`, dan sebagai pola implementasi di kode. Datanya harus grounded — jangan menambah data/arsitektur yang tidak ada di sumber.

### 2.4 Catatan penting

- Prinsip: "Extract structure, not summaries". Skill adalah toolkit, bukan book report.
- Preserve ketepatan penulis: "The 5 Whys" ≠ "tanya kenapa berkali-kali".
- Kedalaman berjenjang: buku sederhana → skill sederhana; buku kompleks (10+ framework) → skill dengan referensi per bab.
- File asli source of truth; salinan skill adalah artefak turunan.

---

## 3. Alur keamanan yang disarankan (perlu persetujuan)

```
1. Pentest baseline        → penetration-testing-with-strix
2. Fix hasil scan          → fix-security-vulnerabilities-with-strix
3. Gate CI PR              → ci-security-scanning-with-strix
4. Pentest terjadwal       → managed-pentesting-with-strix
```

## 4. Routing otomatis yang berlaku

Semua pemetaan berikut otomatis (load saat tugas cocok):

Farm → `farmfleet-business` + `farmfleet-farm` · Fleet → `farmfleet-fleet` · IoT → `farmfleet-iot` · Arsitektur → `farmfleet-architecture` · Data → `farmfleet-data` · AI → `farmfleet-ai` · API → `farmfleet-api` · Security → `farmfleet-security` + Strix · Testing → `farmfleet-testing` · Kualitas prosa → No-AI-Slop · Pembelajaran dari buku → BookToSkill · Minimalisme kode → Ponytail.

Aturan: jangan memuat/memicu skill yang tidak relevan hanya karena tersedia.