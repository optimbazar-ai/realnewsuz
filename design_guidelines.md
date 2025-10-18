# Real News Platform - Design Guidelines

## Design Approach

**Selected Approach**: Modern News Platform Design System  
Drawing inspiration from Medium, Substack, and The New York Times for content presentation, combined with Linear and Vercel for the admin dashboard interface.

**Core Principles**:
- Content-first hierarchy with exceptional readability for Uzbek text
- Clean, distraction-free reading experience
- Professional news authority through typography and layout
- Efficient dashboard for monitoring automated systems

---

## Color Palette

### Dark Mode (Primary)
- **Background**: 222 8% 8% (deep charcoal)
- **Surface**: 222 8% 12% (elevated cards)
- **Surface Elevated**: 222 8% 16% (modals, dropdowns)
- **Border**: 222 8% 20% (subtle divisions)
- **Text Primary**: 0 0% 95% (main content)
- **Text Secondary**: 0 0% 65% (metadata, timestamps)
- **Text Tertiary**: 0 0% 45% (labels, placeholders)

### Light Mode
- **Background**: 0 0% 98% (soft white)
- **Surface**: 0 0% 100% (pure white cards)
- **Surface Elevated**: 0 0% 100% (modals)
- **Border**: 220 13% 91% (gentle divisions)
- **Text Primary**: 222 47% 11% (rich black)
- **Text Secondary**: 215 14% 34% (metadata)
- **Text Tertiary**: 215 16% 47% (labels)

### Brand & Accent Colors
- **Primary Brand**: 210 100% 50% (trustworthy blue for news authority)
- **Primary Hover**: 210 100% 45%
- **Success**: 142 71% 45% (published status, positive metrics)
- **Warning**: 38 92% 50% (scheduled/pending states)
- **Error**: 0 84% 60% (failed automation, errors)
- **Trend Hot**: 0 100% 67% (trending topic indicator)

---

## Typography

### Font Families
- **Headlines**: "Inter", -apple-system, system-ui, sans-serif (700-800 weight)
- **Body**: "Inter", -apple-system, system-ui, sans-serif (400-500 weight)
- **Monospace**: "JetBrains Mono", "Fira Code", monospace (for API keys, technical data)

### Type Scale
- **Display (Hero Headlines)**: text-5xl md:text-6xl lg:text-7xl, font-bold, leading-tight
- **H1 (Article Titles)**: text-3xl md:text-4xl lg:text-5xl, font-bold, leading-tight
- **H2 (Section Titles)**: text-2xl md:text-3xl, font-semibold, leading-snug
- **H3 (Card Titles)**: text-xl md:text-2xl, font-semibold, leading-snug
- **Body Large**: text-lg md:text-xl, leading-relaxed (article content)
- **Body**: text-base, leading-relaxed (default text)
- **Body Small**: text-sm, leading-normal (metadata, captions)
- **Caption**: text-xs, leading-normal (timestamps, tags)

---

## Layout System

### Spacing Primitives
Core spacing units: **2, 3, 4, 6, 8, 12, 16, 24**
- Use p-4, m-6, gap-8 for consistent rhythm
- Section padding: py-12 md:py-16 lg:py-24
- Component spacing: space-y-6 or space-y-8 for vertical stacks
- Grid gaps: gap-4 for tight grids, gap-6 for card grids, gap-8 for spacious layouts

### Container Strategy
- **Max Width**: max-w-7xl for full-width sections
- **Reading Width**: max-w-3xl for article content (optimal reading)
- **Dashboard Width**: max-w-screen-2xl for admin interface

### Grid Patterns
- **Article Grid**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- **Dashboard Stats**: grid-cols-2 md:grid-cols-4 gap-4
- **Trend Cards**: grid-cols-1 lg:grid-cols-2 gap-6

---

## Component Library

### Navigation
**Public Site Header**:
- Sticky top navigation with blur backdrop
- Logo (left), primary nav links (center), language toggle + search (right)
- Height: h-16, backdrop-blur-lg, border-b border-border

**Admin Dashboard Sidebar**:
- Fixed left sidebar (w-64) with navigation sections
- Sections: Dashboard, Articles, Trends, Settings, System Status
- Active state: bg-surface-elevated with blue left border

### Article Cards
**Featured Article Card**:
- Large image (aspect-[16/9]), title overlay with gradient
- Category badge (top-left), reading time (bottom-right)
- Hover: subtle scale transform and shadow increase

**Standard Article Card**:
- Horizontal layout: thumbnail (left, 120px square), content (right)
- Title (h3), excerpt (2 lines), metadata row (author, date, category)
- Border-b separator between cards in lists

**Trend Card**:
- Icon + trend name (bold), trend score bar visualization
- Sparkline graph showing 24h trend trajectory
- "Generate Article" CTA button (outline variant)

### Dashboard Widgets

**Status Cards**:
- 2x2 grid displaying key metrics
- Large number (text-4xl font-bold), label, change indicator (↑ +12%)
- Color-coded borders: green (positive), red (negative), blue (neutral)

**Activity Timeline**:
- Vertical timeline with dots and connecting lines
- Each entry: timestamp, action type, article title, status badge
- Auto-scroll with latest at top

**System Monitor**:
- Real-time status indicators for: Trend Detection, AI Generation, Publishing Queue
- Traffic light system: green (operational), yellow (degraded), red (error)
- Last sync timestamp displayed

### Forms & Inputs
- All inputs: rounded-lg, border, bg-surface, focus:ring-2 focus:ring-primary
- Text inputs: h-10 px-4
- Textareas: p-4 min-h-32
- Select dropdowns: consistent styling with chevron icon
- Labels: text-sm font-medium mb-2 block

### Buttons
**Primary**: bg-primary text-white hover:bg-primary-hover, h-10 px-6 rounded-lg font-medium
**Secondary**: border-2 border-border bg-transparent hover:bg-surface-elevated
**Outline on Images**: bg-white/10 backdrop-blur-md border border-white/20 text-white (no custom hover - native button states)
**Icon Buttons**: w-10 h-10 flex items-center justify-center rounded-lg

### Data Display

**Article Table**:
- Striped rows (alternate bg-surface)
- Columns: Thumbnail, Title, Status, Trend Score, Published Time, Actions
- Sortable headers, pagination at bottom

**Tags/Badges**:
- Rounded-full px-3 py-1 text-xs font-medium
- Status badges: Published (green), Scheduled (yellow), Draft (gray), Failed (red)
- Category tags: colored background with opacity

### Modals & Overlays
- Centered modal: max-w-2xl, rounded-xl, shadow-2xl
- Backdrop: bg-black/50 backdrop-blur-sm
- Header with title + close button, scrollable content area, footer with actions

---

## Images

### Hero Section (Public Site)
**Large Hero Image**: Full-width hero showcasing latest trending news
- Dimensions: w-full h-[60vh] md:h-[70vh]
- Overlay: Linear gradient from transparent to black/80
- Content overlaid: Main headline, trending topics grid (2x2 small cards)
- Image source: Dynamic - latest high-impact article or curated news imagery

### Article Images
- Featured images: aspect-[16/9] or aspect-[4/3]
- Thumbnail images: Fixed 120x120px squares, object-cover
- All images: rounded-lg, lazy loading enabled

### Dashboard
- Minimal imagery focus - data and functionality priority
- Trend visualization: Use charts/graphs instead of decorative images
- Placeholder states: Illustrated empty states (articles list, no trends)

---

## Page Layouts

### Public Homepage
1. **Hero Section**: Large trending article with overlay text
2. **Trending Now**: Horizontal scroll of trend cards (6-8 items)
3. **Latest Articles**: 3-column grid of article cards
4. **Categories Section**: Tabbed interface showing articles by category
5. **Footer**: Newsletter signup, social links, quick navigation, copyright

### Article Detail Page
- Full-width featured image with breadcrumb overlay
- Centered article content (max-w-3xl)
- Metadata bar: Author, date, reading time, share buttons
- Related articles sidebar (right, on desktop)
- Comments/discussion section at bottom

### Admin Dashboard
- **Sidebar + Main Content** layout
- Dashboard: 4 status cards, activity timeline, system monitor widget
- Articles page: Filter bar (top), data table, bulk actions
- Trends page: Live trend cards grid, "Generate from Trend" workflow
- Settings: Tabbed sections for API keys, publishing schedule, preferences

---

## Interactions & Animations

**Minimal Animation Philosophy** - Use sparingly for feedback only:
- Card hover: transform scale-[1.02] transition-transform duration-200
- Button press: Active state with slight opacity reduction
- Page transitions: None - instant navigation
- Loading states: Simple spinner or skeleton screens (no elaborate animations)
- Notifications: Slide in from top-right, auto-dismiss after 5s

---

## Accessibility & Responsiveness

- Maintain WCAG AA contrast ratios (4.5:1 for body text, 3:1 for large text)
- All interactive elements: min h-10 (44px touch target)
- Focus indicators: 2px ring with offset
- Semantic HTML: proper heading hierarchy, article tags, nav landmarks
- Mobile-first: Single column on mobile, multi-column on md+ breakpoints
- Dark mode toggle: Persistent user preference stored in localStorage