import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AtSign,
  CheckCheck,
  GitPullRequest,
  Heart,
  type LucideIcon,
  MessageSquare,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * **Notifications** — a filterable activity feed. Shows `Tabs` as a filter,
 * `Item` as a rich row (icon, title, description and actions) and the use of an
 * "unread" dot + a count `Badge` that react to local state.
 */
const meta = {
  title: 'Examples/Notifications',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A filterable activity feed: `Tabs` switch between all / unread / ' +
          'mentions, each row is an `Item` with media, content and actions, and an ' +
          'unread dot plus a count `Badge` track local state.',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

type Kind = 'comment' | 'mention' | 'pr' | 'like'

type Note = {
  id: string
  kind: Kind
  title: string
  description: string
  when: string
  read: boolean
}

const ICONS: Record<Kind, LucideIcon> = {
  comment: MessageSquare,
  mention: AtSign,
  pr: GitPullRequest,
  like: Heart,
}

const initial: Note[] = [
  {
    id: '1',
    kind: 'mention',
    title: 'Bruno Lima mentioned you',
    description: '“@ana can you review the contrast tokens?” in #design-system',
    when: '5 min ago',
    read: false,
  },
  {
    id: '2',
    kind: 'pr',
    title: 'PR #128 awaiting review',
    description: 'feat(table): row grouping with sticky header',
    when: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    kind: 'comment',
    title: 'Carla Dias commented',
    description: 'I love the new Donut chart on the dashboard!',
    when: '3 hours ago',
    read: false,
  },
  {
    id: '4',
    kind: 'like',
    title: 'Diego Reis liked your update',
    description: 'Release v0.4 — new accessible text tokens',
    when: 'yesterday',
    read: true,
  },
  {
    id: '5',
    kind: 'mention',
    title: 'Elena Prado mentioned you',
    description: '“@ana we close the sprint tomorrow” in #product',
    when: 'yesterday',
    read: true,
  },
]

function NotificationsFeed() {
  const [notes, setNotes] = useState(initial)
  const [tab, setTab] = useState<'all' | 'unread' | 'mentions'>('all')

  const unreadCount = notes.filter((n) => !n.read).length

  const visible = useMemo(() => {
    if (tab === 'unread') return notes.filter((n) => !n.read)
    if (tab === 'mentions') return notes.filter((n) => n.kind === 'mention')
    return notes
  }, [notes, tab])

  function markRead(id: string) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  function markAll() {
    setNotes((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="mx-auto max-w-2xl py-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            Notifications
            {unreadCount > 0 ? <Badge>{unreadCount}</Badge> : null}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAll}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="size-4" aria-hidden="true" /> Mark all
          </Button>
        </CardHeader>

        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">
                Unread
              </TabsTrigger>
              <TabsTrigger value="mentions" className="flex-1">
                Mentions
              </TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="pt-3">
              <div className="flex flex-col gap-1">
                {visible.map((note) => {
                  const Icon = ICONS[note.kind]
                  return (
                    <Item key={note.id} variant={note.read ? 'default' : 'muted'}>
                      <ItemMedia variant="icon">
                        <Icon className="size-4" aria-hidden="true" />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle className="flex items-center gap-2">
                          {note.title}
                          {!note.read ? (
                            <>
                              <span
                                className="size-2 rounded-full bg-primary"
                                aria-hidden="true"
                              />
                              <span className="sr-only">Unread</span>
                            </>
                          ) : null}
                        </ItemTitle>
                        <ItemDescription>{note.description}</ItemDescription>
                        <ItemDescription className="text-xs">{note.when}</ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        {!note.read ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markRead(note.id)}
                          >
                            Mark read
                          </Button>
                        ) : null}
                      </ItemActions>
                    </Item>
                  )
                })}
                {visible.length === 0 ? (
                  <p className="py-10 text-center text-muted-foreground text-sm">
                    All caught up. No notifications here.
                  </p>
                ) : null}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export const Default: Story = {
  render: () => <NotificationsFeed />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Starts with 3 unread; the "Unread" filter shows exactly those.
    await expect(canvas.getByText('3')).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('tab', { name: 'Unread' }))
    const markButtons = canvas.getAllByRole('button', { name: 'Mark read' })
    await expect(markButtons).toHaveLength(3)
    // Marking all resets the counter and disables the button.
    await userEvent.click(canvas.getByRole('button', { name: /Mark all/ }))
    await expect(
      canvas.queryByRole('button', { name: 'Mark read' }),
    ).not.toBeInTheDocument()
  },
}
