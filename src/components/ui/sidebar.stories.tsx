import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Calendar,
  ChevronRight,
  Home,
  Inbox,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
} from 'lucide-react'
import { expect, screen, userEvent, within } from 'storybook/test'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from './sidebar'

// Example data for the story menus.
const nav = [
  { title: 'Home', icon: Home },
  { title: 'Inbox', icon: Inbox },
  { title: 'Calendar', icon: Calendar },
  { title: 'Search', icon: Search },
  { title: 'Settings', icon: Settings },
]

// Main content header: just the trigger and a title. Reused by the stories to
// show where the `SidebarTrigger` lives.
function InsetHeader({ title = 'Dashboard' }: { title?: string }) {
  return (
    <header className="flex h-12 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <span className="text-sm font-medium">{title}</span>
    </header>
  )
}

const meta = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  // No `autodocs`: the docs page is the custom MDX (sidebar.mdx), which embeds
  // these stories. Having both would generate duplicate Docs entries.
  parameters: {
    // The layout fills the entire story iframe; the sidebar's `fixed` anchors to
    // it, so the sidebar and the content (`SidebarInset`) sit side by side.
    layout: 'fullscreen',
    docs: {
      // The Sidebar uses `min-h-svh` + `fixed` positioning: rendered inline on
      // the Docs page, each `<Canvas>` would take up the entire viewport.
      // Rendering it in a fixed-height iframe keeps the blocks compact (the
      // `min-h-svh` now applies against the 480px iframe).
      story: { inline: false, height: '480px' },
      description: {
        component:
          'A composable application sidebar built on a `SidebarProvider` context, with ' +
          'collapsible desktop layouts (`offcanvas` / `icon` / `none`), a mobile off-canvas ' +
          'overlay (via an internal Sheet), and a full kit of building blocks — header, footer, ' +
          'groups, menus, submenus, actions, badges and loading skeletons. State is toggled by ' +
          '`SidebarTrigger`, the rail, or the `Cmd/Ctrl + B` shortcut, and persisted in a cookie. ' +
          'Read `useSidebar()` to drive it from your own UI. Wrap the whole layout in ' +
          '`SidebarProvider` and place page content in `SidebarInset`.',
      },
    },
  },
  argTypes: {
    side: {
      control: 'inline-radio',
      options: ['left', 'right'],
      description: 'Which edge the sidebar is anchored to.',
      table: { defaultValue: { summary: 'left' } },
    },
    variant: {
      control: 'inline-radio',
      options: ['sidebar', 'floating', 'inset'],
      description:
        'Visual treatment: flush `sidebar`, detached `floating` card, or `inset` paired with a framed `SidebarInset`.',
      table: { defaultValue: { summary: 'sidebar' } },
    },
    collapsible: {
      control: 'inline-radio',
      options: ['offcanvas', 'icon', 'none'],
      description:
        'How it collapses on desktop: slide `offcanvas`, shrink to `icon` rail, or `none` (always expanded).',
      table: { defaultValue: { summary: 'offcanvas' } },
    },
  },
} satisfies Meta<typeof Sidebar>

export default meta

type Story = StoryObj<typeof meta>

// Default render: provider + sidebar (receives the args) + content in the inset.
function AppLayout(args: React.ComponentProps<typeof Sidebar>) {
  return (
    <SidebarProvider>
      <Sidebar {...args}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Acme Inc.">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  A
                </div>
                <span className="font-semibold">Acme Inc.</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item, i) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton tooltip={item.title} isActive={i === 0}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Account">
                <Settings />
                <span>Account</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <InsetHeader />
        <div className="p-4 text-sm text-muted-foreground">Page content</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

/* --------------------------------------------------------------------------
 * Render stories — one per variant / visual state.
 * -------------------------------------------------------------------------- */

/** Fully interactive — tweak `side`, `variant` and `collapsible` from Controls. */
export const Playground: Story = {
  render: (args) => <AppLayout {...args} />,
}

export const Default: Story = {
  render: (args) => <AppLayout {...args} />,
}

/** `floating` detaches the sidebar into a rounded, bordered card. */
export const Floating: Story = {
  args: { variant: 'floating' },
  render: (args) => <AppLayout {...args} />,
}

/** `inset` pairs with a framed `SidebarInset` that floats over the canvas. */
export const Inset: Story = {
  args: { variant: 'inset' },
  render: (args) => <AppLayout {...args} />,
}

/** Anchored to the right edge instead of the left. */
export const RightSide: Story = {
  args: { side: 'right' },
  render: (args) => <AppLayout {...args} />,
}

/** `collapsible="icon"` shrinks to an icon rail instead of sliding away. */
export const CollapsibleIcon: Story = {
  args: { collapsible: 'icon' },
  render: (args) => <AppLayout {...args} />,
}

/** A group label can carry an action (e.g. add a project). */
export const GroupWithAction: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupAction title="Add project" aria-label="Add project">
              <Plus />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <span>Design system</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <span>Marketing site</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <InsetHeader title="Projects" />
      </SidebarInset>
    </SidebarProvider>
  ),
}

/** Items can expose a per-row action and a count badge. */
export const ActionsAndBadges: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Inbox</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <Inbox />
                    <span>All mail</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>24</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <span>Drafts</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction aria-label="More options" showOnHover>
                    <MoreHorizontal />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <InsetHeader title="Inbox" />
      </SidebarInset>
    </SidebarProvider>
  ),
}

/** Nested navigation with a second level of links. */
export const WithSubmenu: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <ChevronRight />
                    <span>Models</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#" isActive>
                        Genesis
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#">Explorer</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <InsetHeader title="Models" />
      </SidebarInset>
    </SidebarProvider>
  ),
}

/** While the menu loads, render skeleton rows in place of items. */
export const Loading: Story = {
  // The `SidebarMenuSkeleton` uses a random (memoized) width per row — the
  // Chromatic snapshot would be unstable, so we disable it here.
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 5 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static list of placeholders
                  <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <InsetHeader />
      </SidebarInset>
    </SidebarProvider>
  ),
}

/** All the building blocks composed together, for the anatomy reference. */
export const Anatomy: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar collapsible="none" className="border-r">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  A
                </div>
                <span className="font-semibold">Acme Inc.</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.slice(0, 3).map((item, i) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton isActive={i === 0}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {i === 0 && <SidebarMenuBadge>3</SidebarMenuBadge>}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings />
                <span>Account</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <InsetHeader />
        <div className="p-4 text-sm text-muted-foreground">
          SidebarInset · page content
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
}

/* --------------------------------------------------------------------------
 * Interaction tests — no Tailwind in the test project; we assert via role,
 * data-attributes and focus (never computed dimensions/styles).
 * -------------------------------------------------------------------------- */

/** Navigation items are exposed as buttons (and submenu items as links). */
export const RendersNavigation: Story = {
  render: () => <AppLayout />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Home' })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Inbox' })).toBeInTheDocument()
    // The active item sets `data-active` (state hook, not a test hook).
    await expect(canvas.getByRole('button', { name: 'Home' })).toHaveAttribute(
      'data-active',
      'true',
    )
  },
}

/** Clicking `SidebarTrigger` flips the sidebar `data-state`. */
export const TogglesViaTrigger: Story = {
  render: () => <AppLayout />,
  play: async ({ canvasElement }) => {
    // Desktop sidebar container (carries the data-state that drives the layout).
    const sidebar = canvasElement.querySelector('[data-slot="sidebar"]')
    await expect(sidebar).toHaveAttribute('data-state', 'expanded')

    // `SidebarTrigger` and `SidebarRail` share the name "Toggle Sidebar"
    // (both toggle the sidebar); here we trigger the one in the header.
    const trigger = canvasElement.querySelector<HTMLButtonElement>(
      '[data-slot="sidebar-trigger"]',
    )
    if (!trigger) throw new Error('SidebarTrigger not found')

    await userEvent.click(trigger)
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed')

    await userEvent.click(trigger)
    await expect(sidebar).toHaveAttribute('data-state', 'expanded')
  },
}

/** `Cmd/Ctrl + B` toggles the sidebar from anywhere. */
export const TogglesViaKeyboardShortcut: Story = {
  render: () => <AppLayout />,
  play: async ({ canvasElement }) => {
    const sidebar = canvasElement.querySelector('[data-slot="sidebar"]')
    await expect(sidebar).toHaveAttribute('data-state', 'expanded')
    await userEvent.keyboard('{Control>}b{/Control}')
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed')
  },
}

/** Collapsed to icons, a menu button reveals its label as a tooltip on hover. */
export const CollapsedShowsTooltip: Story = {
  render: () => (
    // `defaultOpen={false}` starts from the collapsed state; `icon` keeps the
    // rail visible so the buttons (and their tooltips) exist.
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Home">
                    <Home />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <InsetHeader />
      </SidebarInset>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.hover(canvas.getByRole('button', { name: 'Home' }))
    // The tooltip is portaled to the body; with `delayDuration={0}` it appears immediately.
    const tips = await screen.findAllByRole('tooltip')
    await expect(tips.some((t) => t.textContent?.includes('Home'))).toBe(true)
  },
}
