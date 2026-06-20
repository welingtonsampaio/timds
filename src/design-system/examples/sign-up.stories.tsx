import type { Meta, StoryObj } from '@storybook/react-vite'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

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
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Progress } from '@/components/ui/progress'
import { Select } from '@/components/ui/select'

/**
 * **Sign Up** — um passo acima do Login: mais campos, um medidor de força de
 * senha (`Progress`) que reage ao input, revelar/ocultar senha com
 * `InputGroupButton` e um `Select` data-driven para o papel do usuário.
 */
const meta = {
  title: 'Examples/Sign Up',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A registration form that grows the Login pattern: labelled fields, a ' +
          'reveal-password button inside an `InputGroup`, a live password-strength ' +
          '`Progress`, a data-driven `Select` and a terms `Checkbox`.',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const roles = [
  { value: 'eng', label: 'Engenharia' },
  { value: 'design', label: 'Design' },
  { value: 'product', label: 'Produto' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'other', label: 'Outro' },
]

// Força da senha: 0–4 → rótulo + variante de cor do Progress.
function strengthOf(value: string) {
  let score = 0
  if (value.length >= 8) score++
  if (/[A-Z]/.test(value)) score++
  if (/[0-9]/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  const levels = [
    { label: 'Muito fraca', variant: 'destructive' as const },
    { label: 'Fraca', variant: 'destructive' as const },
    { label: 'Razoável', variant: 'warning' as const },
    { label: 'Boa', variant: 'info' as const },
    { label: 'Forte', variant: 'success' as const },
  ][score]
  return { score, ...levels }
}

function SignUpForm() {
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const strength = strengthOf(password)

  return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <UserPlus className="size-5" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">Crie sua conta</CardTitle>
          <CardDescription>Leva menos de um minuto</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="su-name" className="text-sm font-medium">
              Nome completo
            </label>
            <Input id="su-name" placeholder="Ana Souza" autoComplete="name" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="su-email" className="text-sm font-medium">
              E-mail de trabalho
            </label>
            <Input
              id="su-email"
              type="email"
              placeholder="ana@empresa.com"
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Função</span>
            <Select
              options={roles}
              placeholder="Selecione sua área..."
              aria-label="Função"
              triggerClassName="w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="su-password" className="text-sm font-medium">
              Senha
            </label>
            <InputGroup>
              <InputGroupInput
                id="su-password"
                type={show ? 'text' : 'password'}
                placeholder="Crie uma senha"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShow((s) => !s)}
                >
                  {show ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {password ? (
              <div className="flex items-center gap-3">
                <Progress
                  value={(strength.score / 4) * 100}
                  variant={strength.variant}
                  className="flex-1"
                  aria-label="Força da senha"
                />
                <span className="w-20 shrink-0 text-right text-xs font-medium text-muted-foreground">
                  {strength.label}
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Use 8+ caracteres com letras, números e símbolos.
              </p>
            )}
          </div>

          <label
            htmlFor="su-terms"
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <Checkbox id="su-terms" className="mt-0.5" />
            <span>
              Concordo com os{' '}
              <a href="#termos" className="font-medium text-primary-text hover:underline">
                Termos de Serviço
              </a>{' '}
              e a{' '}
              <a
                href="#privacidade"
                className="font-medium text-primary-text hover:underline"
              >
                Política de Privacidade
              </a>
              .
            </span>
          </label>

          <Button className="w-full">Criar conta</Button>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Já tem conta?{' '}
            <a href="#entrar" className="font-medium text-primary-text hover:underline">
              Entrar
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export const Default: Story = {
  render: () => <SignUpForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Digitar uma senha forte move o medidor para "Forte".
    await userEvent.type(canvas.getByLabelText('Senha'), 'Sup3r!Senha')
    await expect(canvas.getByText('Forte')).toBeInTheDocument()
    // Revelar a senha troca o tipo do campo para texto.
    await userEvent.click(canvas.getByRole('button', { name: 'Mostrar senha' }))
    await expect(canvas.getByLabelText('Senha')).toHaveAttribute('type', 'text')
  },
}
