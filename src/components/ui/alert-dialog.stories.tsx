import type { Meta, StoryObj } from '@storybook/react-vite'
import { TriangleAlert } from 'lucide-react'
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'
import { Button } from './button'

const meta = {
  title: 'UI/AlertDialog',
  component: AlertDialog,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Modal confirmation dialog built on Radix `AlertDialog`. Unlike a plain Dialog it ' +
          'interrupts the user and expects an explicit choice — use it for destructive or ' +
          'irreversible actions. Compose with `AlertDialogTrigger`, `AlertDialogContent` ' +
          '(`size`: `default` | `sm`), `AlertDialogHeader`/`Footer`, `AlertDialogTitle`/' +
          '`Description`, and the `AlertDialogAction`/`AlertDialogCancel` buttons (both accept ' +
          "the Button's `variant`/`size`). An optional `AlertDialogMedia` slot holds a leading " +
          'icon. Focus is trapped and `Escape`/overlay clicks resolve via Cancel. Each story ' +
          'starts closed — click the trigger to open the dialog.',
      },
    },
    // As histórias de demonstração/interação começam fechadas: o Chromatic só
    // veria o trigger, então não vale snapshot. A cobertura visual fica nas
    // histórias `Visual*` (abertas), que reativam o snapshot individualmente.
    chromatic: { disableSnapshot: true },
  },
} satisfies Meta<typeof AlertDialog>

export default meta

type Story = StoryObj<typeof meta>

const onConfirm = fn()
const onCancel = fn()

/** Fully interactive — open the dialog and pick an action. */
export const Playground: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and
            remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

/** A destructive confirmation — the action uses the Button `destructive` variant. */
export const DestructiveAction: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete project</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            All boards, tasks and history will be lost. This cannot be reversed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep project</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

/** `size="sm"` renders a compact, centered dialog with a two-column footer. */
export const SmallSize: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Discard changes</Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>Your edits will be lost.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Discard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

/** `AlertDialogMedia` adds a leading icon above (or beside) the title. */
export const WithMedia: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Check storage</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TriangleAlert className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Storage almost full</AlertDialogTitle>
          <AlertDialogDescription>
            You are using 92% of your quota. Free up space or upgrade your plan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Later</AlertDialogCancel>
          <AlertDialogAction>Upgrade</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

/** Interaction test: opening the trigger reveals the dialog; Continue confirms and closes it. */
export const ConfirmFlow: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    onConfirm.mockClear()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Delete account' }))
    // O conteúdo é renderizado num portal, fora do canvas — busca no document.
    const dialog = await screen.findByRole('alertdialog')
    await expect(dialog).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await expect(onConfirm).toHaveBeenCalledOnce()
    // Confirmar fecha o diálogo.
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  },
}

/** Interaction test: Cancel dismisses the dialog without confirming. */
export const CancelFlow: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    onConfirm.mockClear()
    onCancel.mockClear()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Delete account' }))
    await screen.findByRole('alertdialog')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await expect(onCancel).toHaveBeenCalledOnce()
    await expect(onConfirm).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  },
}

/**
 * Interaction test: ao abrir, o foco vai para o **Cancel**, não para a action.
 * É o padrão de segurança do WAI-ARIA Alert Dialog — o caminho rápido (Enter)
 * cancela em vez de executar a ação destrutiva. Trava também a ordem dos botões
 * (Cancel antes de Action), evitando regressões.
 */
export const FocusStartsOnCancel: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Delete account' }))
    await screen.findByRole('alertdialog')
    // O foco inicial deve repousar no Cancel, não na action de confirmação.
    const cancel = screen.getByRole('button', { name: 'Cancel' })
    await waitFor(() => expect(cancel).toHaveFocus())
    await expect(screen.getByRole('button', { name: 'Continue' })).not.toHaveFocus()
    // Fecha o diálogo (Escape) para a story não terminar aberta — evita a
    // violação `aria-hidden-focus` com o trigger fora do diálogo.
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  },
}

// Histórias dedicadas à regressão visual (Chromatic): renderizam o diálogo
// aberto (`defaultOpen`, sem trigger — evita a violação `aria-hidden-focus` e a
// poluição da autodocs). Ficam fora da página de docs (`docs.disable`) e
// reativam o snapshot que o `meta` desliga, capturando cada variante em
// light/dark.
const visualParameters = {
  docs: { disable: true },
  chromatic: { disableSnapshot: false },
}

/** Captura visual — diálogo padrão aberto. */
export const VisualDefault: Story = {
  parameters: visualParameters,
  render: (args) => (
    <AlertDialog {...args} defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and
            remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

/** Captura visual — action destrutiva. */
export const VisualDestructive: Story = {
  parameters: visualParameters,
  render: (args) => (
    <AlertDialog {...args} defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            All boards, tasks and history will be lost. This cannot be reversed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep project</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

/** Captura visual — `size="sm"` (compacto, rodapé em duas colunas). */
export const VisualSmall: Story = {
  parameters: visualParameters,
  render: (args) => (
    <AlertDialog {...args} defaultOpen>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>Your edits will be lost.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Discard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

/** Captura visual — com `AlertDialogMedia`. */
export const VisualMedia: Story = {
  parameters: visualParameters,
  render: (args) => (
    <AlertDialog {...args} defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TriangleAlert className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Storage almost full</AlertDialogTitle>
          <AlertDialogDescription>
            You are using 92% of your quota. Free up space or upgrade your plan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Later</AlertDialogCancel>
          <AlertDialogAction>Upgrade</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}
