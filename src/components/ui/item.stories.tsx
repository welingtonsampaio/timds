import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  BadgeCheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  PlusIcon,
  ShieldAlertIcon,
} from 'lucide-react'
import { Fragment } from 'react'
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test'

import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from './item'

const meta = {
  title: 'Data Display/Item',
  component: Item,
  // No `autodocs`: the docs page is the custom MDX (item.mdx), which embeds
  // these stories. Having both would produce duplicate Docs entries.
  parameters: {
    docs: {
      description: {
        component:
          'A flexible row primitive for lists, cards, and menus. `Item` lays out a ' +
          'leading `ItemMedia` (icon, avatar or image), a central `ItemContent` ' +
          '(`ItemTitle` + `ItemDescription`), and trailing `ItemActions`. Style it ' +
          'with the `variant` (`default` / `outline` / `muted`) and `size` ' +
          '(`default` / `sm`) props, render it as any element via `asChild`, and ' +
          'stack many with `ItemGroup` + `ItemSeparator`.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'outline', 'muted'],
      description: 'Visual style of the row surface.',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'inline-radio',
      options: ['default', 'sm'],
      description: 'Padding and gap density.',
      table: { defaultValue: { summary: 'default' } },
    },
    asChild: {
      control: 'boolean',
      description:
        'Merge props onto the single child instead of rendering a `div` (e.g. an `a`).',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: { variant: 'outline', size: 'default', asChild: false },
} satisfies Meta<typeof Item>

export default meta

type Story = StoryObj<typeof meta>

/** Fully interactive — tweak `variant`, `size` and `asChild` from **Controls**. */
export const Playground: Story = {
  render: (args) => (
    <Item {...args} className="w-full max-w-md">
      <ItemContent>
        <ItemTitle>Basic Item</ItemTitle>
        <ItemDescription>A simple row with title and description.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" size="sm">
          Action
        </Button>
      </ItemActions>
    </Item>
  ),
}

/** The three surface variants side by side. */
export const Variants: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Item variant="default">
        <ItemContent>
          <ItemTitle>Default</ItemTitle>
          <ItemDescription>Transparent surface, no border.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Open
          </Button>
        </ItemActions>
      </Item>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Outline</ItemTitle>
          <ItemDescription>Bordered, transparent background.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Open
          </Button>
        </ItemActions>
      </Item>
      <Item variant="muted">
        <ItemContent>
          <ItemTitle>Muted</ItemTitle>
          <ItemDescription>Subdued background for secondary rows.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Open
          </Button>
        </ItemActions>
      </Item>
    </div>
  ),
}

/** `default` and the more compact `sm` size. */
export const Sizes: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Item variant="outline" size="default">
        <ItemContent>
          <ItemTitle>Default size</ItemTitle>
          <ItemDescription>Comfortable padding and gap.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="outline" size="sm">
        <ItemContent>
          <ItemTitle>Small size</ItemTitle>
          <ItemDescription>Denser padding for tight lists.</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  ),
}

/** A leading icon via `ItemMedia variant="icon"`. */
export const WithIcon: Story = {
  render: () => (
    <Item variant="outline" className="w-full max-w-lg">
      <ItemMedia variant="icon">
        <ShieldAlertIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Security alert</ItemTitle>
        <ItemDescription>New login detected from an unknown device.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline">
          Review
        </Button>
      </ItemActions>
    </Item>
  ),
}

/** A leading avatar, with an icon-only trailing action. */
export const WithAvatar: Story = {
  render: () => (
    <Item variant="outline" className="w-full max-w-lg">
      <ItemMedia>
        <Avatar className="size-10">
          <AvatarImage src="https://github.com/evilrabbit.png" alt="Evil Rabbit" />
          <AvatarFallback>ER</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Evil Rabbit</ItemTitle>
        <ItemDescription>Last seen 5 months ago</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full"
          aria-label="Invite Evil Rabbit"
        >
          <PlusIcon />
        </Button>
      </ItemActions>
    </Item>
  ),
}

/** A leading image via `ItemMedia variant="image"`. */
export const WithImage: Story = {
  render: () => (
    <Item variant="outline" className="w-full max-w-md">
      <ItemMedia variant="image">
        <img
          src="https://avatar.vercel.sh/midnight"
          alt="Album cover"
          width={40}
          height={40}
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Midnight City Lights</ItemTitle>
        <ItemDescription>Neon Dreams · Electric Nights</ItemDescription>
      </ItemContent>
      <ItemContent className="flex-none text-center">
        <ItemDescription>3:45</ItemDescription>
      </ItemContent>
    </Item>
  ),
}

/** `asChild` renders the row as a link, keeping the layout. */
export const AsLink: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Item variant="outline" asChild>
        <a href="#docs">
          <ItemContent>
            <ItemTitle>Visit our documentation</ItemTitle>
            <ItemDescription>
              Learn how to get started with the components.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <ChevronRightIcon className="size-4" />
          </ItemActions>
        </a>
      </Item>
      <Item variant="outline" asChild>
        <a href="https://example.com" target="_blank" rel="noopener noreferrer">
          <ItemContent>
            <ItemTitle>External resource</ItemTitle>
            <ItemDescription>
              Opens in a new tab with security attributes.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <ExternalLinkIcon className="size-4" />
          </ItemActions>
        </a>
      </Item>
    </div>
  ),
}

/** A compact verified-profile row, again as a link. */
export const Compact: Story = {
  render: () => (
    <Item variant="outline" size="sm" asChild className="w-full max-w-md">
      <a href="#profile">
        <ItemMedia>
          <BadgeCheckIcon className="size-5" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Your profile has been verified.</ItemTitle>
        </ItemContent>
        <ItemActions>
          <ChevronRightIcon className="size-4" />
        </ItemActions>
      </a>
    </Item>
  ),
}

const people = [
  {
    username: 'shadcn',
    avatar: 'https://github.com/shadcn.png',
    email: 'shadcn@vercel.com',
  },
  {
    username: 'maxleiter',
    avatar: 'https://github.com/maxleiter.png',
    email: 'maxleiter@vercel.com',
  },
  {
    username: 'evilrabbit',
    avatar: 'https://github.com/evilrabbit.png',
    email: 'evilrabbit@vercel.com',
  },
]

/** `ItemGroup` stacks rows; `ItemSeparator` divides them. */
export const Group: Story = {
  render: () => (
    <ItemGroup className="w-full max-w-md">
      {people.map((person, index) => (
        <Fragment key={person.username}>
          <Item role="listitem">
            <ItemMedia>
              <Avatar>
                <AvatarImage src={person.avatar} alt={person.username} />
                <AvatarFallback>{person.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent className="gap-1">
              <ItemTitle>{person.username}</ItemTitle>
              <ItemDescription>{person.email}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label={`Add ${person.username}`}
              >
                <PlusIcon />
              </Button>
            </ItemActions>
          </Item>
          {index !== people.length - 1 && <ItemSeparator />}
        </Fragment>
      ))}
    </ItemGroup>
  ),
}

const songs = [
  {
    title: 'Midnight City Lights',
    artist: 'Neon Dreams',
    album: 'Electric Nights',
    duration: '3:45',
  },
  {
    title: 'Coffee Shop Conversations',
    artist: 'The Morning Brew',
    album: 'Urban Stories',
    duration: '4:05',
  },
  {
    title: 'Digital Rain',
    artist: 'Cyber Symphony',
    album: 'Binary Beats',
    duration: '3:30',
  },
]

/** A real-world list: linked rows with cover art and a trailing duration. */
export const MusicList: Story = {
  render: () => (
    // List of link rows: an <a> cannot take role="listitem", so we use a
    // simple wrapper instead of ItemGroup (role="list").
    <div className="flex w-full max-w-md flex-col gap-4">
      {songs.map((song) => (
        <Item key={song.title} variant="outline" asChild>
          <a href="#play">
            <ItemMedia variant="image">
              <img
                src={`https://avatar.vercel.sh/${encodeURIComponent(song.title)}`}
                alt={`${song.title} cover`}
                width={40}
                height={40}
              />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="line-clamp-1">
                {song.title} — <span className="text-muted-foreground">{song.album}</span>
              </ItemTitle>
              <ItemDescription>{song.artist}</ItemDescription>
            </ItemContent>
            <ItemContent className="flex-none text-center">
              <ItemDescription>{song.duration}</ItemDescription>
            </ItemContent>
          </a>
        </Item>
      ))}
    </div>
  ),
}

const models = [
  { name: 'v0-1.5-sm', description: 'Everyday tasks and UI generation.' },
  { name: 'v0-1.5-lg', description: 'Advanced thinking or reasoning.' },
  { name: 'v0-2.0-mini', description: 'Open Source model for everyone.' },
]

/** `ItemHeader` spans the full width — ideal for a cover image above the content. */
export const HeaderWithCover: Story = {
  render: () => (
    <ItemGroup className="grid w-full max-w-xl grid-cols-3 gap-4">
      {models.map((model) => (
        <Item key={model.name} variant="outline" role="listitem">
          <ItemHeader>
            <img
              src={`https://avatar.vercel.sh/${model.name}`}
              alt={`${model.name} preview`}
              className="aspect-square w-full rounded-sm object-cover"
            />
          </ItemHeader>
          <ItemContent>
            <ItemTitle>{model.name}</ItemTitle>
            <ItemDescription>{model.description}</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  ),
}

/** `ItemFooter` spans the full width below the content. */
export const WithFooter: Story = {
  render: () => (
    <Item variant="outline" className="w-full max-w-md flex-wrap">
      <ItemContent>
        <ItemTitle>Storage almost full</ItemTitle>
        <ItemDescription>You have used 9.2 GB of your 10 GB plan.</ItemDescription>
      </ItemContent>
      <ItemFooter>
        <span className="text-sm text-muted-foreground">92% used</span>
        <Button variant="outline" size="sm">
          Upgrade
        </Button>
      </ItemFooter>
    </Item>
  ),
}

/** A description can embed a link, styled automatically. */
export const DescriptionWithLink: Story = {
  render: () => (
    <Item variant="muted" className="w-full max-w-md">
      <ItemContent>
        <ItemTitle>Terms updated</ItemTitle>
        <ItemDescription>
          We updated our policy. Read the <a href="#terms">full terms</a> for details.
        </ItemDescription>
      </ItemContent>
    </Item>
  ),
}

/** `Item` composes inside a `DropdownMenu` as a rich menu row. */
export const InDropdownMenu: Story = {
  // Starts closed: Chromatic would only see the trigger. Visual coverage of the
  // open menu lives in the `VisualInDropdownMenu` fixture. (The spread in
  // `OpensInDropdownMenu` inherits this parameter.)
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <div className="flex min-h-64 w-full max-w-md flex-col items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-fit">
            Select <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72" align="start">
          {people.map((person) => (
            <DropdownMenuItem key={person.username} className="p-0">
              <Item size="sm" className="w-full p-2">
                <ItemMedia>
                  <Avatar className="size-8">
                    <AvatarImage src={person.avatar} alt={person.username} />
                    <AvatarFallback>
                      {person.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent className="gap-0.5">
                  <ItemTitle>{person.username}</ItemTitle>
                  <ItemDescription>{person.email}</ItemDescription>
                </ItemContent>
              </Item>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
}

// --- Interaction tests (regression) ---

/** `asChild` makes the row an `<a>`, so it is exposed as a link, not a generic div. */
export const RendersAsLink: Story = {
  render: () => (
    <Item variant="outline" asChild className="w-full max-w-md">
      <a href="#docs">
        <ItemContent>
          <ItemTitle>Visit our documentation</ItemTitle>
          <ItemDescription>Learn how to get started.</ItemDescription>
        </ItemContent>
      </a>
    </Item>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // With `asChild`, the root becomes the <a> itself: it must have the link role and href.
    const link = canvas.getByRole('link', { name: /Visit our documentation/ })
    await expect(link).toHaveAttribute('href', '#docs')
    await expect(link).toHaveAttribute('data-slot', 'item')
  },
}

/** `ItemGroup` exposes `role="list"` so assistive tech reads it as a list. */
export const GroupHasListRole: Story = {
  render: () => (
    <ItemGroup className="w-full max-w-md">
      <Item role="listitem">
        <ItemContent>
          <ItemTitle>First</ItemTitle>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item role="listitem">
        <ItemContent>
          <ItemTitle>Second</ItemTitle>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const list = canvas.getByRole('list')
    await expect(list).toHaveAttribute('data-slot', 'item-group')
    await expect(within(list).getAllByRole('listitem')).toHaveLength(2)
  },
}

const onAction = fn()

/** A trailing action keeps its own handler; clicking it fires only that callback. */
export const ActionFires: Story = {
  render: () => (
    <Item variant="outline" className="w-full max-w-md">
      <ItemContent>
        <ItemTitle>Pending invite</ItemTitle>
        <ItemDescription>Approve to grant access.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" size="sm" onClick={onAction}>
          Approve
        </Button>
      </ItemActions>
    </Item>
  ),
  play: async ({ canvasElement }) => {
    onAction.mockClear()
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Approve' })
    await userEvent.click(button)
    await expect(onAction).toHaveBeenCalledOnce()
  },
}

/** Opening the menu reveals each `Item` as a `menuitem`. */
export const OpensInDropdownMenu: Story = {
  ...InDropdownMenu,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /Select/ }))
    // The menu content is portaled to document.body → query via screen.
    const menu = await screen.findByRole('menu')
    const items = within(menu).getAllByRole('menuitem')
    await expect(items).toHaveLength(people.length)
    await expect(within(menu).getByText('shadcn')).toBeInTheDocument()
    // Close the menu before axe runs (in afterEach): while open, the modal marks
    // siblings as aria-hidden while keeping the trigger focusable (violates aria-hidden-focus).
    // Wait for the exit animation to finish and the menu to leave the DOM, otherwise axe
    // still sees the aria-hidden background during the fade-out.
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  },
}

/* --------------------------------------------------------------------------
 * Visual regression fixture (Chromatic): renders the `DropdownMenu` OPEN
 * (`defaultOpen`) to capture the `Item` rows in the portal. Hidden from the
 * sidebar/docs (`!dev`/`!autodocs`), but still runs as a smoke test (tag
 * `test`) and re-enables the snapshot that `InDropdownMenu`/`OpensInDropdownMenu`
 * turn off.
 *
 * `modal={false}`: the menu needs the trigger as the Popper anchor to position
 * itself; in modal mode the trigger would be marked `aria-hidden` while staying
 * focusable (violates `aria-hidden-focus`). Non-modal does not hide the siblings.
 * -------------------------------------------------------------------------- */

/** Visual capture — the dropdown open, showing each `Item` as a rich menu row. */
export const VisualInDropdownMenu: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: false } },
  render: () => (
    <div className="flex min-h-80 w-full max-w-md flex-col items-center">
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-fit">
            Select <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72" align="start">
          {people.map((person) => (
            <DropdownMenuItem key={person.username} className="p-0">
              <Item size="sm" className="w-full p-2">
                <ItemMedia>
                  <Avatar className="size-8">
                    <AvatarImage src={person.avatar} alt={person.username} />
                    <AvatarFallback>
                      {person.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent className="gap-0.5">
                  <ItemTitle>{person.username}</ItemTitle>
                  <ItemDescription>{person.email}</ItemDescription>
                </ItemContent>
              </Item>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
}
