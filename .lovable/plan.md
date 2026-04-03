## Features to Implement

### 1. Order Confirmation Emails (Resend)
- Store Resend API key as a secret
- Create edge function to send emails via Resend
- Send order confirmation email to user (product name, "you'll be contacted for delivery")
- Send admin notification email to Brainhubtek@gmail.com (user name, product ordered)
- Trigger both emails after successful payment in PaymentSuccess page

### 2. Dispatch Riders Page (`/dispatch`)
- New page showing all orders with status "completed" (paid)
- Each order shows user info and product details
- "Confirm Delivery" button on each order
- Clicking confirm changes order status to "delivered"
- User's Orders page should hide "delivered" orders (they're done)

### 3. Admin Users Management
- Make user count card on Admin dashboard clickable → navigates to /admin/users
- Show full user info (username, avatar, join date)
- Add ban/unban toggle for each user
- Add `is_banned` column to profiles table
- When banned user tries to login, show modal with appeal instructions (email Brainhubtek@gmail.com)

### 4. Admin Password Protection
- Add password gate to admin pages (password: "Brainhubtek")
- Store in localStorage once authenticated for the session
- Show password modal before accessing any admin route

### Database Changes
- Add `is_banned` boolean column to profiles table (default false)
- Orders: use existing status field ("completed" → "delivered" for confirmed deliveries)
