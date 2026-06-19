import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test'

import { Button } from './button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer'
import { Input } from './input'

const meta = {
  title: 'UI/Drawer',
  component: Drawer,
  // Sem `autodocs`: a página de docs é a MDX customizada (drawer.mdx), que
  // embute estas stories. Ter ambos geraria entradas de Docs duplicadas.
  parameters: {
    docs: {
      description: {
        component:
          'Panel that slides in from an edge of the viewport, built on `vaul`. Use it for ' +
          'secondary content — filters, details, navigation, a short form — that should ' +
          'overlay the page without taking over the whole screen. The `direction` prop ' +
          '(`bottom` | `top` | `left` | `right`) sets the anchored edge. Compose with ' +
          '`DrawerTrigger`, `DrawerContent` (optional `showCloseButton`), `DrawerHeader`/' +
          '`Footer`, `DrawerTitle`/`Description`, and `DrawerClose`. Focus is trapped and ' +
          '`Escape`, the close button, or an overlay click dismiss it. Each story starts ' +
          'closed — click the trigger to open the drawer.',
      },
    },
    // As histórias de demonstração/interação começam fechadas: o Chromatic só
    // veria o trigger, então não vale snapshot. A cobertura visual fica nas
    // histórias `Visual*` (abertas), que reativam o snapshot individualmente.
    chromatic: { disableSnapshot: true },
  },
} satisfies Meta<typeof Drawer>

export default meta

type Story = StoryObj<typeof meta>

const onSave = fn()

/* --------------------------------------------------------------------------
 * Render stories (começam fechadas) — uma por composição.
 * O conteúdo é portado para document.body: nas play functions use `screen`.
 * -------------------------------------------------------------------------- */

/** Fully interactive — open the drawer from the bottom edge, edit and confirm or dismiss. */
export const Playground: Story = {
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Edit profile</DrawerTitle>
            <DrawerDescription>
              Update your details. Changes are saved when you confirm.
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-2 px-4">
            <Input aria-label="Name" defaultValue="Ada Lovelace" />
          </div>
          <DrawerFooter>
            <Button>Save changes</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  ),
}

/** `direction="right"` anchors the drawer to the right edge — a common side panel. */
export const FromRight: Story = {
  render: (args) => (
    <Drawer {...args} direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">Open panel</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Refine the results shown in the list.</DrawerDescription>
        </DrawerHeader>
        <div className="grid gap-2 px-4">
          <Input aria-label="Search" placeholder="Search…" />
        </div>
        <DrawerFooter>
          <Button>Apply</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

/** `direction="left"` anchors the drawer to the left edge — often used for navigation. */
export const FromLeft: Story = {
  render: (args) => (
    <Drawer {...args} direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Jump to a section of the app.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

/** Holds a short form; the primary action calls a handler before closing. */
export const WithForm: Story = {
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger asChild>
        <Button variant="outline">Add member</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add member</DrawerTitle>
            <DrawerDescription>Invite someone to your workspace.</DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-2 px-4">
            <Input aria-label="Email" placeholder="name@example.com" type="email" />
          </div>
          <DrawerFooter>
            <Button onClick={onSave}>Send invite</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  ),
}

/**
 * `showCloseButton={false}` hides the corner "X"; the drawer is then dismissed
 * only by its own footer controls (or `Escape` / overlay click).
 */
export const WithoutCloseButton: Story = {
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger asChild>
        <Button variant="outline">Subscribe</Button>
      </DrawerTrigger>
      <DrawerContent showCloseButton={false}>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Subscribe to updates</DrawerTitle>
            <DrawerDescription>
              We'll email you when something important happens.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Subscribe</Button>
            <DrawerClose asChild>
              <Button variant="outline">Not now</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  ),
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions que SÃO os testes de regressão.
 * Conteúdo portado: busque o drawer e os botões via `screen`, não `canvas`.
 * -------------------------------------------------------------------------- */

/** Clicking the trigger opens the drawer and exposes `role="dialog"`. */
export const OpensOnTrigger: Story = {
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>Update your details.</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // O drawer começa fechado: nada portado ainda.
    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: 'Edit profile' }))
    const drawer = await screen.findByRole('dialog')
    await expect(drawer).toBeVisible()
    // O drawer é nomeado pelo título e descrito pela descrição (vaul/Radix faz o wiring).
    await expect(drawer).toHaveAccessibleName('Edit profile')
    await expect(drawer).toHaveAccessibleDescription('Update your details.')
    // Fecha para a story não terminar aberta (evita aria-hidden-focus com o trigger).
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  },
}

/** The corner close button dismisses the drawer. */
export const CloseButtonDismisses: Story = {
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>Update your details.</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Edit profile' }))
    await screen.findByRole('dialog')
    // O "X" expõe o nome acessível "Close" (via sr-only).
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  },
}

/** Pressing `Escape` closes the drawer. */
export const EscapeDismisses: Story = {
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>Update your details.</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Edit profile' }))
    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  },
}

/**
 * Focus is trapped inside the drawer while open (Tab cycles within it) and returns to the
 * trigger on close. Unlike Radix `Dialog`, `vaul` does not auto-move focus into the content
 * on open — it keeps focus on the trigger until the user navigates in.
 */
export const FocusIsTrappedAndReturns: Story = {
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>Update your details.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Edit profile' })
    await userEvent.click(trigger)
    const drawer = await screen.findByRole('dialog')
    // Tab move o foco para dentro do drawer e o trap o mantém lá.
    await userEvent.tab()
    await waitFor(() =>
      expect(drawer).toContainElement(document.activeElement as HTMLElement),
    )
    // Ao fechar, o foco retorna ao trigger.
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

/** With `showCloseButton={false}` the corner "X" is not rendered. */
export const HidesCloseButton: Story = {
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger asChild>
        <Button variant="outline">Subscribe</Button>
      </DrawerTrigger>
      <DrawerContent showCloseButton={false}>
        <DrawerHeader>
          <DrawerTitle>Subscribe to updates</DrawerTitle>
          <DrawerDescription>Stay in the loop.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Subscribe</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Subscribe' }))
    await screen.findByRole('dialog')
    // Sem o "X": não há botão "Close" no conteúdo.
    await expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    // A ação do rodapé ainda fecha o drawer.
    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  },
}

/* --------------------------------------------------------------------------
 * Fixtures de regressão visual (Chromatic): renderizam o drawer aberto
 * (`defaultOpen`, sem trigger — evita a violação `aria-hidden-focus` e a
 * poluição da docs). Ocultas do sidebar/docs (`!dev`/`!autodocs`), mas seguem
 * rodando como smoke test (tag `test`) e reativam o snapshot que o meta desliga.
 * -------------------------------------------------------------------------- */
const visual = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: false } },
} satisfies Partial<Story>

/** Captura visual — drawer padrão (ancorado embaixo) aberto. */
export const VisualBottom: Story = {
  ...visual,
  render: (args) => (
    <Drawer {...args} defaultOpen>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Edit profile</DrawerTitle>
            <DrawerDescription>
              Update your details. Changes are saved when you confirm.
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-2 px-4">
            <Input aria-label="Name" defaultValue="Ada Lovelace" />
          </div>
          <DrawerFooter>
            <Button>Save changes</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  ),
}

/** Captura visual — drawer ancorado à direita (painel lateral). */
export const VisualRight: Story = {
  ...visual,
  render: (args) => (
    <Drawer {...args} defaultOpen direction="right">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Refine the results shown in the list.</DrawerDescription>
        </DrawerHeader>
        <div className="grid gap-2 px-4">
          <Input aria-label="Search" placeholder="Search…" />
        </div>
        <DrawerFooter>
          <Button>Apply</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

/** Captura visual — sem o botão de fechar ("X" oculto). */
export const VisualWithoutCloseButton: Story = {
  ...visual,
  render: (args) => (
    <Drawer {...args} defaultOpen>
      <DrawerContent showCloseButton={false}>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Subscribe to updates</DrawerTitle>
            <DrawerDescription>
              We'll email you when something important happens.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Subscribe</Button>
            <DrawerClose asChild>
              <Button variant="outline">Not now</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  ),
}
