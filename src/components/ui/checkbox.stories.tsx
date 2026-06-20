import type { Meta, StoryObj } from '@storybook/react-vite'
import { Fragment, useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Checkbox, CheckboxGroup, CheckboxGroupItem } from './checkbox'

const meta = {
  title: 'Data Entry/Checkbox',
  component: Checkbox,
  // No `autodocs`: the docs page is the custom MDX (checkbox.mdx), which
  // embeds these stories. Having both would create duplicate Docs entries.
  parameters: {
    docs: {
      description: {
        component:
          'Boolean control built on Radix `Checkbox`. Three chromatic `variant`s, three ' +
          '`size`s, and full support for the `indeterminate` state (renders a minus icon). ' +
          'Always pair it with a `<label>` for accessibility.',
      },
    },
  },
  args: {
    variant: 'default',
    size: 'default',
    disabled: false,
    'aria-label': 'Checkbox',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'destructive'],
      description: 'Chromatic scheme of the box when checked.',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Box and inner icon size.',
      table: { defaultValue: { summary: 'default' } },
    },
    disabled: { control: 'boolean', description: 'Disables the checkbox.' },
    checked: { control: false, description: 'Controlled checked state.' },
    defaultChecked: {
      control: 'boolean',
      description: 'Initial checked state (uncontrolled).',
    },
  },
} satisfies Meta<typeof Checkbox>

export default meta

type Story = StoryObj<typeof meta>

/** Fully interactive — tweak every prop from the **Controls** panel. */
export const Playground: Story = {}

export const Default: Story = {}

/** Every chromatic variant, shown unchecked and checked. */
export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-[auto_repeat(2,auto)] items-center gap-x-6 gap-y-3">
      <span className="text-muted-foreground text-sm">variant</span>
      <span className="text-muted-foreground text-sm">off</span>
      <span className="text-muted-foreground text-sm">on</span>

      {(['default', 'success', 'destructive'] as const).map((variant) => (
        <Fragment key={variant}>
          <code className="text-sm">{variant}</code>
          <Checkbox variant={variant} aria-label={`${variant} off`} />
          <Checkbox variant={variant} defaultChecked aria-label={`${variant} on`} />
        </Fragment>
      ))}
    </div>
  ),
}

/** The three sizes side by side (checked state). */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Checkbox size={size} defaultChecked aria-label={size} />
          <code className="text-muted-foreground text-xs">{size}</code>
        </div>
      ))}
    </div>
  ),
}

/** Indeterminate state — renders a minus icon instead of the check. */
export const Indeterminate: Story = {
  args: { checked: 'indeterminate' },
}

/** Paired with a label via `htmlFor`/`id` (clicking the text toggles it). */
export const WithLabel: Story = {
  render: () => (
    <label htmlFor="terms" className="flex items-center gap-2 text-sm">
      <Checkbox id="terms" />I accept the terms and conditions
    </label>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Checkbox disabled aria-label="disabled off" />
      <Checkbox disabled defaultChecked aria-label="disabled on" />
    </div>
  ),
}

/** Invalid state via `aria-invalid` — border/ring turn destructive. */
export const Invalid: Story = {
  args: { 'aria-invalid': true },
}

/** Controlled example: state lives in the parent and reflects on a label. */
export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    return (
      <label htmlFor="controlled-checkbox" className="flex items-center gap-2 text-sm">
        <Checkbox
          id="controlled-checkbox"
          checked={checked}
          onCheckedChange={(value) => setChecked(value === true)}
        />
        {checked ? 'Checked' : 'Unchecked'}
      </label>
    )
  },
}

/** Clicking toggles the state and fires `onCheckedChange`. */
export const TogglesOnClick: Story = {
  args: { onCheckedChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const cb = canvas.getByRole('checkbox')

    await expect(cb).toHaveAttribute('data-state', 'unchecked')
    await userEvent.click(cb)
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true)
    await expect(cb).toHaveAttribute('data-state', 'checked')
  },
}

/** Keyboard: focus + Space toggles the checkbox. */
export const TogglesWithKeyboard: Story = {
  args: { onCheckedChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const cb = canvas.getByRole('checkbox')

    await userEvent.tab()
    await expect(cb).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true)
  },
}

/** Exposes the `checkbox` role and flips `aria-checked` when toggled. */
export const ExposesAriaChecked: Story = {
  args: { onCheckedChange: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const cb = canvas.getByRole('checkbox')

    // Initial unchecked state is reflected in aria-checked.
    await expect(cb).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(cb)
    await expect(cb).toHaveAttribute('aria-checked', 'true')
  },
}

/**
 * Mixed (indeterminate) state: the box reports `aria-checked="mixed"` and the
 * next click resolves it to a fully checked box.
 */
export const IndeterminateResolvesOnClick: Story = {
  args: { onCheckedChange: fn() },
  render: (args) => {
    // Truly controlled: the state starts at `indeterminate` and the click
    // resolves it to `checked`. Reflecting the change in the `checked` prop is
    // what makes the icon stop being the "minus" (without it the state would be stuck).
    const [checked, setChecked] = useState<boolean | 'indeterminate'>('indeterminate')
    return (
      <Checkbox
        {...args}
        checked={checked}
        onCheckedChange={(state) => {
          setChecked(state)
          args.onCheckedChange?.(state)
        }}
      />
    )
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const cb = canvas.getByRole('checkbox')

    await expect(cb).toHaveAttribute('data-state', 'indeterminate')
    await expect(cb).toHaveAttribute('aria-checked', 'mixed')
    // From indeterminate, Radix emits the next state as `true`.
    await userEvent.click(cb)
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true)
    // The controlled state follows along: the checkbox resolves to `checked`.
    await expect(cb).toHaveAttribute('data-state', 'checked')
    await expect(cb).toHaveAttribute('aria-checked', 'true')
  },
}

// List reused by the group stories.
const FRAMEWORKS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
] as const

// Item + label associated by `id`/`htmlFor` (convention of this file's stories).
function Field({ value, label }: { value: string; label: string }) {
  const id = `fw-${value}`
  return (
    <div className="flex items-center gap-2 text-sm">
      <CheckboxGroupItem id={id} value={value} />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}

/**
 * `CheckboxGroup` manages the set of checked values and propagates
 * `variant`/`size`/`disabled` to each `CheckboxGroupItem`.
 */
export const Group: Story = {
  render: () => (
    <CheckboxGroup aria-label="Frameworks" defaultValue={['react']} variant="success">
      {FRAMEWORKS.map((fw) => (
        <Field key={fw.value} value={fw.value} label={fw.label} />
      ))}
    </CheckboxGroup>
  ),
}

/** Items side by side with `orientation="horizontal"`. */
export const GroupHorizontal: Story = {
  render: () => (
    <CheckboxGroup aria-label="Frameworks" orientation="horizontal">
      {FRAMEWORKS.map((fw) => (
        <Field key={fw.value} value={fw.value} label={fw.label} />
      ))}
    </CheckboxGroup>
  ),
}

/** The entire group can be disabled at once. */
export const GroupDisabled: Story = {
  render: () => (
    <CheckboxGroup aria-label="Frameworks" defaultValue={['react']} disabled>
      {FRAMEWORKS.map((fw) => (
        <Field key={fw.value} value={fw.value} label={fw.label} />
      ))}
    </CheckboxGroup>
  ),
}

/**
 * Controlled mode with an indeterminate "select all": the parent checkbox
 * reflects the partial state and toggles all items at once.
 */
export const GroupSelectAll: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['react'])
    const allValues = FRAMEWORKS.map((fw) => fw.value)
    const allChecked = value.length === allValues.length
    const someChecked = value.length > 0 && !allChecked

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Checkbox
            id="select-all"
            checked={allChecked ? true : someChecked ? 'indeterminate' : false}
            onCheckedChange={(state) => setValue(state === true ? [...allValues] : [])}
          />
          <label htmlFor="select-all">Select all</label>
        </div>
        <CheckboxGroup
          aria-label="Frameworks"
          value={value}
          onValueChange={setValue}
          className="ml-6"
        >
          {FRAMEWORKS.map((fw) => (
            <Field key={fw.value} value={fw.value} label={fw.label} />
          ))}
        </CheckboxGroup>
      </div>
    )
  },
}

/** Checking/unchecking items updates the set of values via `onValueChange`. */
export const GroupTogglesItems: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([])
    return (
      <CheckboxGroup aria-label="Frameworks" value={value} onValueChange={setValue}>
        {FRAMEWORKS.map((fw) => (
          <Field key={fw.value} value={fw.value} label={fw.label} />
        ))}
        <output data-testid="value">{value.join(',')}</output>
      </CheckboxGroup>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const out = canvas.getByTestId('value')

    const react = canvas.getByRole('checkbox', { name: 'React' })
    const vue = canvas.getByRole('checkbox', { name: 'Vue' })

    await userEvent.click(react)
    await expect(react).toHaveAttribute('data-state', 'checked')
    await expect(out).toHaveTextContent('react')

    await userEvent.click(vue)
    await expect(out).toHaveTextContent('react,vue')

    // Unchecking removes only the clicked item.
    await userEvent.click(react)
    await expect(react).toHaveAttribute('data-state', 'unchecked')
    await expect(out).toHaveTextContent('vue')
  },
}

/** Disabled checkboxes do not toggle on click. */
export const DisabledDoesNotToggle: Story = {
  args: { disabled: true, onCheckedChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const cb = canvas.getByRole('checkbox')

    // The browser runtime blocks clicks on pointer-events:none; we skip
    // the check only to confirm that the handler does not fire.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(cb)
    await expect(args.onCheckedChange).not.toHaveBeenCalled()
    await expect(cb).toHaveAttribute('data-state', 'unchecked')
  },
}
