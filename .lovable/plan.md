# Improve Dispatch Tracking & Dispatcher Notifications

Right now the dispatch flow is very thin:
- Dispatch portal only shows `completed` orders and lets the rider mark them `delivered` — no proof, no timestamps, no notes, no rider identity.
- Admin Orders page only shows Order ID / Date / Status / Amount — admin can't see who delivered, when, or any proof.
- Dispatchers find out about new orders only by manually opening the portal — no push/email/WhatsApp alert.

This plan fixes all three.

---

## 1. Database changes (one migration)

Add delivery tracking fields to `orders`:
- `delivered_at` (timestamptz, nullable)
- `delivered_by` (text, nullable) — dispatcher name
- `delivery_notes` (text, nullable)
- `delivery_proof_url` (text, nullable) — photo of handover
- `recipient_name` (text, nullable) — who actually received it
- `dispatcher_assigned` (text, nullable)
- `out_for_delivery_at` (timestamptz, nullable)

Add a new `dispatch_events` table for a full audit trail (one row per status change):
- `id`, `order_id`, `event_type` ('assigned' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'failed_attempt'), `notes`, `dispatcher_name`, `created_at`.

Also persist shipping info on the order itself so dispatch can see address/phone (currently it only lives in Flutterwave meta):
- `shipping_name`, `shipping_phone`, `shipping_address`, `shipping_city`, `shipping_state` on `orders`.

Storage: reuse the existing public `repair-images` bucket (or add a new `delivery-proofs` bucket) for handover photos.

RLS: keep existing public-read pattern used elsewhere in the app for the dispatch portal to keep working without auth.

## 2. Dispatch portal (`/dispatch`) upgrades

Replace the single "Confirm Delivery" button with a proper workflow:

1. **Dispatcher login** — instead of just a shared password, ask for the dispatcher's name once after the password (stored in localStorage). Every event they record is tagged with this name.
2. **Order card** now shows:
   - Customer name, phone (click-to-call), full delivery address (with "Open in Maps" link)
   - Items + total
   - Current delivery status badge
3. **Status actions** (buttons that write to `dispatch_events` and update `orders`):
   - "Mark Picked Up"
   - "Out for Delivery"
   - "Mark Delivered" → opens a modal asking for: recipient name, optional notes, optional photo upload (camera capture on mobile)
   - "Failed Attempt" → asks for reason, keeps order active
4. **Filter tabs**: Pending Pickup / Out for Delivery / Delivered Today / Failed.
5. **History view**: show timeline of all `dispatch_events` for each order on expand.

## 3. Admin visibility

In `AdminOrders.tsx`:
- Add columns: Customer, Phone, Delivery Status, Delivered By, Delivered At.
- Click a row to open a detail drawer showing: shipping address, full dispatch event timeline, delivery proof photo, recipient name, notes.
- Add filters for delivery status (All / Awaiting Dispatch / Out for Delivery / Delivered / Failed).
- Add a small KPI card row: "Delivered today", "Out for delivery now", "Awaiting dispatch", "Failed attempts (7d)".
- Add a "Reassign / Reopen" action (admin-only) that flips an order back to pending dispatch if something went wrong.

## 4. Dispatcher notification when an order is placed

After payment success, in addition to the existing customer + admin emails, also notify the dispatcher through two channels:

1. **Email** to a configurable dispatcher address (new secret `DISPATCHER_EMAIL`, defaulting to the admin email if not set). The email contains: customer name, phone (tap-to-call link), full address, items, total, and a deep link `https://<site>/dispatch?order=<id>` that opens the portal directly to that order.
2. **WhatsApp deep link** option: generate a `wa.me` link pre-filled with the order summary so the system can also send it through the existing `+2347068450457` channel manually if desired. (True automated WhatsApp sending requires WhatsApp Business API — out of scope; we'll surface the prefilled link in the admin email so it's one tap to forward.)

Implementation: extend `send-order-emails` to send a third email to the dispatcher with a dispatch-focused template (big address, big phone number, items list, "Open in Dispatch Portal" CTA).

## 5. Checkout → orders persistence

Update `create-flutterwave-checkout` (and the success/verify flow) to persist `shipping_*` fields onto the `orders` row when it's created, so the dispatch portal and admin emails always have the address even if Flutterwave meta is lost.

---

## Technical details

- Files to edit:
  - `src/pages/Dispatch.tsx` — full rebuild of the order card + add status workflow + photo upload + dispatcher name capture.
  - `src/pages/AdminOrders.tsx` — add columns, filters, KPI cards, detail drawer.
  - `supabase/functions/send-order-emails/index.ts` — add dispatcher email + wa.me link.
  - `supabase/functions/create-flutterwave-checkout/index.ts` and `verify-flutterwave-payment/index.ts` — persist shipping fields on the order row.
  - New migration for `orders` columns + `dispatch_events` table + (optional) `delivery-proofs` storage bucket.
- New hook `useDispatchEvents(orderId)` for the timeline.
- Reuse existing toast + tailwind patterns; no new dependencies needed (camera capture uses `<input type="file" accept="image/*" capture="environment">`).

---

## Out of scope (can do later)

- True automated WhatsApp messaging (needs WhatsApp Business API + approval).
- SMS notifications (would need Twilio/Termii secret).
- Customer-facing live tracking page (could be a small follow-up using the same `dispatch_events` data).

Approve this and I'll implement it end-to-end.