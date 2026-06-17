import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Design System/Typography',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const HEADINGS = [
  {
    label: 'Display',
    className: 'text-5xl font-extrabold tracking-tight',
    size: '48px / 800',
  },
  {
    label: 'Heading 1',
    className: 'text-4xl font-bold tracking-tight',
    size: '36px / 700',
  },
  {
    label: 'Heading 2',
    className: 'text-3xl font-bold tracking-tight',
    size: '30px / 700',
  },
  { label: 'Heading 3', className: 'text-2xl font-semibold', size: '24px / 600' },
  { label: 'Heading 4', className: 'text-xl font-semibold', size: '20px / 600' },
]

const BODY = [
  { label: 'Lead', className: 'text-lg text-muted-foreground', size: '18px / 400' },
  { label: 'Body', className: 'text-base', size: '16px / 400' },
  { label: 'Small', className: 'text-sm', size: '14px / 400' },
  { label: 'Caption', className: 'text-xs text-muted-foreground', size: '12px / 400' },
]

const SAMPLE = 'The quick brown fox jumps over the lazy dog'

/**
 * The type system uses **Inter** as the single sans-serif family (loaded in
 * `styles.css` and wired to the `--font-sans` token). A geometric, highly
 * legible grotesque that matches the modern analytics feel of the reference.
 */
export const Scale: Story = {
  render: () => (
    <div className="flex flex-col gap-10 p-6">
      <section className="flex flex-col gap-4">
        <h3 className="m-0 text-base font-semibold text-foreground">Headings</h3>
        <div className="flex flex-col divide-y divide-border">
          {HEADINGS.map((h) => (
            <div key={h.label} className="flex items-baseline gap-6 py-3">
              <span className="w-28 shrink-0 text-xs text-muted-foreground">
                {h.size}
              </span>
              <span className={h.className}>{h.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="m-0 text-base font-semibold text-foreground">Body</h3>
        <div className="flex flex-col divide-y divide-border">
          {BODY.map((b) => (
            <div key={b.label} className="flex items-baseline gap-6 py-3">
              <span className="w-28 shrink-0 text-xs text-muted-foreground">
                {b.size}
              </span>
              <span className={b.className}>{SAMPLE}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="m-0 text-base font-semibold text-foreground">Weights</h3>
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          {[
            ['Regular', 'font-normal'],
            ['Medium', 'font-medium'],
            ['Semibold', 'font-semibold'],
            ['Bold', 'font-bold'],
            ['Extrabold', 'font-extrabold'],
          ].map(([label, cls]) => (
            <span key={label} className={`text-2xl ${cls}`}>
              {label}
            </span>
          ))}
        </div>
      </section>
    </div>
  ),
}
