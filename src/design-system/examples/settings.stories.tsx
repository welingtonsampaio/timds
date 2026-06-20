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
 * **Settings** — a dense settings screen organized by `Tabs`. It shows the
 * pairing of `Card` for sectioning, `Switch` with accessible labels for
 * preferences, `Input`/`Textarea` for fields and a "danger zone" using the
 * `destructive` token.
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

// Preference row: title + description on the left, Switch on the right.
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
        <h1 className="font-bold text-2xl tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, preferences and security.
        </p>
      </header>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">
            <User className="size-4" aria-hidden="true" /> Account
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="size-4" aria-hidden="true" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="size-4" aria-hidden="true" /> Security
          </TabsTrigger>
        </TabsList>

        {/* Account */}
        <TabsContent value="account" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>This information is shown publicly.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarImage src="https://i.pravatar.cc/150?img=47" alt="Ana Souza" />
                  <AvatarFallback className="text-lg">AS</AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Change photo
                  </Button>
                  <Button variant="ghost" size="sm">
                    Remove
                  </Button>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="set-name" label="Name">
                  <Input id="set-name" defaultValue="Ana Souza" />
                </Field>
                <Field id="set-username" label="Username">
                  <Input id="set-username" defaultValue="anasouza" />
                </Field>
              </div>
              <Field id="set-email" label="Email">
                <Input id="set-email" type="email" defaultValue="ana@timds.dev" />
              </Field>
              <Field id="set-bio" label="Bio">
                <Textarea
                  id="set-bio"
                  rows={3}
                  defaultValue="Design Engineer building accessible design systems."
                />
              </Field>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="ghost">Cancel</Button>
              <Button>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose what you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <ToggleRow
                id="notif-product"
                title="Product news"
                description="Releases, improvements and tips."
                defaultChecked
              />
              <Separator />
              <ToggleRow
                id="notif-security"
                title="Security alerts"
                description="Sign-ins and sensitive account changes."
                defaultChecked
              />
              <Separator />
              <ToggleRow
                id="notif-marketing"
                title="Marketing emails"
                description="Occasional promotions and content."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="flex flex-col gap-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Use a strong, unique password for this account.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <Field id="sec-current" label="Current password">
                <Input id="sec-current" type="password" autoComplete="current-password" />
              </Field>
              <Field id="sec-new" label="New password">
                <Input id="sec-new" type="password" autoComplete="new-password" />
              </Field>
              <ToggleRow
                id="sec-2fa"
                title="Two-factor authentication"
                description="Requires a code in addition to your password when signing in."
                defaultChecked
              />
            </CardContent>
            <CardFooter className="justify-end">
              <Button>Update password</Button>
            </CardFooter>
          </Card>

          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive-text">Danger zone</CardTitle>
              <CardDescription>
                Deleting your account is permanent and cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="destructive">Delete account</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Navigate to the notifications tab and toggle a disabled preference.
    await userEvent.click(canvas.getByRole('tab', { name: /Notifications/ }))
    const marketing = canvas.getByRole('switch', { name: 'Marketing emails' })
    await expect(marketing).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(marketing)
    await expect(marketing).toHaveAttribute('aria-checked', 'true')
  },
}
