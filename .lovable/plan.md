## What we're building

Two related upgrades to the order flow:

1. **Pickup vs Delivery toggle** at checkout — propagated through the order record and into every notification email (customer, admin, dispatcher).
2. **Saved Addresses** — users can save multiple addresses (with optional GPS capture) on the Addresses page and pick a saved address at checkout when "Delivery" is selected.

---

## 1. Pickup vs Delivery — where it appears

The natural moment is **on the Checkout page**, as the very first decision *before* the shipping form. The choice changes what the user sees next:

```text
┌─ Checkout ──────────────────────────────────┐
│ How would you like to receive your order?   │
│  ( ) Delivery — we bring it to you          │
│  ( ) Pickup   — collect at our store        │
└─────────────────────────────────────────────┘
```

- **Delivery selected** → show address picker (saved addresses dropdown + "use new address" form). All address fields required.
- **Pickup selected** → hide address fields; show a small card with the BRAINHUB pickup location + a note ("We'll call you when your order is ready"). Only name + phone required.

A second, lighter prompt is added on the **Cart page** above the "Checkout" button as an early hint ("Delivery or Pickup? You'll choose at checkout") — purely informational, no state.

---

## 2. Data flow & schema

Add one column to `orders`:
- `fulfillment_type text` — `'delivery' | 'pickup'`, default `'delivery'`.

Create a new table `user_addresses`:
- `id uuid pk`
- `user_id uuid` (links to auth user, no FK to auth.users)
- `label text` — e.g. "Home", "Office"
- `recipient_name text`
- `phone text`
- `address text`, `city text`, `state text`
- `latitude numeric`, `longitude numeric` (nullable — only set if user grants location)
- `is_default boolean default false`
- `created_at`, `updated_at`

RLS: users can select/insert/update/delete only their own rows (`auth.uid() = user_id`).

---

## 3. Addresses page rebuild (`src/pages/Addresses.tsx`)

Replace the empty placeholder with a real manager:

- **Saved addresses list** — cards showing label, recipient, full address, phone, "Default" badge, and edit/delete buttons.
- **"Add new address" button** opens a dialog with:
  - Label, recipient name, phone, address, city, state
  - **"Use my current location" button** → calls `navigator.geolocation.getCurrentPosition`, stores lat/lng, and reverse-geocodes via a free service (OpenStreetMap Nominatim — no key needed) to prefill address/city/state. User can edit before saving.
  - "Set as default" checkbox.
- Permission handling: if the user denies location, the form still works manually.

Auth required (already enforced).

---

## 4. Checkout page changes (`src/pages/Checkout.tsx`)

- Add a `fulfillmentType` state at the top, with a clean radio segmented control.
- When `delivery`:
  - Fetch `user_addresses` for the logged-in user.
  - Show a "Deliver to" selector (dropdown of saved addresses + "Enter a new address" option).
  - If a saved address is picked, prefill the existing shipping form fields (read-only by default, "Edit" toggles them).
  - "Save this address for next time" checkbox when entering a new one.
- When `pickup`:
  - Hide address/city/state fields; only require name + phone + email.
  - Show pickup location card.
- Pass `fulfillmentType` to `localStorage` (`checkout_fulfillment`) and forward to `PaymentSuccess`.

---

## 5. PaymentSuccess (`src/pages/PaymentSuccess.tsx`)

- Read `checkout_fulfillment` from localStorage; insert into `orders.fulfillment_type`.
- For pickup orders, set `shipping_address` to a clear marker like `"PICKUP - In-store collection"` so the dispatch portal can filter them out.
- Pass `fulfillmentType` to the `send-order-emails` invocation.

---

## 6. Email function (`supabase/functions/send-order-emails/index.ts`)

Accept new `fulfillmentType` field. In all three email bodies (customer, admin, dispatcher):

- **Customer email**: replace the "Delivery Info" box with either:
  - Delivery: existing "you'll be contacted shortly" message + the delivery address.
  - Pickup: "Collect at our store" + pickup location + "we'll notify you when ready".
- **Admin email**: add a prominent badge — `🚚 DELIVERY` or `🏬 PICKUP` — at the top.
- **Dispatcher email**:
  - Delivery: send as today.
  - Pickup: still send (so dispatch is aware), but replace the action panel with "PICKUP ORDER — no delivery required" and skip the "Open in Dispatch Portal" CTA.

---

## 7. Dispatch portal (small touch)

`AdminOrders.tsx` and `Dispatch.tsx`:
- Show a small `Pickup`/`Delivery` chip on each order row.
- In `Dispatch.tsx`, hide pickup orders from the active delivery queue (they don't need a rider). Admin can still see them on `AdminOrders`.

---

## Technical details

- **Reverse geocoding**: `https://nominatim.openstreetmap.org/reverse?lat=..&lon=..&format=json` — no key required, free for low volume, with a `User-Agent` header. Pure client call from the address dialog.
- **Geolocation**: HTML5 `navigator.geolocation` only triggered when the user clicks the "Use my current location" button (no auto-prompt).
- **Migration**: one migration adds `orders.fulfillment_type` and creates `user_addresses` with RLS.
- **No breaking changes**: existing orders without `fulfillment_type` default to `'delivery'`.
- **Memory update**: revise `mem://constraints/address-logic-preservation` to reflect that the addresses page now supports saved-address management.

---

## Files touched

- New: `supabase/migrations/<timestamp>_pickup_delivery_addresses.sql`
- Edit: `src/pages/Checkout.tsx`, `src/pages/Addresses.tsx`, `src/pages/PaymentSuccess.tsx`, `src/pages/Cart.tsx` (small hint), `src/pages/AdminOrders.tsx`, `src/pages/Dispatch.tsx`
- Edit: `supabase/functions/send-order-emails/index.ts`
- Edit: `src/components/checkout/CheckoutShippingForm.tsx` (accept fulfillmentType, hide fields for pickup, accept saved-address selector)
- Memory: update address constraint memory.

Approve and I'll implement.