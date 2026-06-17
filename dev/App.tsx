import { Rocket } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../src/components/ui/button'

export function App() {
  const [dark, setDark] = useState(false)

  return (
    <div className={dark ? 'dark' : ''}>
      <main className="bg-background text-foreground min-h-svh">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">timds</h1>
              <p className="text-muted-foreground text-sm">Playground do design system</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setDark((v) => !v)}>
              {dark ? 'Light' : 'Dark'}
            </Button>
          </header>

          <section className="flex flex-wrap items-center gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </section>

          <section className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Lançar">
              <Rocket />
            </Button>
            <Button>
              <Rocket />
              Com ícone
            </Button>
          </section>
        </div>
      </main>
    </div>
  )
}
