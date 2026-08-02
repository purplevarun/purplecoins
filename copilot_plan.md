## Plan: PurpleCoins "Pro Max" Automation Roadmap

Transaction automation is the headline feature: today's detector only reliably catches SMS/Gmail/WhatsApp bank alerts (not PhonePe/GPay/Paytm's own notifications — a real gap you confirmed in testing, likely due to Android's silent-channel notification filtering introduced in API 31+). Rather than chase that native-app notification bug further, we pivot to **SMS + Gmail as the primary structured capture channels** (these also cover credit-card alerts), add merchant/category learning so prefill gets smarter over time, and layer in budget alerts, local auto-backups, insights, voice quick-add, and both app-shortcuts + a home-screen widget for manual quick-add.

Everything stays "confirm-first" — richer prefill, never silent auto-save.

**Steps**

**Phase 0 — Shared groundwork** *(blocks Phase 1)*
1. Add `merchant_category_rules` and `budget_alert_state` tables directly to [src/database/schema.ts](src/database/schema.ts) as `CREATE TABLE IF NOT EXISTS` (new tables don't need a migrations.ts entry — that file is only for `ALTER TABLE` on existing tables).
2. Extract the amount/keyword parsing logic out of `UpiNotificationListenerService.kt`'s companion object into a new shared `TransactionTextParser.kt`, extended with merchant-name and UTR/reference-number extraction (new regexes, e.g. `(?:at|to|from)\s+([A-Za-z0-9&.\-' ]{2,40})` for merchant).

**Phase 1 — Smarter SMS + Gmail capture** *(top priority, depends on Phase 0)*
3. New `RECEIVE_SMS` permission (least-privilege — real-time broadcast only, not the broader `READ_SMS` history-scan permission) + new `SmsTransactionReceiver.kt` (`BroadcastReceiver` for `SMS_RECEIVED`), registered via [plugins/withUpiNotificationDetector.ts](plugins/withUpiNotificationDetector.ts)'s existing manifest-patch + file-copy pattern.
4. Extend `UpiNotificationListenerService.kt`'s `buildNotificationText()` to also read `EXTRA_TEXT_LINES` (Gmail grouped-notification support) and run the new merchant/reference extraction.
5. Extend `UpiNotificationDetectorModule.kt`'s `consumeDetectedTransaction()` payload + `DetectedTransactionPayload` type in [src/services/upiDetectionService.ts](src/services/upiDetectionService.ts) with `merchant`, `referenceId`, `channel` fields.
6. New [src/services/merchantCategoryService.ts](src/services/merchantCategoryService.ts): suggest category/source from merchant history, record user's choice on save.
7. Extend `TransactionForm` params in [src/types/RootStackParamList.ts](src/types/RootStackParamList.ts) with `prefillCategoryId`/`prefillSourceId`/`prefillMerchant`; wire through `NotificationProvider.tsx`'s `handleDetectedTransactionLaunch` and `TransactionFormScreen.tsx`'s existing prefill `useEffect` (~[TransactionFormScreen.tsx](src/screens/TransactionFormScreen.tsx#L83-L199)).
8. Extend the existing "UPI/card background detection" section in [SettingsScreen.tsx](src/screens/SettingsScreen.tsx#L486) with SMS permission request/status.
9. **Excluded**: further debugging of PhonePe/GPay/Paytm's own notification capture — explicitly deprioritized.

**Phase 2 — Budget overspend alerts** *(parallel with Phase 1)*
10. New `budgetAlertService.ts` modeled directly on `todoReminderService.ts`'s architecture (dynamic `expo-notifications` import, channel setup, permission checks), but "fire now if crossed" instead of future-scheduling — 80%/100% thresholds, deduped via `budget_alert_state`.
11. New settings in `settingsService.ts`; wire into `NotificationProvider.tsx`'s existing foreground sync alongside `syncTodoReminders`; new Settings section mirroring the Todo Reminders UI pattern.

**Phase 3 — Automated local backups** *(parallel, local-only per your call)*
12. Extend `backupService.ts` with a silent `runAutoBackupIfDue()` path using Storage Access Framework for a persisted directory (separate from the existing interactive share-sheet `exportBackup`).
13. New settings (enabled/interval/directory URI/last-backup-at) + "haven't backed up in N days" scheduled notification + new Settings section (folder picker, interval, status).

**Phase 4 — Insights & reporting** *(parallel, lower priority)*
14. New `monthlyRecapService.ts` (prior-month vs prior-prior-month via `analysisService.getAnalysisSummary`) + hand-rolled `exportService.ts` for CSV export (no new dependency — reuses installed `expo-file-system`/`expo-sharing`), entry point in `AnalysisScreen.tsx`.

**Phase 5 — Voice quick-add** *(soft dependency on Phase 1's merchant matching, otherwise parallel)*
15. New dependency `@react-native-voice/voice` + `RECORD_AUDIO` permission; new `voiceQuickAddService.ts` with an intentionally simple v1 parser (digit-based amount extraction, filler-word stripping, reuse merchant/category matching); new mic-entry UI from the home screen's floating add button, navigating into `TransactionForm` prefilled — still requires manual Save.

**Phase 6 — Quick-add entry points** *(independent, both in scope per your choice)*
16. **6a Shortcuts**: evaluate `expo-quick-actions` first (fallback: custom plugin modeled on `withUpiNotificationDetector.ts`); 2-3 static shortcuts (Add Expense/Add Income) deep-linking into `TransactionForm`.
17. **6b Widget**: `react-native-android-widget` + its config plugin, showing month spend + quick-add tap target via a headless `widgetTaskHandler` with its own `expo-sqlite` connection. **Recommend a throwaway static spike before wiring real data** — highest-risk, least-proven item in this stack.

**Relevant files**
- [plugins/withUpiNotificationDetector.ts](plugins/withUpiNotificationDetector.ts) — extend manifest patch + file-copy list for SMS receiver (Phase 1) and shortcuts (6a if hand-rolled).
- [plugins/native-files/java/com/purple/coins/UpiNotificationListenerService.kt](plugins/native-files/java/com/purple/coins/UpiNotificationListenerService.kt), MainActivity.kt, UpiNotificationDetectorModule.kt — extend payload fields; reuse the existing `@Volatile` static-Bundle intent-capture pattern (new parallel field for quick-actions, not touching the existing detected-transaction field).
- [src/services/upiDetectionService.ts](src/services/upiDetectionService.ts), [src/providers/NotificationProvider.tsx](src/providers/NotificationProvider.tsx), [src/screens/TransactionFormScreen.tsx](src/screens/TransactionFormScreen.tsx), [src/types/RootStackParamList.ts](src/types/RootStackParamList.ts) — prefill plumbing for Phases 1/5/6.
- [src/services/todoReminderService.ts](src/services/todoReminderService.ts) — architectural template for `budgetAlertService.ts`/`monthlyRecapService.ts`.
- [src/services/settingsService.ts](src/services/settingsService.ts), [src/services/backupService.ts](src/services/backupService.ts), [src/database/schema.ts](src/database/schema.ts) — extend per phase as noted above.
- [src/screens/SettingsScreen.tsx](src/screens/SettingsScreen.tsx) — new sections per phase, reusing the Todo Reminders/UPI Detection UI patterns (~[L431](src/screens/SettingsScreen.tsx#L431), ~[L486](src/screens/SettingsScreen.tsx#L486)).

**Verification**
1. `bun run typecheck`, `bun run lint`, `bun run test`/`test:coverage` after each phase — new pure-JS services need matching `.test.ts` files following the existing dynamic-import mocking pattern.
2. `bun run expo-check` after adding each new native dependency to catch Expo SDK 56/RN 0.85 compatibility issues early.
3. Native/permission features aren't vitest-testable — need `bun run android:clean` + on-device manual testing: test SMS, Gmail bank alert, budget-threshold crossing, backup file appearing in chosen folder, voice flow, shortcuts, widget.

**Decisions**
- Always-confirm-first: richer prefill only, never silent auto-save.
- SMS+Gmail prioritized over fixing PhonePe/GPay/Paytm notification capture (explicitly excluded from scope now).
- `RECEIVE_SMS` only, not `READ_SMS` (least-privilege).
- Backups: local only, no Google Drive/OAuth.
- Both app shortcuts AND widget in scope, as separate plugins.
- Recurring-transactions engine and receipt OCR: explicitly out of scope (not selected).

**Further Considerations**
1. Build order: recommend Phase 0 → 1 → 2 → 3 → 6a → 4 → 5 → 6b (widget last, highest risk). Open to reordering if you want quick wins first.
2. Widget de-risking: do a throwaway static-content spike before investing in full data-wiring — want that as an explicit early checkpoint, or fold it into Phase 6b directly?
