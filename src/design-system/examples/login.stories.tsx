import type { Meta, StoryObj } from '@storybook/react-vite'
import { Lock, Mail } from 'lucide-react'
import { expect, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Separator } from '@/components/ui/separator'

/**
 * **Login** — o exemplo mais simples do conjunto. Mostra como uma única `Card`
 * organiza um formulário curto: campos com ícone (`InputGroup`), ações primárias
 * e secundárias, um divisor semântico e provedores sociais. Tudo apoiado nos
 * tokens do design system, sem nenhuma cor solta.
 */
const meta = {
  title: 'Examples/Login',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A focused authentication card composed from `Card`, `InputGroup`, ' +
          '`Button`, `Checkbox` and `Separator`. Inputs are labelled, the ' +
          'icon-only nature of the addons is decorative, and every color comes ' +
          'from a semantic token.',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Lock className="size-5" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">Acesse sua conta</CardTitle>
          <CardDescription>Entre com seu e-mail e senha para continuar</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className="text-sm font-medium">
              E-mail
            </label>
            <InputGroup>
              <InputGroupAddon>
                <Mail className="size-4" aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id="login-email"
                type="email"
                placeholder="voce@exemplo.com"
                autoComplete="email"
              />
            </InputGroup>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-medium">
                Senha
              </label>
              <a
                href="#redefinir"
                className="text-sm font-medium text-primary-text hover:underline"
              >
                Esqueceu?
              </a>
            </div>
            <InputGroup>
              <InputGroupAddon>
                <Lock className="size-4" aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id="login-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </InputGroup>
          </div>

          <label
            htmlFor="login-remember"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Checkbox id="login-remember" defaultChecked /> Manter conectado
          </label>

          <Button className="w-full">Entrar</Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">ou continue com</span>
            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline">GitHub</Button>
            <Button variant="outline">Google</Button>
          </div>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Não tem conta?{' '}
            <a href="#criar" className="font-medium text-primary-text hover:underline">
              Criar agora
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // O título e o CTA principal montam, e o e-mail tem rótulo associado.
    await expect(canvas.getByText('Acesse sua conta')).toBeInTheDocument()
    await expect(canvas.getByLabelText('E-mail')).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  },
}
