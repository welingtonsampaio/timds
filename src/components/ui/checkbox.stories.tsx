import type { Meta, StoryObj } from '@storybook/react-vite'
import { Fragment, useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Checkbox, CheckboxGroup, CheckboxGroupItem } from './checkbox'

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  // Sem `autodocs`: a página de docs é a MDX customizada (checkbox.mdx), que
  // embute estas stories. Ter ambos geraria entradas de Docs duplicadas.
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
      <Checkbox id="terms" />
      Aceito os termos e condições
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
        {checked ? 'Marcado' : 'Desmarcado'}
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

    // Estado inicial desmarcado é refletido em aria-checked.
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
  args: { checked: 'indeterminate', onCheckedChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const cb = canvas.getByRole('checkbox')

    await expect(cb).toHaveAttribute('data-state', 'indeterminate')
    await expect(cb).toHaveAttribute('aria-checked', 'mixed')
    // A partir de indeterminate, Radix emite o próximo estado como `true`.
    await userEvent.click(cb)
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true)
  },
}

// Lista reutilizada pelas stories de grupo.
const FRAMEWORKS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
] as const

// Item + rótulo associado por `id`/`htmlFor` (convenção das stories deste arquivo).
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
 * `CheckboxGroup` gerencia o conjunto de valores marcados e propaga
 * `variant`/`size`/`disabled` para cada `CheckboxGroupItem`.
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

/** Itens lado a lado com `orientation="horizontal"`. */
export const GroupHorizontal: Story = {
  render: () => (
    <CheckboxGroup aria-label="Frameworks" orientation="horizontal">
      {FRAMEWORKS.map((fw) => (
        <Field key={fw.value} value={fw.value} label={fw.label} />
      ))}
    </CheckboxGroup>
  ),
}

/** O grupo inteiro pode ser desabilitado de uma vez. */
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
 * Modo controlado com um "selecionar todos" indeterminado: o checkbox-pai
 * reflete o estado parcial e alterna todos os itens de uma vez.
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
          <label htmlFor="select-all">Selecionar todos</label>
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

/** Marcar/desmarcar itens atualiza o conjunto de valores via `onValueChange`. */
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

    // Desmarcar remove apenas o item clicado.
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

    // O runtime do browser bloqueia clique em pointer-events:none; ignoramos
    // o check apenas para confirmar que o handler não dispara.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(cb)
    await expect(args.onCheckedChange).not.toHaveBeenCalled()
    await expect(cb).toHaveAttribute('data-state', 'unchecked')
  },
}
