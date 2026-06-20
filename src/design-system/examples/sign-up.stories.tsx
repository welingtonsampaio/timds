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
 * **Sign Up** — a step beyond Login: more fields, a password-strength meter
 * (`Progress`) that reacts to input, reveal/hide password with
 * `InputGroupButton` and a data-driven `Select` for the user's role.
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
  { value: 'eng', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'product', label: 'Product' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'other', label: 'Other' },
]

// Password strength: 0–4 → label + Progress color variant.
function strengthOf(value: string) {
  let score = 0
  if (value.length >= 8) score++
  if (/[A-Z]/.test(value)) score++
  if (/[0-9]/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  const levels = [
    { label: 'Very weak', variant: 'destructive' as const },
    { label: 'Weak', variant: 'destructive' as const },
    { label: 'Fair', variant: 'warning' as const },
    { label: 'Good', variant: 'info' as const },
    { label: 'Strong', variant: 'success' as const },
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
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>It takes less than a minute</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="su-name" className="text-sm font-medium">
              Full name
            </label>
            <Input id="su-name" placeholder="Ana Souza" autoComplete="name" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="su-email" className="text-sm font-medium">
              Work email
            </label>
            <Input
              id="su-email"
              type="email"
              placeholder="ana@company.com"
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Role</span>
            <Select
              options={roles}
              placeholder="Select your area..."
              aria-label="Role"
              triggerClassName="w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="su-password" className="text-sm font-medium">
              Password
            </label>
            <InputGroup>
              <InputGroupInput
                id="su-password"
                type={show ? 'text' : 'password'}
                placeholder="Create a password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label={show ? 'Hide password' : 'Show password'}
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
                  aria-label="Password strength"
                />
                <span className="w-20 shrink-0 text-right text-xs font-medium text-muted-foreground">
                  {strength.label}
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Use 8+ characters with letters, numbers and symbols.
              </p>
            )}
          </div>

          <label
            htmlFor="su-terms"
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <Checkbox id="su-terms" className="mt-0.5" />
            <span>
              I agree to the{' '}
              <a href="#termos" className="font-medium text-primary-text hover:underline">
                Terms of Service
              </a>{' '}
              and the{' '}
              <a
                href="#privacidade"
                className="font-medium text-primary-text hover:underline"
              >
                Privacy Policy
              </a>
              .
            </span>
          </label>

          <Button className="w-full">Create account</Button>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="#entrar" className="font-medium text-primary-text hover:underline">
              Sign in
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
    // Typing a strong password moves the meter to "Strong".
    await userEvent.type(canvas.getByLabelText('Password'), 'Sup3r!Pass')
    await expect(canvas.getByText('Strong')).toBeInTheDocument()
    // Revealing the password switches the field type to text.
    await userEvent.click(canvas.getByRole('button', { name: 'Show password' }))
    await expect(canvas.getByLabelText('Password')).toHaveAttribute('type', 'text')
  },
}
