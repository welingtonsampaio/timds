import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus } from 'lucide-react'
import * as React from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from './button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  // No `autodocs`: the docs page is the custom MDX (tabs.mdx), which embeds
  // these stories. Having both would generate duplicate Docs entries.
  parameters: {
    docs: {
      description: {
        component:
          'Tabbed navigation built on Radix Tabs. The `TabsList` ships four visual ' +
          'variants — `default` (segmented control), `line` (underlined), `pill` ' +
          '(rounded track with a filled active item) and `card` (folder-style tabs). ' +
          'It also supports `size`, `centered` and `tabPlacement`, while `TabsTrigger` ' +
          'adds `closable`/`closeIcon`/`onClose` for editable tabs.',
      },
    },
  },
  argTypes: {
    defaultValue: {
      control: 'text',
      description: 'Value of the tab selected on mount (uncontrolled).',
    },
    tabPlacement: {
      control: 'inline-radio',
      options: ['top', 'bottom', 'start', 'end'],
      description: 'Placement of the tab bar relative to the content.',
      table: { defaultValue: { summary: 'top' } },
    },
  },
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

/** Fully interactive — switch tabs and tweak props from the **Controls** panel. */
export const Playground: Story = {
  args: { defaultValue: 'home', tabPlacement: 'top' },
  render: (args) => (
    <Tabs {...args} className="w-[420px]">
      <TabsList>
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
      </TabsList>
      <TabsContent value="home">Home tab content.</TabsContent>
      <TabsContent value="products">Products tab content.</TabsContent>
      <TabsContent value="contact">Contact tab content.</TabsContent>
    </Tabs>
  ),
}

/** Rounded pill with a filled active item — mirrors the reference mock. */
export const Pill: Story = {
  render: () => (
    <Tabs defaultValue="home" className="w-fit">
      <TabsList variant="pill">
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
      </TabsList>
      <TabsContent value="home">Home tab content.</TabsContent>
      <TabsContent value="products">Products tab content.</TabsContent>
      <TabsContent value="contact">Contact tab content.</TabsContent>
    </Tabs>
  ),
}

/** The four variants side by side. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {(['default', 'line', 'pill', 'card'] as const).map((variant) => (
        <Tabs key={variant} defaultValue="home" className="w-fit">
          <TabsList variant={variant}>
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          <TabsContent value="home">Home tab content.</TabsContent>
          <TabsContent value="products">Products tab content.</TabsContent>
          <TabsContent value="contact">Contact tab content.</TabsContent>
        </Tabs>
      ))}
    </div>
  ),
}

/** Tab bar positioned on the left (`tabPlacement="start"`). */
export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="home" tabPlacement="start" className="w-fit">
      <TabsList variant="pill">
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
      </TabsList>
      <TabsContent value="home">Home tab content.</TabsContent>
      <TabsContent value="products">Products tab content.</TabsContent>
      <TabsContent value="contact">Contact tab content.</TabsContent>
    </Tabs>
  ),
}

/** A disabled tab cannot be selected. */
export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="home" className="w-fit">
      <TabsList variant="pill">
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="products" disabled>
          Products
        </TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
      </TabsList>
      <TabsContent value="home">Home tab content.</TabsContent>
      <TabsContent value="products">Products tab content.</TabsContent>
      <TabsContent value="contact">Contact tab content.</TabsContent>
    </Tabs>
  ),
}

/** Clicking a tab switches the active panel. */
export const SwitchesTab: Story = {
  render: () => (
    <Tabs defaultValue="home" className="w-[420px]">
      <TabsList variant="pill">
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
      </TabsList>
      <TabsContent value="home">Home tab content.</TabsContent>
      <TabsContent value="products">Products tab content.</TabsContent>
      <TabsContent value="contact">Contact tab content.</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const home = canvas.getByRole('tab', { name: 'Home' })
    await expect(home).toHaveAttribute('data-state', 'active')
    await expect(canvas.getByText('Home tab content.')).toBeVisible()

    await userEvent.click(canvas.getByRole('tab', { name: 'Products' }))
    await expect(canvas.getByRole('tab', { name: 'Products' })).toHaveAttribute(
      'data-state',
      'active',
    )
    await expect(canvas.getByText('Products tab content.')).toBeVisible()
    await expect(home).toHaveAttribute('data-state', 'inactive')
  },
}

/** Keyboard arrows move focus/selection between tabs (WAI-ARIA pattern). */
export const NavigatesWithArrows: Story = {
  render: () => (
    <Tabs defaultValue="home" className="w-[420px]">
      <TabsList variant="pill">
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
      </TabsList>
      <TabsContent value="home">Home tab content.</TabsContent>
      <TabsContent value="products">Products tab content.</TabsContent>
      <TabsContent value="contact">Contact tab content.</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const home = canvas.getByRole('tab', { name: 'Home' })

    // Tab moves focus to the active tab (roving tabindex).
    await userEvent.tab()
    await expect(home).toHaveFocus()

    // Right arrow moves focus and activates the next tab.
    await userEvent.keyboard('{ArrowRight}')
    const products = canvas.getByRole('tab', { name: 'Products' })
    await expect(products).toHaveFocus()
    await expect(products).toHaveAttribute('aria-selected', 'true')
    await expect(canvas.getByText('Products tab content.')).toBeVisible()
  },
}

/** Exposes the `tablist` / `tab` / `tabpanel` roles with the active tab selected. */
export const ExposesTabRoles: Story = {
  render: () => (
    <Tabs defaultValue="home" className="w-[420px]">
      <TabsList variant="line">
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
      </TabsList>
      <TabsContent value="home">Home tab content.</TabsContent>
      <TabsContent value="products">Products tab content.</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('tablist')).toBeInTheDocument()
    await expect(canvas.getAllByRole('tab')).toHaveLength(2)
    // Only the active tab exposes aria-selected="true" and there is a single tabpanel.
    await expect(canvas.getByRole('tab', { name: 'Home' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(canvas.getByRole('tab', { name: 'Products' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Home tab content.')
  },
}

/** A disabled tab does not get selected even when clicked. */
export const DisabledNotSelectable: Story = {
  render: () => (
    <Tabs defaultValue="home" className="w-fit">
      <TabsList variant="pill">
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="products" disabled>
          Products
        </TabsTrigger>
      </TabsList>
      <TabsContent value="home">Home tab content.</TabsContent>
      <TabsContent value="products">Products tab content.</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup({ pointerEventsCheck: 0 })

    await user.click(canvas.getByRole('tab', { name: 'Products' }))
    await expect(canvas.getByRole('tab', { name: 'Products' })).toHaveAttribute(
      'data-state',
      'inactive',
    )
    await expect(canvas.getByRole('tab', { name: 'Home' })).toHaveAttribute(
      'data-state',
      'active',
    )
  },
}

/** Centered tabs spanning the full width. */
export const Centered: Story = {
  render: () => (
    <Tabs defaultValue="home" className="w-[480px]">
      <TabsList variant="line" centered>
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
      </TabsList>
      <TabsContent value="home">Home tab content.</TabsContent>
      <TabsContent value="products">Products tab content.</TabsContent>
      <TabsContent value="contact">Contact tab content.</TabsContent>
    </Tabs>
  ),
}

/** The three preset tab bar sizes. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <Tabs key={size} defaultValue="home" className="w-fit">
          <TabsList variant="pill" size={size}>
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          <TabsContent value="home">Home tab content.</TabsContent>
          <TabsContent value="products">Products tab content.</TabsContent>
          <TabsContent value="contact">Contact tab content.</TabsContent>
        </Tabs>
      ))}
    </div>
  ),
}

/** The four possible tab bar positions. */
export const Placement: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-10">
      {(['top', 'bottom', 'start', 'end'] as const).map((placement) => (
        <Tabs
          key={placement}
          defaultValue="home"
          tabPlacement={placement}
          className="w-fit"
        >
          <TabsList variant="default">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>
          <TabsContent value="home">tabPlacement="{placement}"</TabsContent>
          <TabsContent value="products">Products tab content.</TabsContent>
        </Tabs>
      ))}
    </div>
  ),
}

/** Tabs with a close button (`closable`). */
export const Closable: Story = {
  render: () => (
    <Tabs defaultValue="home" className="w-fit">
      <TabsList variant="card">
        <TabsTrigger value="home" closable>
          Home
        </TabsTrigger>
        <TabsTrigger value="products" closable>
          Products
        </TabsTrigger>
        <TabsTrigger value="contact" closable>
          Contact
        </TabsTrigger>
      </TabsList>
      <TabsContent value="home">Home tab content.</TabsContent>
      <TabsContent value="products">Products tab content.</TabsContent>
      <TabsContent value="contact">Contact tab content.</TabsContent>
    </Tabs>
  ),
}

/** Controlled component that adds and removes tabs dynamically. */
function EditableTabsDemo() {
  const [tabs, setTabs] = React.useState([
    { key: '1', label: 'Tab 1', content: 'Content of Tab Pane 1' },
    { key: '2', label: 'Tab 2', content: 'Content of Tab Pane 2' },
  ])
  const [active, setActive] = React.useState('1')
  const nextKey = React.useRef(2)

  const add = () => {
    nextKey.current += 1
    const key = String(nextKey.current)
    setTabs((prev) => [
      ...prev,
      { key, label: `Tab ${key}`, content: `Content of Tab Pane ${key}` },
    ])
    setActive(key)
  }

  const remove = (key: string) => {
    const index = tabs.findIndex((tab) => tab.key === key)
    const next = tabs.filter((tab) => tab.key !== key)
    setTabs(next)
    if (active === key && next.length > 0) {
      setActive((next[index] ?? next[index - 1] ?? next[0]).key)
    }
  }

  return (
    <div className="flex w-[420px] flex-col gap-3">
      <Button variant="outline" size="sm" icon={<Plus />} onClick={add} className="w-fit">
        ADD
      </Button>
      <Tabs value={active} onValueChange={setActive}>
        <TabsList variant="card">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              closable
              onClose={() => remove(tab.key)}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

/**
 * Editable "card"-style tabs: the **ADD** button inserts a new tab and each
 * tab can be closed via the (x) icon.
 */
export const Editable: Story = {
  render: () => <EditableTabsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getAllByRole('tab')).toHaveLength(2)

    // Adds a new tab and it becomes active.
    await userEvent.click(canvas.getByRole('button', { name: 'ADD' }))
    await expect(canvas.getAllByRole('tab')).toHaveLength(3)
    await expect(canvas.getByText('Content of Tab Pane 3')).toBeVisible()

    // Closes the newly created tab via the X (mouse).
    const tab3 = canvas.getByRole('tab', { name: 'Tab 3' })
    const close = tab3.querySelector<HTMLElement>('[data-slot="tabs-trigger-close"]')
    await expect(close).not.toBeNull()
    await userEvent.click(close as HTMLElement)
    await expect(canvas.getAllByRole('tab')).toHaveLength(2)
    await expect(canvas.getByText('Content of Tab Pane 2')).toBeVisible()

    // Closes the focused tab via the keyboard (Delete) — WAI-ARIA pattern.
    await userEvent.click(canvas.getByRole('tab', { name: 'Tab 1' }))
    await userEvent.keyboard('{Delete}')
    await expect(canvas.getAllByRole('tab')).toHaveLength(1)
  },
}
