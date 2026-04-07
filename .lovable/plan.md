## Implementation Plan

### 1. Fix Flutterwave Beneficiary Name
- Change "TechTrove" to "BRAINHUB TECH" in `create-flutterwave-checkout` edge function
- Fix callback URL to use the published site URL for proper redirect after card payment

### 2. Fix Card Payment Redirect
- Update callback URL in Flutterwave checkout to use the actual site URL instead of localhost
- Ensure `PaymentSuccess` page properly handles Flutterwave's redirect query params

### 3. Pass Phone Number to Admin Email
- Store checkout phone number in localStorage before payment
- Include phone number in the email sent to admin after successful payment via `send-order-emails`

### 4. DIY Repair Page
- Add a "DIY Repair" button on the Repair page (top right)
- Create a new `DIYRepair` page with 2 categories: Phones & Laptops
- Fetch device categories from iFixit API and display them
- Allow users to browse guides for specific devices

### 5. Loyalty Points System
- **Database**: Create `loyalty_points` table with columns: user_id, points_balance, and a `loyalty_transactions` table for history
- **Earning**: On successful payment, calculate points (FLOOR(price × 0.01)) for items > ₦500
- **Profile**: Show points balance on the user's profile page
- **Deduction**: Handle cancellation/refund point deductions

### Order of Implementation
1. Database migration (loyalty points tables)
2. Edge function updates (Flutterwave name, email phone)
3. Frontend updates (all pages)
