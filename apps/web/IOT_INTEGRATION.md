# Production IoT Integration

UI ini sudah memakai schema telemetry yang dapat digunakan oleh sensor, tetapi perangkat fisik tidak boleh menyimpan Firebase Web credentials atau menulis langsung sebagai user anonim.

## Pola yang direkomendasikan

```text
Sensor / RFID / GPS
  → authenticated gateway or MQTT broker
  → Cloud Run / Cloud Functions HTTPS endpoint
  → validate device, farm, asset, metric, timestamp, and range
  → Firebase Admin SDK writes telemetry
  → optional alert creation
  → React dashboard receives Firestore real-time update
```

## Payload minimum

```json
{
  "farmId": "FARM_DOCUMENT_ID",
  "assetId": "ASSET_DOCUMENT_ID",
  "metric": "temperature",
  "value": 28.4,
  "unit": "°C",
  "recordedAt": "2026-07-31T03:00:00Z",
  "deviceId": "gateway-01"
}
```

## Validasi server yang wajib

- Device identity dan status aktif.
- Device memiliki izin untuk farm dan asset tersebut.
- Metric dan unit termasuk allow-list.
- Value numeric, masuk akal, dan tidak melampaui batas payload.
- Timestamp tidak terlalu jauh di masa lalu atau masa depan.
- Rate limit dan idempotency key untuk mencegah duplikasi.
- Audit log untuk perangkat, request, dan hasil validasi.

## Perluasan berikutnya

Tambahkan `devices`, `deviceAssignments`, dan `ingestionEvents` sebagai collection server-managed. Gunakan custom claims atau service credentials hanya di backend, bukan di React client.
