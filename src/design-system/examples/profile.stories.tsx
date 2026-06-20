import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  CalendarDays,
  GitCommitHorizontal,
  MapPin,
  MessageSquare,
  Settings,
  Star,
  UserPlus,
} from 'lucide-react'
import { expect, within } from 'storybook/test'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * **Profile** — an identity page. Combines `Avatar`, `Badge`, `Card` and an
 * `ItemGroup` for the activity feed, organized by `Tabs`. Demonstrates how
 * a cover band and an overlapping header are assembled using only tokens and radius.
 */
const meta = {
  title: 'Examples/Profile',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A profile page: a gradient cover, an overlapping `Avatar`, identity ' +
          'metadata with `Badge`s, a stats row and a tabbed body whose activity ' +
          'feed is an `ItemGroup`.',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const stats = [
  { label: 'Projects', value: '24' },
  { label: 'Followers', value: '1.2k' },
  { label: 'Following', value: '318' },
  { label: 'Stars', value: '4.9' },
]

const activity = [
  {
    icon: GitCommitHorizontal,
    title: 'Pushed 12 commits to timds/design-system',
    when: '2 hours ago',
  },
  {
    icon: Star,
    title: 'Starred recharts/recharts',
    when: '5 hours ago',
  },
  {
    icon: MessageSquare,
    title: 'Commented on issue #128 — Contrast tokens',
    when: 'yesterday',
  },
  {
    icon: UserPlus,
    title: 'Started following Bruno Lima',
    when: '2 days ago',
  },
]

export const Default: Story = {
  render: () => (
    <div className="mx-auto max-w-3xl">
      <Card className="overflow-hidden p-0">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-primary via-chart-3 to-chart-2" />

        <CardContent className="flex flex-col gap-6 pb-6">
          {/* Header overlapping the cover */}
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar className="size-24 ring-4 ring-card">
                <AvatarImage src="https://i.pravatar.cc/150?img=47" alt="Ana Souza" />
                <AvatarFallback className="text-2xl">AS</AvatarFallback>
              </Avatar>
              <div className="mb-1 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-xl">Ana Souza</h1>
                  <Badge variant="info">Pro</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Design Engineer · @anasouza
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" aria-label="Settings">
                <Settings className="size-4" aria-hidden="true" />
              </Button>
              <Button>
                <UserPlus className="size-4" aria-hidden="true" /> Follow
              </Button>
            </div>
          </div>

          <p className="max-w-prose text-sm">
            Building accessible and well-documented design systems. Passionate about
            tokens, typography and good defaults.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground text-sm">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden="true" /> São Paulo, BR
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" /> Joined Mar 2023
            </span>
          </div>

          <Separator />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="font-semibold text-2xl">{stat.value}</span>
                <span className="text-muted-foreground text-sm">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Tabbed body */}
          <Tabs defaultValue="activity">
            <TabsList variant="line">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="pt-2">
              <div className="flex flex-col divide-y divide-border">
                {activity.map((entry) => (
                  <Item key={entry.title}>
                    <ItemMedia variant="icon">
                      <entry.icon className="size-4" aria-hidden="true" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{entry.title}</ItemTitle>
                      <ItemDescription>{entry.when}</ItemDescription>
                    </ItemContent>
                  </Item>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="about" className="pt-2">
              <p className="text-sm text-muted-foreground">
                Design engineer focused on reusable systems, accessibility and developer
                experience. Maintainer of timds.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { name: 'Ana Souza' })).toBeInTheDocument()
    // The activity tab is the default and lists the feed.
    await expect(canvas.getByText(/Pushed 12 commits/)).toBeInTheDocument()
  },
}
