import type { Meta, StoryObj } from '@storybook/react-vite'

import { SpecimenRow } from './tokens'

const meta = {
  title: 'Design System/Foundations',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const RADII = [
  { label: '--radius-sm', value: 'calc(r - 4px)', cls: 'rounded-sm' },
  { label: '--radius-md', value: 'calc(r - 2px)', cls: 'rounded-md' },
  { label: '--radius-lg', value: '0.75rem (r)', cls: 'rounded-lg' },
  { label: '--radius-xl', value: 'calc(r + 4px)', cls: 'rounded-xl' },
  { label: 'full', value: '9999px', cls: 'rounded-full' },
]

const SPACES = [
  { label: 'space-1', value: '0.25rem', w: 'w-1' },
  { label: 'space-2', value: '0.5rem', w: 'w-2' },
  { label: 'space-3', value: '0.75rem', w: 'w-3' },
  { label: 'space-4', value: '1rem', w: 'w-4' },
  { label: 'space-6', value: '1.5rem', w: 'w-6' },
  { label: 'space-8', value: '2rem', w: 'w-8' },
  { label: 'space-12', value: '3rem', w: 'w-12' },
  { label: 'space-16', value: '4rem', w: 'w-16' },
]

const SHADOWS = [
  { label: 'shadow-sm', cls: 'shadow-sm' },
  { label: 'shadow', cls: 'shadow' },
  { label: 'shadow-md', cls: 'shadow-md' },
  { label: 'shadow-lg', cls: 'shadow-lg' },
  { label: 'shadow-xl', cls: 'shadow-xl' },
]

/**
 * Radius is driven by a single `--radius` token (`0.75rem`); every component
 * derives its corners from the `sm/md/lg/xl` steps. Spacing follows Tailwind's
 * 4px rhythm and shadows stay subtle to keep the dark surfaces flat and clean.
 */
export const All: Story = {
  render: () => (
    <div className="flex flex-col gap-12 p-6">
      <section className="flex flex-col gap-2">
        <h3 className="m-0 text-base font-semibold text-foreground">Border radius</h3>
        {RADII.map((r) => (
          <SpecimenRow key={r.label} label={r.label} value={r.value}>
            <div className={`h-12 w-24 border border-border bg-primary/15 ${r.cls}`} />
          </SpecimenRow>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="m-0 text-base font-semibold text-foreground">Spacing scale</h3>
        {SPACES.map((s) => (
          <SpecimenRow key={s.label} label={s.label} value={s.value}>
            <div className={`h-4 rounded-sm bg-primary ${s.w}`} />
          </SpecimenRow>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="m-0 text-base font-semibold text-foreground">Elevation</h3>
        <div className="flex flex-wrap gap-6">
          {SHADOWS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <div
                className={`h-20 w-20 rounded-lg border border-border bg-card ${s.cls}`}
              />
              <code className="text-xs text-muted-foreground">{s.label}</code>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
}
