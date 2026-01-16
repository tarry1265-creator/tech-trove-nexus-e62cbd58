
# Brainhub Redesign Implementation Plan - Phase 3: Functionality & Features

## 1. State Management
- **Cart Context**: Created `CartContext` to manage cart state with `localStorage` persistence.
- **Wishlist Context**: Created `WishlistContext` to manage wishlist state with `localStorage` persistence.
- **App Wrapper**: Wrapped the root application with `CartProvider` and `WishlistProvider`.

## 2. Feature Implementation
- **Real Cart Count**: Updated `DesktopNav` to display the actual number of items in the cart instead of a dummy "3".
- **Add to Cart**: Updated `ProductCard` to invoke `addToCart` from context, persisting items across sessions.
- **Wishlist Toggle**: Updated `ProductCard` to handle heart icon clicks, adding/removing items from the wishlist and updating the UI state (filled/unfilled heart) instantly.
- **Wishlist Page**: Updated `Wishlist.tsx` to render real items from the Context instead of mocks.
- **Brand Filtering**:
  - Implemented dynamic brand extraction in `DesktopNav`.
  - Added a "Brands" dropdown menu in the navbar.
  - Updated `Products.tsx` to read the `?brand=` URL parameter and filter the product grid accordingly.

## 3. Navigation Cleanups
- Removed dummy data and ensured smoother navigation flows.
