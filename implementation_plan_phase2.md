
# Brainhub Redesign Implementation Plan - Phase 2: Performance & Optimization

## 1. Performance Optimization
- **Scrollbar Hiding**: Removed native scrollbars globally via CSS (`::-webkit-scrollbar` display none) to create a cleaner, "app-like" feel.
- **Animation Simplification**:
  - Replaced heavy blur filters in `glass-card` with simple borders and opacities.
  - Reduced complex `animate-float` duration.
  - Optimized the Hero section background to use fewer simulated 3D elements and lighter DOM nodes.

## 2. Visual Overhaul (Proton Blue / Cyber Green)
- **Theme Update**:
  - **Background**: Darkened to deep matte black (`220 15% 10%`) for higher contrast.
  - **Primary**: Switched to **Cyan / Proton Blue** (`190 100% 50%`) for high visibility.
  - **Secondary**: Added **Cyber Green** (`150 100% 50%`) accents.
  - **Typography**: Switched to **Space Grotesk** for headings to give a more distinct "sci-fi" tech look.

## 3. UI Refinements
- **Hero Section**:
  - Simplified the background animation to use CSS-based opacity layers instead of heavy framer-motion pulses.
  - Updated visual hierarchy to focus on the "Next-Gen Intelligence" message.
- **Navigation**:
  - Updated icons to `bolt` (lightning) to represent speed and power.
  - Consistent branding across Splash, Login, and DesktopNav.

## 4. Configuration
- Updated `tailwind.config.ts` to include **Space Grotesk**.
- Cleaned up unused CSS utility classes.
