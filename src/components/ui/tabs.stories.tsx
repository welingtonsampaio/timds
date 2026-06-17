import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus } from 'lucide-react'
import * as React from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from './button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
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
      <TabsContent value="home">Conteúdo da aba Home.</TabsContent>
      <TabsContent value="products">Conteúdo da aba Products.</TabsContent>
      <TabsContent value="contact">Conteúdo da aba Contact.</TabsContent>
    </Tabs>
  ),
}

/** Pílula arredondada com item ativo preenchido — espelha o mock de referência. */
export const Pill: Story = {
  render: () => (
    <Tabs defaultValue="home" className="w-fit">
      <TabsList variant="pill">
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
      </TabsList>
      <TabsContent value="home">Conteúdo da aba Home.</TabsContent>
      <TabsContent value="products">Conteúdo da aba Products.</TabsContent>
      <TabsContent value="contact">Conteúdo da aba Contact.</TabsContent>
    </Tabs>
  ),
}

/** As quatro variantes lado a lado. */
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
          <TabsContent value="home">Conteúdo da aba Home.</TabsContent>
          <TabsContent value="products">Conteúdo da aba Products.</TabsContent>
          <TabsContent value="contact">Conteúdo da aba Contact.</TabsContent>
        </Tabs>
      ))}
    </div>
  ),
}

/** Trilho posicionado à esquerda (`tabPlacement="start"`). */
export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="home" tabPlacement="start" className="w-fit">
      <TabsList variant="pill">
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
      </TabsList>
      <TabsContent value="home">Conteúdo da aba Home.</TabsContent>
      <TabsContent value="products">Conteúdo da aba Products.</TabsContent>
      <TabsContent value="contact">Conteúdo da aba Contact.</TabsContent>
    </Tabs>
  ),
}

/** Uma aba desabilitada não pode ser selecionada. */
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
      <TabsContent value="home">Conteúdo da aba Home.</TabsContent>
      <TabsContent value="products">Conteúdo da aba Products.</TabsContent>
      <TabsContent value="contact">Conteúdo da aba Contact.</TabsContent>
    </Tabs>
  ),
}

/** Clicar numa aba troca o painel ativo. */
export const SwitchesTab: Story = {
  render: () => (
    <Tabs defaultValue="home" className="w-[420px]">
      <TabsList variant="pill">
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
      </TabsList>
      <TabsContent value="home">Conteúdo da aba Home.</TabsContent>
      <TabsContent value="products">Conteúdo da aba Products.</TabsContent>
      <TabsContent value="contact">Conteúdo da aba Contact.</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const home = canvas.getByRole('tab', { name: 'Home' })
    await expect(home).toHaveAttribute('data-state', 'active')
    await expect(canvas.getByText('Conteúdo da aba Home.')).toBeVisible()

    await userEvent.click(canvas.getByRole('tab', { name: 'Products' }))
    await expect(canvas.getByRole('tab', { name: 'Products' })).toHaveAttribute(
      'data-state',
      'active',
    )
    await expect(canvas.getByText('Conteúdo da aba Products.')).toBeVisible()
    await expect(home).toHaveAttribute('data-state', 'inactive')
  },
}

/** A aba desabilitada não recebe seleção mesmo ao ser clicada. */
export const DisabledNotSelectable: Story = {
  render: () => (
    <Tabs defaultValue="home" className="w-fit">
      <TabsList variant="pill">
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="products" disabled>
          Products
        </TabsTrigger>
      </TabsList>
      <TabsContent value="home">Conteúdo da aba Home.</TabsContent>
      <TabsContent value="products">Conteúdo da aba Products.</TabsContent>
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

/** Abas centralizadas ocupando toda a largura. */
export const Centered: Story = {
  render: () => (
    <Tabs defaultValue="home" className="w-[480px]">
      <TabsList variant="line" centered>
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
      </TabsList>
      <TabsContent value="home">Conteúdo da aba Home.</TabsContent>
      <TabsContent value="products">Conteúdo da aba Products.</TabsContent>
      <TabsContent value="contact">Conteúdo da aba Contact.</TabsContent>
    </Tabs>
  ),
}

/** Os três tamanhos predefinidos do trilho. */
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
          <TabsContent value="home">Conteúdo da aba Home.</TabsContent>
          <TabsContent value="products">Conteúdo da aba Products.</TabsContent>
          <TabsContent value="contact">Conteúdo da aba Contact.</TabsContent>
        </Tabs>
      ))}
    </div>
  ),
}

/** As quatro posições possíveis do trilho. */
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
          <TabsContent value="products">Conteúdo da aba Products.</TabsContent>
        </Tabs>
      ))}
    </div>
  ),
}

/** Abas com botão de fechar (`closable`). */
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
      <TabsContent value="home">Conteúdo da aba Home.</TabsContent>
      <TabsContent value="products">Conteúdo da aba Products.</TabsContent>
      <TabsContent value="contact">Conteúdo da aba Contact.</TabsContent>
    </Tabs>
  ),
}

/** Componente controlado que adiciona e remove abas dinamicamente. */
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
 * Abas editáveis no estilo "card": o botão **ADD** insere uma nova aba e cada
 * aba pode ser fechada pelo ícone (x).
 */
export const Editable: Story = {
  render: () => <EditableTabsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getAllByRole('tab')).toHaveLength(2)

    // Adiciona uma nova aba e ela fica ativa.
    await userEvent.click(canvas.getByRole('button', { name: 'ADD' }))
    await expect(canvas.getAllByRole('tab')).toHaveLength(3)
    await expect(canvas.getByText('Content of Tab Pane 3')).toBeVisible()

    // Fecha a aba recém-criada pelo X (mouse).
    const tab3 = canvas.getByRole('tab', { name: 'Tab 3' })
    const close = tab3.querySelector<HTMLElement>('[data-slot="tabs-trigger-close"]')
    await expect(close).not.toBeNull()
    await userEvent.click(close as HTMLElement)
    await expect(canvas.getAllByRole('tab')).toHaveLength(2)
    await expect(canvas.getByText('Content of Tab Pane 2')).toBeVisible()

    // Fecha a aba focada pelo teclado (Delete) — padrão WAI-ARIA.
    await userEvent.click(canvas.getByRole('tab', { name: 'Tab 1' }))
    await userEvent.keyboard('{Delete}')
    await expect(canvas.getAllByRole('tab')).toHaveLength(1)
  },
}
