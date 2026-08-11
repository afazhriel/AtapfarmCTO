# User Flow

## 1. Entry dan authentication

```text
Open app
  ├─ Firebase config missing → setup notice
  ├─ Not authenticated → Login / Register / Reset password / Google Sign-In
  └─ Authenticated
       ├─ Email password account not verified → verification reminder
       ├─ No farm membership → onboarding
       └─ Has farm membership → dashboard
```

## 2. Onboarding owner

```text
Create farm metadata
  → atomic Firestore batch
      ├─ farms/{farmId}
      ├─ farms/{farmId}/members/{ownerUid}
      └─ memberships/{farmId_ownerUid}
  → select farm
  → dashboard
  → load demo data or create first asset
```

## 3. Daily operations

```text
Register / monitor asset
  → telemetry arrives or is entered manually
  → dashboard updates through onSnapshot
  → threshold warning can create alert
  → operator verifies condition
  → manager creates or assigns task
  → task moves Todo → In Progress → Done
  → activity log records the action
```

## 4. Maintenance loop

```text
Asset condition / service interval
  → schedule work order
  → technician performs maintenance
  → mark completed
  → maintenance history updated
  → linked asset status becomes healthy
  → reports reflect cost and asset condition
```

## 5. Multi-farm and role flow

```text
User login
  → query memberships where userId == auth.uid
  → load permitted farm documents
  → select active farm
  → Firestore rules check farm member role for every operation
```

Role behavior:

- Owner: all workspace and membership capabilities.
- Manager: operational management and non-owner membership administration.
- Operator: operational create/update/delete.
- Viewer: read-only dashboards and records.
