import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bell, Shield, User } from 'lucide-react'
import type { ReactNode } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

/**
 * **Settings** — uma tela densa de configurações organizada por `Tabs`. Mostra o
 * casamento de `Card` para seccionar, `Switch` com rótulos acessíveis para
 * preferências, `Input`/`Textarea` para campos e uma "zona de perigo" usando o
 * token `destructive`.
 */
const meta = {
  title: 'Examples/Settings',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A settings screen split by `Tabs` (account, notifications, security). ' +
          'Each section is a `Card`; preferences are labelled `Switch` rows; the ' +
          'security tab ends with a destructive "danger zone".',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

// Linha de preferência: título + descrição à esquerda, Switch à direita.
function ToggleRow({
  id,
  title,
  description,
  defaultChecked,
}: {
  id: string
  title: string
  description: string
  defaultChecked?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="font-medium text-sm">
          {title}
        </label>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Switch id={id} defaultChecked={defaultChecked} />
    </div>
  )
}

function Field({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-medium text-sm">
        {label}
      </label>
      {children}
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-2">
      <header className="flex flex-col gap-1">
        <h1 className="font-bold text-2xl tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie sua conta, preferências e segurança.
        </p>
      </header>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">
            <User className="size-4" aria-hidden="true" /> Conta
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="size-4" aria-hidden="true" /> Notificações
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="size-4" aria-hidden="true" /> Segurança
          </TabsTrigger>
        </TabsList>

        {/* Conta */}
        <TabsContent value="account" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Estas informações aparecem publicamente.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarImage src="https://i.pravatar.cc/150?img=47" alt="Ana Souza" />
                  <AvatarFallback className="text-lg">AS</AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Trocar foto
                  </Button>
                  <Button variant="ghost" size="sm">
                    Remover
                  </Button>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="set-name" label="Nome">
                  <Input id="set-name" defaultValue="Ana Souza" />
                </Field>
                <Field id="set-username" label="Usuário">
                  <Input id="set-username" defaultValue="anasouza" />
                </Field>
              </div>
              <Field id="set-email" label="E-mail">
                <Input id="set-email" type="email" defaultValue="ana@timds.dev" />
              </Field>
              <Field id="set-bio" label="Bio">
                <Textarea
                  id="set-bio"
                  rows={3}
                  defaultValue="Design Engineer construindo design systems acessíveis."
                />
              </Field>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="ghost">Cancelar</Button>
              <Button>Salvar alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notifications" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Escolha o que deseja receber.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <ToggleRow
                id="notif-product"
                title="Novidades do produto"
                description="Lançamentos, melhorias e dicas."
                defaultChecked
              />
              <Separator />
              <ToggleRow
                id="notif-security"
                title="Alertas de segurança"
                description="Acessos e mudanças sensíveis na conta."
                defaultChecked
              />
              <Separator />
              <ToggleRow
                id="notif-marketing"
                title="E-mails de marketing"
                description="Promoções e conteúdos ocasionais."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security" className="flex flex-col gap-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Senha</CardTitle>
              <CardDescription>
                Use uma senha forte e única para esta conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <Field id="sec-current" label="Senha atual">
                <Input id="sec-current" type="password" autoComplete="current-password" />
              </Field>
              <Field id="sec-new" label="Nova senha">
                <Input id="sec-new" type="password" autoComplete="new-password" />
              </Field>
              <ToggleRow
                id="sec-2fa"
                title="Autenticação em dois fatores"
                description="Exige um código além da senha ao entrar."
                defaultChecked
              />
            </CardContent>
            <CardFooter className="justify-end">
              <Button>Atualizar senha</Button>
            </CardFooter>
          </Card>

          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive-text">Zona de perigo</CardTitle>
              <CardDescription>
                Excluir a conta é permanente e não pode ser desfeito.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="destructive">Excluir conta</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Navega até a aba de notificações e alterna uma preferência desligada.
    await userEvent.click(canvas.getByRole('tab', { name: /Notificações/ }))
    const marketing = canvas.getByRole('switch', { name: 'E-mails de marketing' })
    await expect(marketing).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(marketing)
    await expect(marketing).toHaveAttribute('aria-checked', 'true')
  },
}
