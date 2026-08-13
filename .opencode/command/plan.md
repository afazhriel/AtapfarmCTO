---
description: Jalankan alur perencanaan CTO workflow (AGENTS.md §14) untuk satu permintaan.
---

Jalankan CTO workflow untuk permintaan berikut. JANGAN menulis kode / mengubah file.

1. **Understand** — user goal, business objective, outcome, constraints, affected domain.
2. **Audit** — periksa repo, implementasi existing, dokumentasi, konfigurasi, dependensi, tes, arsitektur. Jangan asumsi sesuatu tidak ada sebelum memeriksa.
3. **Domain & Dependency Analysis** — affected domains, upstream/downstream, data, events, integration boundaries, security.
4. **Requirement Gaps** — explicit vs inferred vs unknown; tandai "CTO DECISION REQUIRED" bila ada.
5. **Architecture / Plan** — business flow, system flow, architecture, domain/entity impact, event flow, data flow, API boundary, IoT flow, security boundary, failure scenarios, scalability, implementation plan, test plan.
6. **APPROVAL GATE** — berhenti di sini; tampilkan plan untuk persetujuan. JANGAN lanjut implementasi tanpa persetujuan.

Permintaan:
$ARGUMENTS