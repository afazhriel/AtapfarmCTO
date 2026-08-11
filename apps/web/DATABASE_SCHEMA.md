# Firestore Data Model

## Top-level collections

### `users/{uid}`
Profil pengguna Firebase Authentication.

```text
uid, displayName, email, photoURL, emailVerified, createdAt, lastLoginAt
```

### `memberships/{farmId_uid}`
Indeks farm per pengguna untuk query login yang aman.

```text
farmId, userId, displayName, email, role, joinedAt, updatedAt
```

### `farms/{farmId}`
Metadata workspace.

```text
name, type, location, ownerId, createdAt, updatedAt, demoSeededAt?
```

## Farm subcollections

### `farms/{farmId}/members/{uid}`
Sumber otorisasi per farm. Role: `owner`, `manager`, `operator`, atau `viewer`.

### `farms/{farmId}/assets/{assetId}`

```text
name, code, category, subtype, status, location, quantity,
tag, healthScore, utilization, lastServiceAt, nextServiceAt,
notes, createdAt, updatedAt
```

Category mendukung `livestock`, `equipment`, `vehicle`, `facility`, `aquaculture`, dan `crop-block`.

### `farms/{farmId}/telemetry/{readingId}`

```text
assetId, assetName, metric, value, unit, status, source,
recordedAt, createdAt, updatedAt
```

### `farms/{farmId}/tasks/{taskId}`

```text
title, type, status, priority, assetId, assetName,
assigneeName, dueAt, notes, completedAt?, createdAt, updatedAt
```

### `farms/{farmId}/alerts/{alertId}`

```text
title, severity, status, assetId, assetName, message,
resolvedAt?, createdAt, updatedAt
```

### `farms/{farmId}/maintenance/{workOrderId}`

```text
title, status, assetId, assetName, scheduledAt, completedAt?,
technician, cost, notes, createdAt, updatedAt
```

### `farms/{farmId}/activities/{activityId}`

```text
action, entity, details, actorId, actorName, createdAt
```

## Security model

- User hanya dapat membaca dan mengubah document profil miliknya.
- User hanya dapat membaca membership index miliknya.
- Farm dapat dibaca hanya apabila document `farms/{farmId}/members/{auth.uid}` tersedia.
- Owner dan manager dapat mengubah metadata farm serta membership non-owner.
- Owner, manager, dan operator dapat mengelola data operasional.
- Viewer hanya membaca.
- Ownership tidak dapat dipindahkan melalui update client biasa.
