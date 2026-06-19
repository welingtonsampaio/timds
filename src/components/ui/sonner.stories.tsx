import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test'

import { Button } from './button'
import { Toaster, type ToasterProps, toast } from './sonner'

// Spy de módulo para a ação dos toasts (action/cancel). É limpo no início de
// cada play porque vive fora de `meta.args` (que reseta sozinho entre stories).
const onAction = fn()

// Envólucro comum das demos: os gatilhos + um único Toaster por story (evita
// montar dois Toasters, o que duplicaria cada notificação).
function Demo({ children, toaster }: { children: ReactNode; toaster?: ToasterProps }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {children}
      <Toaster {...toaster} />
    </div>
  )
}

const meta = {
  title: 'Feedback/Toaster',
  component: Toaster,
  // Sem `autodocs`: a página de docs é a MDX customizada (sonner.mdx). Ter os
  // dois geraria entradas de Docs duplicadas (MultipleIndexingError).
  parameters: {
    docs: {
      description: {
        component:
          'Toast notifications built on **sonner**. Mount `<Toaster />` once near the app ' +
          'root and fire notifications from anywhere with the imperative `toast` function ' +
          '(`toast`, `toast.success`, `toast.error`, `toast.warning`, `toast.info`, ' +
          '`toast.loading`, `toast.promise`). The wrapper defaults to `richColors` and ' +
          'bottom-right, and maps sonner’s color CSS variables to the design-system tokens ' +
          '(`--success`, `--destructive`, `--warning`, `--info`) so semantic colors adapt to ' +
          'light/dark automatically — without `next-themes`.',
      },
    },
    // Toasts são imperativos e animados: os snapshots determinísticos viriam de
    // dentro de um `play` (portal + animação de entrada = flaky). A cobertura de
    // regressão aqui é comportamental (play functions); o visual fica de fora.
    chromatic: { disableSnapshot: true },
  },
  args: {
    position: 'bottom-right',
    richColors: true,
  },
  argTypes: {
    position: {
      control: 'select',
      options: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
      description: 'Where the stack of toasts is anchored on screen.',
      table: { defaultValue: { summary: 'bottom-right' } },
    },
    richColors: {
      control: 'boolean',
      description:
        'Colorize toasts by type (success/error/warning/info) using the design tokens.',
      table: { defaultValue: { summary: 'true' } },
    },
    closeButton: {
      control: 'boolean',
      description: 'Render an explicit close (×) button on every toast.',
    },
    expand: {
      control: 'boolean',
      description: 'Keep toasts expanded instead of stacking them collapsed.',
    },
    duration: {
      control: 'number',
      description: 'Default auto-dismiss time in ms (per toast can override).',
      table: { defaultValue: { summary: '4000' } },
    },
    visibleToasts: {
      control: 'number',
      description: 'How many toasts are shown at once before older ones collapse.',
      table: { defaultValue: { summary: '3' } },
    },
    theme: {
      control: 'inline-radio',
      options: ['light', 'dark', 'system'],
      description:
        'Sonner’s internal theme. Colors here come from tokens, so this rarely matters; ' +
        'dark mode follows the `.dark` class on an ancestor.',
    },
  },
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

/* ----- Showcase (render-tested + axe) ----- */

/** Fully interactive — tweak the `<Toaster />` props from the **Controls** panel. */
export const Playground: Story = {
  render: (args) => (
    <Demo toaster={args}>
      <Button
        onClick={() =>
          toast('Evento criado', { description: 'Sexta, 23 de maio às 19h' })
        }
      >
        Mostrar toast
      </Button>
    </Demo>
  ),
}

/** One trigger per semantic type. Colors come from the design-system tokens. */
export const Colors: Story = {
  render: (args) => (
    <Demo toaster={args}>
      <Button variant="outline" onClick={() => toast('Notificação neutra')}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success('Alterações salvas')}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error('Falha ao salvar')}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.warning('Cota quase no limite')}>
        Warning
      </Button>
      <Button variant="outline" onClick={() => toast.info('Nova versão disponível')}>
        Info
      </Button>
    </Demo>
  ),
}

/** A primary action (and an optional cancel) rendered inside the toast. */
export const WithAction: Story = {
  render: (args) => (
    <Demo toaster={args}>
      <Button
        onClick={() =>
          toast('Arquivo movido para a lixeira', {
            action: { label: 'Desfazer', onClick: () => onAction() },
          })
        }
      >
        Com ação
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast('Excluir definitivamente?', {
            action: { label: 'Excluir', onClick: () => onAction() },
            cancel: { label: 'Cancelar', onClick: () => onAction() },
            duration: Number.POSITIVE_INFINITY,
          })
        }
      >
        Ação + cancelar
      </Button>
    </Demo>
  ),
}

/** Custom auto-dismiss times via the per-toast `duration` option. */
export const Durations: Story = {
  render: (args) => (
    <Demo toaster={args}>
      <Button variant="outline" onClick={() => toast('Some em 1s', { duration: 1000 })}>
        Curto (1s)
      </Button>
      <Button variant="outline" onClick={() => toast('Some em 10s', { duration: 10000 })}>
        Longo (10s)
      </Button>
    </Demo>
  ),
}

/** Persistent toast (`duration: Infinity`) — only the close button dismisses it. */
export const Persistent: Story = {
  args: { closeButton: true },
  render: (args) => (
    <Demo toaster={args}>
      <Button
        onClick={() =>
          toast('Conexão perdida', {
            description: 'Tentando reconectar…',
            duration: Number.POSITIVE_INFINITY,
          })
        }
      >
        Toast fixo
      </Button>
    </Demo>
  ),
}

/** `toast.promise` swaps loading → success/error as the promise settles. */
export const PromiseToast: Story = {
  render: (args) => (
    <Demo toaster={args}>
      <Button
        onClick={() =>
          toast.promise(new Promise<void>((resolve) => setTimeout(resolve, 800)), {
            loading: 'Salvando…',
            success: 'Tudo salvo!',
            error: 'Não foi possível salvar',
          })
        }
      >
        Salvar
      </Button>
    </Demo>
  ),
}

/* ----- Interaction tests (regression checks) — toasts vão ao document.body,
   então consultamos com `screen`. Cada play limpa toasts pendentes no início. -- */

/** Clicking the trigger renders a toast with the given message. */
export const FiresToast: Story = {
  render: (args) => (
    <Demo toaster={args}>
      <Button onClick={() => toast('Evento criado')}>Mostrar toast</Button>
    </Demo>
  ),
  play: async ({ canvasElement }) => {
    toast.dismiss()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Mostrar toast' }))
    await expect(await screen.findByText('Evento criado')).toBeInTheDocument()
  },
}

/** Each semantic helper tags the toast with its `data-type`. */
export const SemanticType: Story = {
  render: Colors.render,
  play: async ({ canvasElement }) => {
    toast.dismiss()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Success' }))
    await screen.findByText('Alterações salvas')
    // data-type é um atributo estrutural do sonner (não dependemos de CSS).
    await waitFor(() =>
      expect(
        document.querySelector('[data-sonner-toast][data-type="success"]'),
      ).toBeInTheDocument(),
    )
  },
}

/** Clicking the toast action runs its callback. */
export const ActionRunsCallback: Story = {
  render: WithAction.render,
  play: async ({ canvasElement }) => {
    toast.dismiss()
    onAction.mockClear()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Com ação' }))
    await screen.findByText('Arquivo movido para a lixeira')
    await userEvent.click(screen.getByRole('button', { name: 'Desfazer' }))
    await expect(onAction).toHaveBeenCalledOnce()
  },
}

/** A short-duration toast auto-dismisses on its own. */
export const ShortDurationAutoDismisses: Story = {
  render: Durations.render,
  play: async ({ canvasElement }) => {
    toast.dismiss()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Curto (1s)' }))
    await expect(await screen.findByText('Some em 1s')).toBeInTheDocument()
    await waitFor(
      () => expect(screen.queryByText('Some em 1s')).not.toBeInTheDocument(),
      { timeout: 4000 },
    )
  },
}

/** A persistent toast stays until the close button is pressed. */
export const CloseButtonDismisses: Story = {
  args: { closeButton: true },
  render: Persistent.render,
  play: async ({ canvasElement }) => {
    toast.dismiss()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Toast fixo' }))
    await expect(await screen.findByText('Conexão perdida')).toBeInTheDocument()
    // O botão de fechar do sonner expõe aria-label "Close toast".
    await userEvent.click(screen.getByRole('button', { name: 'Close toast' }))
    await waitFor(() =>
      expect(screen.queryByText('Conexão perdida')).not.toBeInTheDocument(),
    )
  },
}

/** `toast.promise` shows loading, then the success message once it resolves. */
export const PromiseResolves: Story = {
  render: PromiseToast.render,
  play: async ({ canvasElement }) => {
    toast.dismiss()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Salvar' }))
    await expect(await screen.findByText('Salvando…')).toBeInTheDocument()
    await expect(
      await screen.findByText('Tudo salvo!', {}, { timeout: 4000 }),
    ).toBeInTheDocument()
  },
}
