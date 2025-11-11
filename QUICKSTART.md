# 🚀 VA-PC Theme Quick Start

**Get the dark violet neon theme running in 5 minutes**

---

## 📁 Files Created

```
tg-final/
├── app/
│   ├── globals.css                 ✅ CSS variables + @theme + utilities
│   └── theme-demo/
│       └── page.tsx                ✅ Live demo page
├── components/
│   └── ui/
│       ├── button.tsx              ✅ Button with glass + glow
│       ├── card.tsx                ✅ Card with glass + glow
│       └── badge.tsx               ✅ Badge with neon variants
├── lib/
│   ├── utils.ts                    ✅ cn() utility function
│   └── telegram-theme.ts           ✅ Telegram themeParams mapper
├── tailwind.config.ts              ✅ Tailwind v4 configuration
├── components.json                 ✅ shadcn configuration
├── VA-PC-THEME-README.md           ✅ Full documentation
└── QUICKSTART.md                   ✅ This file
```

---

## ⚡ Installation Steps

### 1. Install Dependencies

```bash
npm install tailwindcss@next tailwindcss-animate class-variance-authority clsx tailwind-merge @radix-ui/react-slot lucide-react
```

### 2. Update Root Layout

Add dark mode class to your `app/layout.tsx`:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
```

### 3. Add Telegram Integration (Optional)

If building a Telegram Mini App:

```tsx
'use client';

import { useEffect } from 'react';
import { initTelegramTheme, forceDarkMode } from '@/lib/telegram-theme';

export default function Layout({ children }) {
  useEffect(() => {
    forceDarkMode();
    initTelegramTheme();
  }, []);

  return children;
}
```

### 4. Test the Theme

Visit `/theme-demo` to see all components in action!

---

## 🎨 Usage Examples

### Button

```tsx
import { Button } from '@/components/ui/button';

<Button>Default</Button>
<Button variant="glass">Glass</Button>
<Button variant="neon">Neon Glow</Button>
<Button variant="glass-primary">Glass Primary</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card variant="glass-glow">
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card with glass and glow effects</p>
  </CardContent>
</Card>
```

### Badge

```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="neon">Live</Badge>
<Badge variant="glass-primary">New</Badge>
<Badge variant="glow">Featured</Badge>
```

---

## 🎯 Key Features

- ✅ **Dark Mode First**: Optimized for dark environments
- ✅ **WCAG AA Compliant**: All text combinations ≥4.5:1 contrast
- ✅ **No Yellow**: Pure graphite + electric violet palette
- ✅ **Glass Morphism**: Backdrop blur effects
- ✅ **Neon Glows**: Electric violet glow effects
- ✅ **Telegram Ready**: Auto-maps themeParams
- ✅ **Tailwind v4**: Uses @theme directive + CSS variables
- ✅ **shadcn/ui**: Fully integrated with components

---

## 🎨 Color Tokens

| Token       | Value                 | Usage          |
| ----------- | --------------------- | -------------- |
| `primary`   | oklch(0.55 0.24 290)  | Electric violet|
| `accent`    | oklch(0.70 0.18 290)  | Neon violet    |
| `background`| oklch(0.08 0.015 270) | Deep graphite  |
| `foreground`| oklch(0.95 0.008 270) | Light text     |

---

## 🛠️ Customization

### Adjust Glow Intensity

```css
/* In globals.css */
.dark {
  --glow-intensity: 1.0; /* Default: 0.8 */
}
```

### Change Border Radius

```css
:root {
  --radius: 0.75rem; /* Default: 0.625rem */
}
```

---

## 📚 Documentation

See [VA-PC-THEME-README.md](./VA-PC-THEME-README.md) for:
- Complete component API
- All color tokens
- Accessibility details
- Telegram integration guide
- Custom utilities reference

---

## 🐛 Troubleshooting

### Issue: Colors not applying

**Solution**: Ensure `dark` class is on `<html>` tag:

```tsx
<html lang="en" className="dark">
```

### Issue: Components not found

**Solution**: Check path aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: Tailwind not detecting classes

**Solution**: Verify content paths in `tailwind.config.ts`:

```ts
content: [
  "./app/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
]
```

---

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Dark mode class added to layout
- [ ] Telegram integration configured (if needed)
- [ ] Tested `/theme-demo` page
- [ ] Imported components in your pages
- [ ] Customized theme (optional)

---

## 🎉 You're Ready!

Your VA-PC dark violet neon theme is now active. Start building beautiful, accessible interfaces!

**Next Steps:**
1. Visit `/theme-demo` to see all components
2. Read [VA-PC-THEME-README.md](./VA-PC-THEME-README.md) for details
3. Customize colors in `app/globals.css`
4. Build your Telegram Mini App! 🚀

---

**Questions?** Check the full README or refer to:
- [Tailwind CSS v4 Docs](https://tailwindcss.com)
- [shadcn/ui Docs](https://ui.shadcn.com)
