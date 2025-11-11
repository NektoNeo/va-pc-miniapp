'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { initTelegramTheme, forceDarkMode } from '@/lib/telegram-theme';

/**
 * VA-PC Dark Violet Neon Theme Demo
 *
 * Live demonstration of all theme components and effects
 */
export default function ThemeDemoPage() {
  useEffect(() => {
    forceDarkMode();
    initTelegramTheme();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 space-y-12">
      {/* Header */}
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-glow">VA-PC Dark Violet Neon</h1>
        <p className="text-xl text-muted-foreground">
          Tailwind v4 + shadcn/ui Theme Demo
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="neon">Dark Mode</Badge>
          <Badge variant="glass-primary">WCAG AA</Badge>
          <Badge variant="glass-accent">Telegram Ready</Badge>
        </div>
      </header>

      {/* Buttons Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Button Variants</h2>
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Interactive Buttons</CardTitle>
            <CardDescription>
              All variants with glass morphism and neon glows
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="glass">Glass</Button>
              <Button variant="neon">Neon</Button>
              <Button variant="glass-primary">Glass Primary</Button>
              <Button variant="glass-accent">Glass Accent</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Cards Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Card Variants</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard shadcn card</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Clean and minimal design with subtle borders.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Glass Card</CardTitle>
              <CardDescription>Backdrop blur effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Translucent glass morphism with blur.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="glass" size="sm">
                Action
              </Button>
            </CardFooter>
          </Card>

          <Card variant="glass-glow">
            <CardHeader>
              <CardTitle>Glass Glow</CardTitle>
              <CardDescription>Glass + violet glow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Glass effect with electric violet glow.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="glass-primary" size="sm">
                Action
              </Button>
            </CardFooter>
          </Card>

          <Card variant="neon">
            <CardHeader>
              <CardTitle>Neon Card</CardTitle>
              <CardDescription>Pulsing neon border</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Vibrant neon border with pulse animation.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="neon" size="sm">
                Action
              </Button>
            </CardFooter>
          </Card>

          <Card variant="gradient">
            <CardHeader>
              <CardTitle>Gradient Border</CardTitle>
              <CardDescription>Violet gradient outline</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Subtle gradient border effect.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                Action
              </Button>
            </CardFooter>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Hover for glow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Hover to see the glow animation.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm">
                Action
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Badges Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Badge Variants</h2>
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Status Badges</CardTitle>
            <CardDescription>
              Various badge styles with neon and glass effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="neon">Neon</Badge>
              <Badge variant="neon-solid">Neon Solid</Badge>
              <Badge variant="glass">Glass</Badge>
              <Badge variant="glass-primary">Glass Primary</Badge>
              <Badge variant="glass-accent">Glass Accent</Badge>
              <Badge variant="glow">Glow</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Typography Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Typography</h2>
        <Card variant="glass-glow">
          <CardContent className="space-y-4 pt-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Heading 1</h1>
              <h2 className="text-3xl font-semibold mb-2">Heading 2</h2>
              <h3 className="text-2xl font-medium mb-2">Heading 3</h3>
              <h4 className="text-xl font-medium mb-2">Heading 4</h4>
            </div>
            <div>
              <p className="text-base mb-2">
                Body text with <span className="text-primary font-semibold">primary color</span>{' '}
                and <span className="text-accent font-semibold">accent color</span>.
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Small muted text for secondary information.
              </p>
              <p className="text-xs text-muted-foreground">
                Extra small text for captions and labels.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Effects Showcase */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Special Effects</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glow-primary">
            <CardHeader>
              <CardTitle className="text-glow">Primary Glow</CardTitle>
              <CardDescription>Electric violet glow effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Constant glow with primary color.
              </p>
            </CardContent>
          </Card>

          <Card className="glow-accent glow-pulse">
            <CardHeader>
              <CardTitle className="text-glow">Pulsing Glow</CardTitle>
              <CardDescription>Animated neon pulse</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pulsing animation with accent color.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Color Palette */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Color Palette</h2>
        <Card variant="glass">
          <CardHeader>
            <CardTitle>VA-PC Brand Colors</CardTitle>
            <CardDescription>Graphite + Electric Violet (No Yellow)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-background border" />
                <p className="text-xs font-mono">background</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-card border" />
                <p className="text-xs font-mono">card</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-primary glow-primary" />
                <p className="text-xs font-mono">primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-accent glow-accent" />
                <p className="text-xs font-mono">accent</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-secondary" />
                <p className="text-xs font-mono">secondary</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-muted" />
                <p className="text-xs font-mono">muted</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-destructive" />
                <p className="text-xs font-mono">destructive</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg border-2 border-border" />
                <p className="text-xs font-mono">border</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-muted-foreground py-8 border-t border-border">
        <p>VA-PC Dark Violet Neon Theme · Tailwind v4 + shadcn/ui</p>
        <p className="mt-2">WCAG AA Compliant · Telegram Ready</p>
      </footer>
    </div>
  );
}
