# Mobile Redesign Architecture & Implementation Plan

This document outlines the strategy, Standard Operating Procedures (SOPs), and strict execution steps to refactor the Partner Hub for mobile responsiveness. This architecture ensures **zero bleed-through to the existing PC UI** and maintains a lean, AI-friendly codebase.

---

## 1. Core Architectural Concepts & CSS Capabilities

We are abandoning JavaScript-based device detection in favor of native CSS capabilities for SSR compliance, high performance, and caching stability. 

### A. Responsive Breakpoints (The Primary Guard)
In Tailwind CSS, styles are mobile-first by default. Prefixes (`md:`, `lg:`) apply styles *at and above* that breakpoint.
* **Mechanism:** `<div className="block lg:hidden">` (Visible ONLY on mobile devices)
* **Mechanism:** `<div className="hidden lg:block">` (Visible ONLY on PC displays)

### B. Pointer Coarseness (The Redundancy Layer)
Screen width does not always dictate interaction type (e.g., iPad Pro is wide, but still touch-based).
* **Capability:** `@media (pointer: coarse)`
* **Usage:** We will use pointer detection to automatically increase the padding and margins (`tap targets = minimum 44x44px`) on interaction elements specifically when the device possesses a touch screen, regardless of its raw pixel width.

### C. Hover state constraints
Mobile devices cannot accurately trigger CSS `:hover` states, which can cause sticky artifacts on buttons.
* **Capability:** `@media (hover: none)` vs `@media (hover: hover)`
* **Usage:** We will configure Tailwind to only apply hover effects to devices that physically support hovering (mice/trackpads), ensuring touch users get a native interaction experience.

---

## 2. Standard Operating Procedures (SOPs)

To guarantee the client-approved PC UI remains intact and file sizes remain small, all developers (and AI models) must strictly follow the Triage SOP.

### SOP 1: The Triage System (Tier 1 vs. Tier 2)
When approaching a file to make it mobile-responsive, you must categorize it before writing code.

**Use Tier 1 (In-file Tailwind overrides) if:**
* The component's HTML structure remains identical on mobile and PC.
* The only changes required are stacking columns (`grid-cols-4` to `grid-cols-1`) or minor font resizing.
* *Rule:* You MUST prefix the existing PC classes with `md:` or `lg:` to protect them, then write the mobile class unprefixed.

**Use Tier 2 (The Component Split) if:**
* The feature involves a Data Table, a complex Calendar Grid, or heavy layout changes (like sidebars turning into bottom-sheet modals).
* *Rule:* Do not write complex responsive hacks. Separate the file physically.

### SOP 2: Zero PC Bleed-Through Guarantee
Under NO circumstances should the HTML structure of a client-approved Desktop UI be altered. For complex Tier 2 components, the original file is to be completely isolated in a `[Feature]DesktopView.tsx` file and wrapped defensively. If a mobile bug exists, it must be fixed strictly inside `[Feature]MobileView.tsx`.

---

## 3. Step-by-Step Execution Plan

Follow these phases sequentially for any complex module (e.g., Products, Meetings Calendar, Admin Users).

### Phase 1: Preparation & Quarantine
1. **Identify the Target:** Select a complex component (e.g., `ProductsClient.tsx`).
2. **Purge Old Mobile Hacks:** Strip any legacy `sm:`, `md:`, or `flex-wrap` utility classes that were previously attempting (and failing) to make it mobile-friendly. Ensure the desktop layout looks pristine.
3. **Rename & Quarantine:** Rename `ProductsClient.tsx` to `ProductsDesktopView.tsx`. This file is now completely protected.

### Phase 2: Data Hoisting (The Smart Parent)
1. **Create the Wrapper:** Create a new file called `ProductsClientWrapper.tsx`.
2. **Hoist Logic:** Move all data fetching, state hooks (`useState`, `useEffect`), and filter management from the Desktop view up into this new Wrapper.
3. **Pass Props:** Pass the state and data down to the child components as props.

### Phase 3: The Split Routing
1. **Create the Blank Canvas:** Create the new `ProductsMobileView.tsx` file. Add temporary placeholder text.
2. **Deploy the CSS Guards:** Inside your wrapper, mount both components wrapped in strict visibility guards:
```tsx
return (
  <div className="w-full">
    {/* PC Quarantine Wrapper */}
    <div className="hidden lg:block">
      <ProductsDesktopView data={data} filters={filters} />
    </div>

    {/* Mobile Sandbox */}
    <div className="block lg:hidden">
      <ProductsMobileView data={data} filters={filters} />
    </div>
  </div>
);
```

### Phase 4: Native Mobile Rebuild
1. **Build for Touch:** Enter `ProductsMobileView.tsx` and design the UI specifically for a portrait screen. 
2. **Transform Elements:** Convert sprawling data tables into vertical "Details Cards". Convert static left-side menus into hidden hamburger or bottom-drawer menus.
3. **Implement CSS Redundancy:** Ensure critical interactive areas are tied to coarse pointer padding rules to cater to "fat fingers."
