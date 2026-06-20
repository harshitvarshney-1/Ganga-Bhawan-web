# Ganga Bhawan Web - Design System & Development Guide

## Completed Work

### UI Design System Port (June 2026)
The entire application has been redesigned to match the Linear-inspired design system from the ts-desktop project. This is a complete visual overhaul affecting all pages: home, auth (login/register), admin portal, and tenant portal.

## Core Technology Stack

### Design System & Styling
- **CSS Architecture**: OKLCH color space with CSS custom properties (superior accessibility vs hex/RGB)
- **Theme System**: Jotai atoms with localStorage persistence (themeAtom in `src/shared/states/theme.js`)
- **Dark Mode**: Automatic light/dark toggle via .dark class on document.documentElement
- **Color Palette**: Linear design system
  - Light mode: oklch(97.3% 0 0) background, oklch(54.7% 0.156 264) primary
  - Dark mode: oklch(13.8% 0.002 272) background, oklch(21.6% 0.002 272) card
- **Typography**: 13px base font size for dense UI
- **CSS Variables**: All colors accessible via `var(--background)`, `var(--primary)`, etc.

### Component Architecture
- **Theme Provider**: `src/shared/plugins/theme/index.jsx` - Jotai provider wrapper
- **Utilities**: `cn()` function in `src/lib/utils.js` (clsx + tailwind-merge)
- **UI Toggle**: `src/shared/components/atoms/ThemeToggle/ThemeToggle.jsx` - dark/light switcher
- **Animations**: Framer Motion for transitions (all preserved from original)

## Layout Patterns

### Sidebars
- Fixed width: 56px (w-56)
- Colors: `bg-background`, `text-muted-foreground` (inactive), `text-primary` (active)
- Active indicator: motion.div with primary color background
- Font sizes: 13px labels, 10px subtitles

### Dashboard Main Content
- Floating card layout with borders and rounded corners
- Container: `lg:rounded-xl lg:border lg:border-border bg-card`
- Inner grid: `gap-4` spacing
- Responsive: full width on mobile, floating card on lg+ screens

### Top Navigation (44px height)
- Sticky with backdrop blur
- ThemeToggle integrated
- Updated button and search styling with CSS variables

## Key Files

### Configuration
- `src/index.css` - Complete OKLCH variable system with light/dark definitions
- `src/main.jsx` - Wrapped with ThemeProvider and JotaiProvider

### Theme Management
- `src/shared/states/theme.js` - themeAtom (atomWithStorage)
- `src/shared/plugins/theme/index.jsx` - ThemeProvider component

### Updated Components (All Use CSS Variables)

**Sidebars:**
- `src/modules/admin/Sidebar.jsx`
- `src/modules/tenant/Sidebar/Sidebar.jsx`

**Dashboards:**
- `src/modules/admin/AdminDashboard.jsx`
- `src/modules/tenant/TenantDashboard.jsx`

**Navigation:**
- `src/modules/admin/TopNavbar.jsx`
- `src/shared/components/organisms/NavBar/NavBar.jsx`
- `src/shared/components/organisms/NavBar/Logo.jsx` (uses 🏠 emoji)
- `src/shared/components/organisms/NavBar/HyperLinks.jsx`
- `src/shared/components/organisms/NavBar/Buttons.jsx`

**Cards & Modals:**
- `src/modules/admin/TenantCard.jsx` - h-20 gradient strip, profile pic styling
- `src/modules/admin/PaymentHistoryModal.jsx` - bulk color replacement
- `src/modules/tenant/Profile/Profile.jsx` - motion.div containers, detail cards

**Auth Pages:**
- `src/modules/auth/Login/Login.jsx`
- `src/modules/auth/Register/Register.jsx`

**Home Pages:**
- `src/modules/home/Home.jsx`
- `src/modules/home/page1/Hero/Hero.jsx`
- `src/modules/home/page1/Hero/HeroContent.jsx`
- `src/modules/home/page2/About/About.jsx`
- `src/modules/home/page3/Contact/Contact.jsx`

## CSS Variable Reference

### Semantic Colors (All Available in Light & Dark Modes)
- `--background` - Page/section background
- `--foreground` - Primary text color
- `--card` - Card backgrounds (elevated surface)
- `--card-foreground` - Text on cards
- `--primary` - Brand color (Linear purple)
- `--primary-foreground` - Text on primary backgrounds
- `--secondary` - Secondary accent
- `--muted-foreground` - Subdued/helper text
- `--border` - Border color
- `--accent` - Accent/highlight color
- `--destructive` - Error/warning states

### Using CSS Variables
```jsx
className="bg-background text-foreground border border-border"
```

All Tailwind utilities automatically map to CSS variables via `@theme` directive in index.css.

## Common Patterns

### Motion Card
```jsx
<motion.div variants={itemVariants} className="bg-card border border-border rounded-lg p-4">
  {/* content */}
</motion.div>
```

### Icon Container
```jsx
<div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
  <Icon className="w-4 h-4" />
</div>
```

### Detail Label
```jsx
<p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">Label</p>
```

## Development Notes

### Adding New Components
1. Use CSS variable colors: `bg-background`, `text-foreground`, etc.
2. Wrap theme-aware components in motion.div if animating
3. Import `cn` from `src/lib/utils.js` for className composition
4. Use 13px base for dense UI consistency

### Maintaining Dark Mode
- The theme system automatically applies/removes `.dark` class
- All CSS variables have dark mode definitions
- No need to add dark: prefixes - variables handle it

### Typography
- Headlines: text-xl, text-lg font-bold
- Body: text-[14px] or text-[13px]
- Labels: text-[10px] or text-[12px] text-muted-foreground
- Use tracking-[0.06em] or tracking-[0.15em] for letter spacing

## Status

✅ Complete - All pages converted to Linear design system  
✅ Dark/light mode toggle working  
✅ OKLCH color space implemented  
✅ Floating card layouts applied  
✅ Animations preserved  
✅ Responsive design maintained  

**App is running cleanly at http://localhost:5173 with no console errors.**
