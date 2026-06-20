import type { Meta, StoryObj } from '@storybook/react-vite'
import { CreditCard, Search, Send } from 'lucide-react'
import { expect, fn, userEvent, within } from 'storybook/test'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from './input-group'

const meta = {
  title: 'Data Entry/InputGroup',
  component: InputGroup,
  // No `autodocs`: the docs page is the custom MDX (input-group.mdx), which embeds
  // these stories. Having both would generate duplicate Docs entries (MultipleIndexingError).
  parameters: {
    docs: {
      description: {
        component:
          'Container that wraps a control (`InputGroupInput`/`InputGroupTextarea`) with ' +
          '**addons** — icons, text or buttons — aligned to either side (`align="inline-start"` / ' +
          '`"inline-end"`) or stacked above/below (`"block-start"` / `"block-end"`). Focus and ' +
          'error states propagate from the inner control to the whole group. Clicking an addon ' +
          'focuses the control.',
      },
    },
  },
  argTypes: {
    children: {
      control: false,
      description:
        'Inner control (`InputGroupInput`/`InputGroupTextarea`) plus any `InputGroupAddon`s.',
    },
  },
} satisfies Meta<typeof InputGroup>

export default meta

type Story = StoryObj<typeof meta>

/* --------------------------------------------------------------------------
 * Render stories — one per composition/visual state (render-tested + axe).
 * -------------------------------------------------------------------------- */

/** Leading icon addon — the classic search field. */
export const Default: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search…" aria-label="Search" />
    </InputGroup>
  ),
}

/** Text addons act as prefix/suffix (e.g. a URL field). */
export const WithText: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="mysite" aria-label="Domain" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>.com</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
}

/** A trailing button addon — useful for submit/clear actions inside the field. */
export const WithButton: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <CreditCard />
      </InputGroupAddon>
      <InputGroupInput placeholder="Coupon code" aria-label="Coupon code" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Apply</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

/** `InputGroupTextarea` with a block-aligned addon footer. */
export const WithTextarea: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupTextarea placeholder="Write a comment…" aria-label="Comment" />
      <InputGroupAddon align="block-end">
        <InputGroupText>Markdown supported</InputGroupText>
        <InputGroupButton className="ml-auto" size="sm" variant="default">
          <Send />
          Send
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

/** Error state propagates from the control (`aria-invalid`) to the whole group. */
export const Invalid: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput aria-invalid defaultValue="invalid term" aria-label="Search" />
    </InputGroup>
  ),
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions that ARE the regression tests.
 * Module spies: cleared manually at the start of each play (same approach as button).
 * -------------------------------------------------------------------------- */

const handleApply = fn()
const handleChange = fn()

/** Typing in the inner control updates the value and fires `onChange`. */
export const TypesInControl: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search" onChange={handleChange} />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    handleChange.mockClear()
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'Search' })
    await userEvent.type(input, 'timds')
    await expect(input).toHaveValue('timds')
    await expect(handleChange).toHaveBeenCalled()
  },
}

/** The button addon fires `onClick` when activated. */
export const ButtonClicks: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupInput placeholder="Coupon" aria-label="Coupon" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton onClick={handleApply}>Apply</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    handleApply.mockClear()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Apply' }))
    await expect(handleApply).toHaveBeenCalledOnce()
  },
}

/** Clicking the addon focuses the inner control. */
export const AddonFocusesInput: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon data-testid="search-addon">
        <Search />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search…" aria-label="Search" />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The addon is decorative (no actionable role), so we query by testId.
    const addon = canvas.getByTestId('search-addon')
    await userEvent.click(addon)
    await expect(canvas.getByRole('textbox', { name: 'Search' })).toHaveFocus()
  },
}

/** Tab reaches the inner control, then the trailing button — focus order is left-to-right. */
export const FocusOrder: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupInput placeholder="Coupon" aria-label="Coupon" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Apply</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.tab()
    await expect(canvas.getByRole('textbox', { name: 'Coupon' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Apply' })).toHaveFocus()
  },
}
