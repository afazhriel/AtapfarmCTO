# Master Workspace — AtapfarmCTO (FarmFleet FMS)

Workspace pusat untuk seluruh workflow AI coding. Semua CLI coding dimulai dari sini; semua skill menjadi support untuk pengerjaan proyek; output akhir adalah aplikasi web dan mobile FarmFleet.

## 1. Arsitektur context lintas CLI

| File | Dibaca oleh | Peran |
|---|---|---|
| `AGENTS.md` | opencode, Codex | Master agent memory (otoritatif, 25 bagian) |
| `CLAUDE.md` | Claude Code (`fcc-claude`) | Pintu masuk ringkas → pointer ke `AGENTS.md` |
| `opencode.json` | opencode | Provider config, plugin, instructions |
| `.agents/skills/` | semua CLI (auto-load) | 16 skill domain + operasional |
| `docs/skills-guide.md` | semua agent | Inventaris & routing skill |

Prinsip: `AGENTS.md` adalah sumber kebenaran; `CLAUDE.md` hanya jembatan agar Claude Code mendapat konteks yang sama tanpa duplikasi.

## 2. Matriks CLI

| CLI | Command | Context yang dibaca |
|---|---|---|
| opencode | `opencode` (dari folder ini) | `AGENTS.md`, `opencode.json`, skill, `.opencode/command` |
| Claude Code via FCC | `scripts\ai.ps1 -Agent claude` atau `fcc-claude` | `CLAUDE.md` → `AGENTS.md` |
| Codex via FCC | `scripts\ai.ps1 -Agent codex` atau `fcc-codex` | `AGENTS.md` |

Perintah opencode kustom:
- `/plan` — jalankan alur CTO workflow §14 lalu berhenti di approval gate.
- `/report` — hasilkan laporan sesuai output contract §23.

## 3. Routing skill → domain

| Domain | Skill |
|---|---|
| Business / farm | `farmfleet-business`, `farmfleet-farm` |
| Fleet | `farmfleet-fleet` |
| IoT | `farmfleet-iot` |
| Architecture / deployment | `farmfleet-architecture` |
| Data | `farmfleet-data` |
| AI / analytics | `farmfleet-ai` |
| API | `farmfleet-api` |
| Security | `farmfleet-security` + Strix |
| Testing | `farmfleet-testing` |
| Kualitas prosa | `no-ai-slop` |
| Pembelajaran buku | `book-to-skill` |
| Kode minimal | ponytail (plugin) |

Jangan memuat skill yang tidak relevan hanya karena tersedia (AGENTS.md §22).

## 4. Menjalankan aplikasi

```powershell
# Backend (modular monolith TypeScript)
Get-Content backend\package.json        # lihat script yang tersedia
# apps/web (React 19 + Vite + Firebase)
npm install --prefix apps\web
npm run dev --prefix apps\web           # dev server Vite
npm run lint --prefix apps\web
npm run build --prefix apps\web
# apps/mobile & apps/admin: masih scaffold, belum ada script
```

## 5. Alur output (web + mobile)

```
Requirement → /plan (CTO workflow) → approval CTO
→ implementasi backend + apps/web (+ nanti apps/mobile)
→ validasi (unit test backend, lint/build web, skill routing)
→ /report (output contract)
→ deploy apps/web (Firebase) → kandidat rilis
```

## 6. Checklist awal sesi

1. (Claude Code) cek server FCC: `(Invoke-WebRequest http://127.0.0.1:8082/health).Content` → `{"status":"healthy"}`
2. Buka CLI dari folder ini agar context terisi.
3. Tentukan domain → muat skill yang relevan.
4. Untuk pekerjaan besar: `/plan` → tunggu persetujuan CTO → baru eksekusi.