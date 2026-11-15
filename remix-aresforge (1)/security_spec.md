# Security Specification & Dirty Dozen Invariants

## 1. Data Invariants
1. **Strict Ownership**: Every document in `/users/{userId}` and its subcollections (`customPrograms`, `workoutSessions`, `nutritionLogs`, `dailyMetrics`) is strictly owned by `request.auth.uid == userId` with verified email (`request.auth.token.email_verified == true`). No cross-user reads or writes are permitted.
2. **Master Gate Integrity**: Subcollection documents (`customPrograms`, `workoutSessions`, `nutritionLogs`, `dailyMetrics`) cannot be created unless the parent `/users/{userId}` profile exists.
3. **Immutable Identity & Creation Timestamps**: `uid`, `userId`, `id`, and `createdAt` cannot be modified after document creation. `createdAt` and `updatedAt` must equal `request.time`.
4. **Bounded Strings & Arrays**: All string lengths and array sizes (`exercises.size() <= 25`, `exercisesSummary.size() <= 25`) are strictly bounded to prevent resource exhaustion.
5. **Path ID Hardening**: Every document ID path variable (`userId`, `programId`, `sessionId`, `entryId`, `dateKey`) is validated with `isValidId` or `isValidDateKey`.
6. **Zero Shadow Fields**: `hasAll` + `hasOnly` on creates and action-based `affectedKeys().hasOnly(...)` on updates block any undeclared fields.

## 2. The "Dirty Dozen" Attack Payloads (All Must Return PERMISSION_DENIED)
1. **Cross-User Read/Write**: Authenticated user `attacker` attempts to read or create `/users/victim/nutritionLogs/entry1`.
2. **Unverified Email Spoof**: Authenticated user with `email_verified: false` attempts to write `/users/attacker`.
3. **Shadow Field Injection on Create**: User creates `/users/u1/customPrograms/p1` with an extra field `isAdmin: true`.
4. **Shadow Field Injection on Update**: User updates `/users/u1` injecting `subscriptionTier: "pro"`.
5. **Identity Spoofing on Subcollection**: User `u1` creates `/users/u1/nutritionLogs/e1` with `userId: "u2"`.
6. **Immutable Field Mutation**: User `u1` updates `/users/u1/customPrograms/p1` trying to change `createdAt` or `userId`.
7. **Client Timestamp Forgery**: User `u1` creates `/users/u1/workoutSessions/s1` with a backdated client `createdAt` instead of `request.time`.
8. **Orphaned Subcollection Write**: User `u1` creates `/users/u1/dailyMetrics/2026-11-14` before parent `/users/u1` exists.
9. **Oversized Array Denial-of-Wallet**: User `u1` creates `/users/u1/customPrograms/p1` with 26 exercises (exceeding limit 25).
10. **Invalid Enum Poisoning**: User `u1` creates `/users/u1/nutritionLogs/e1` with `mealType: "midnight_feast"`.
11. **Malformed Document ID Injection**: User `u1` creates `/users/u1/customPrograms/bad$id/..` with invalid characters or >128 chars.
12. **Out-of-Range Metric Poisoning**: User `u1` updates `/users/u1/dailyMetrics/2026-11-14` with `steps: -500` or `waterMl: 999999`.
