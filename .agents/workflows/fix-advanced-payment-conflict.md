---
description: Fix advanced payment vs monthly payment conflict — advanced payments should not block monthly payments for the same month
---

## Problem

A tenant who pays an **advanced payment** for June (marked `isAdvanced: true`) and later pays the **regular monthly rent** for June (marked `isAdvanced: false`) gets blocked with the error: *"One or more months in this selection are already submitted or paid."*

**Root cause**: `submit.controller.js` checks for duplicate payments by `monthIndex` but does NOT distinguish between `isAdvanced: true` and `isAdvanced: false`. So advanced payments and monthly payments for the same month clash.

**User requirement**:
- Advanced payment = standalone record, just stores a date, NOT linked to monthly payment.
- Monthly payment = completely independent from any advanced payment of the same month.
- No changes to monthly payment flow.

---

## Steps

### 1. Fix the duplicate-check query in the backend submit controller

**File**: `server/src/controllers/payment/submit.controller.js`

Change the existing-payment query (lines 36–51) to also match `isAdvanced` of the incoming payment, so advanced records never collide with regular records.

**Before**:
```js
const existing = await Payment.findOne({
  userId: userId,
  status: { $in: ['pending', 'success'] },
  $or: [
    { monthIndex: { $in: finalMonthIndices } },
    { monthIndices: { $in: finalMonthIndices } }
  ]
});
```

**After**:
```js
const isAdvancedPayment = isAdvanced === true || isAdvanced === 'true';
const existing = await Payment.findOne({
  userId: userId,
  isAdvanced: isAdvancedPayment,          // <-- only clash within same type
  status: { $in: ['pending', 'success'] },
  $or: [
    { monthIndex: { $in: finalMonthIndices } },
    { monthIndices: { $in: finalMonthIndices } }
  ]
});
```

Also fix the `existingDue` check below it (lines 54–58) to add `isAdvanced: false` so a regular 'due' entry is only matched for regular payments:

**Before**:
```js
const existingDue = await Payment.findOne({
  userId: userId,
  status: 'due',
  monthIndex: finalMonthIndices[0]
});
```

**After**:
```js
const existingDue = await Payment.findOne({
  userId: userId,
  isAdvanced: isAdvancedPayment,
  status: 'due',
  monthIndex: finalMonthIndices[0]
});
```

---

### 2. Fix the advanced payment modal — use a full date picker instead of month dropdown

**File**: `client/src/Components/TenantPortal/Payment/Payment.jsx`

In the **Advanced Payment Modal** (lines 843–856), replace the `<select>` month dropdown with a full `<input type="date">` so the tenant picks a complete date (day/month/year).

- Store the selected full date in `advancedModal.paymentDate` (new state field).
- When submitting, send `month` as the formatted full date string (e.g. `"2026-08-15"`) and `monthIndex` as `99` (sentinel, advanced payments don't need month-grid matching).
- The advanced payment display in "Your Advanced Bookings" section should show the full date, not just the month name.

---

### 3. Update the `handleSubmitAdvancedPayment` function

In `Payment.jsx`, update `handleSubmitAdvancedPayment` to:
- Use the full date value from the date picker instead of a month name.
- Always send `monthIndex: 99` (or a large sentinel) so it never matches any real monthly slot.
- Send `isAdvanced: 'true'` unchanged.

---

### 4. Verify

**Backend test (manual)**:
1. Log in as a tenant.
2. Submit an **Advanced Payment** (e.g. "2026-08-15"), upload a receipt → should succeed.
3. Now submit the regular **August monthly rent** from the calendar → should NOT be blocked, should succeed with its own pending record.
4. Check the admin panel: two separate records should appear — one with `isAdvanced: true` dated "2026-08-15", one with `isAdvanced: false` for August.
5. Approve both independently — no conflict.

**Regression test**:
1. Submit regular monthly rent for July → should succeed.
2. Try submitting July monthly rent again → should be blocked (same-type duplicate).
3. Submit an advanced payment for July → should succeed (different type, no clash).
