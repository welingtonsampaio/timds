import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  type LucideIcon,
  Search,
  Settings,
  Users,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Pie, PieChart, XAxis } from 'recharts'
import { expect, within } from 'storybook/test'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/**
 * **Dashboard** — the most complete example: an application shell with a
 * collapsible `Sidebar`, a sticky header, metric cards with trend indicators,
 * two charts (`Chart`/Recharts) and a recent-sales table. It brings together
 * almost every design system family into a single coherent screen.
 */
const meta = {
  title: 'Examples/Dashboard',
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '720px' },
      description: {
        component:
          'A full analytics dashboard: a collapsible `Sidebar` + `SidebarInset` ' +
          'shell, a sticky header, KPI `Card`s with trend `Badge`s, an area and a ' +
          'donut `Chart`, and a recent-sales `Table`. The capstone composition.',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/* -------------------------------------------------------------------------- */
/*  Data                                                                        */
/* -------------------------------------------------------------------------- */

const revenueData = [
  { month: 'Jan', receita: 4200, despesa: 2400 },
  { month: 'Feb', receita: 5100, despesa: 2800 },
  { month: 'Mar', receita: 4800, despesa: 3100 },
  { month: 'Apr', receita: 6300, despesa: 3300 },
  { month: 'May', receita: 7200, despesa: 3600 },
  { month: 'Jun', receita: 8100, despesa: 3900 },
]

const revenueConfig = {
  receita: { label: 'Revenue', color: 'var(--chart-1)' },
  despesa: { label: 'Expenses', color: 'var(--chart-2)' },
} satisfies ChartConfig

const channelData = [
  { channel: 'organico', visitas: 1240, fill: 'var(--color-organico)' },
  { channel: 'social', visitas: 860, fill: 'var(--color-social)' },
  { channel: 'pago', visitas: 540, fill: 'var(--color-pago)' },
  { channel: 'direto', visitas: 420, fill: 'var(--color-direto)' },
]

const channelConfig = {
  visitas: { label: 'Visits' },
  organico: { label: 'Organic', color: 'var(--chart-1)' },
  social: { label: 'Social', color: 'var(--chart-2)' },
  pago: { label: 'Paid', color: 'var(--chart-3)' },
  direto: { label: 'Direct', color: 'var(--chart-4)' },
} satisfies ChartConfig

const kpis: {
  label: string
  value: string
  delta: string
  up: boolean
  icon: LucideIcon
}[] = [
  { label: 'Revenue', value: '$45,231', delta: '+20.1%', up: true, icon: DollarSign },
  { label: 'Subscribers', value: '2,350', delta: '+12.4%', up: true, icon: Users },
  { label: 'Sales', value: '1,024', delta: '+8.2%', up: true, icon: CreditCard },
  {
    label: 'Churn',
    value: '38',
    delta: '-3.1%',
    up: false,
    icon: ArrowDownRight,
  },
]

const sales = [
  { name: 'Ana Souza', email: 'ana@timds.dev', amount: '$1,999', img: 47 },
  { name: 'Bruno Lima', email: 'bruno@timds.dev', amount: '$39', img: 12 },
  { name: 'Carla Dias', email: 'carla@timds.dev', amount: '$299', img: 5 },
  { name: 'Diego Reis', email: 'diego@timds.dev', amount: '$99', img: 33 },
]

const navItems: { title: string; icon: LucideIcon; badge?: string }[] = [
  { title: 'Dashboard', icon: LayoutDashboard },
  { title: 'Analytics', icon: BarChart3 },
  { title: 'Customers', icon: Users, badge: '24' },
  { title: 'Payments', icon: CreditCard },
  { title: 'Settings', icon: Settings },
]

/* -------------------------------------------------------------------------- */
/*  Subcomponents                                                               */
/* -------------------------------------------------------------------------- */

function KpiCard({ label, value, delta, up, icon: Icon }: (typeof kpis)[number]) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardDescription>{label}</CardDescription>
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <span className="font-bold text-2xl tracking-tight">{value}</span>
        <Badge variant={up ? 'success' : 'destructive'} className="w-fit gap-1">
          {up ? (
            <ArrowUpRight className="size-3" aria-hidden="true" />
          ) : (
            <ArrowDownRight className="size-3" aria-hidden="true" />
          )}
          {delta}
        </Badge>
      </CardContent>
    </Card>
  )
}

function DashboardApp() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="timds">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  t
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">timds</span>
                  <span className="text-xs">Analytics</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item, i) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton tooltip={item.title} isActive={i === 0}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Ana Souza">
                <Avatar className="size-8">
                  <AvatarImage src="https://i.pravatar.cc/80?img=47" alt="Ana Souza" />
                  <AvatarFallback>AS</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Ana Souza</span>
                  <span className="text-xs">ana@timds.dev</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        {/* Sticky header */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger />
          <h1 className="font-semibold text-base">Dashboard</h1>
          <div className="ml-auto flex items-center gap-2">
            <InputGroup className="hidden w-56 sm:flex">
              <InputGroupAddon>
                <Search className="size-4" aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search..." aria-label="Search" />
            </InputGroup>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="size-4" aria-hidden="true" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Account"
                >
                  <Avatar className="size-7">
                    <AvatarImage src="https://i.pravatar.cc/80?img=47" alt="Ana Souza" />
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My account</DropdownMenuLabel>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue vs. Expenses</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={revenueConfig} className="h-[260px] w-full">
                  <AreaChart
                    accessibilityLayer
                    data={revenueData}
                    margin={{ left: 12, right: 12 }}
                  >
                    <defs>
                      <linearGradient id="dashReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-receita)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-receita)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient id="dashDespesa" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-despesa)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-despesa)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Area
                      dataKey="receita"
                      type="natural"
                      fill="url(#dashReceita)"
                      stroke="var(--color-receita)"
                      stackId="a"
                    />
                    <Area
                      dataKey="despesa"
                      type="natural"
                      fill="url(#dashDespesa)"
                      stroke="var(--color-despesa)"
                      stackId="b"
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic by channel</CardTitle>
                <CardDescription>Source of visits</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={channelConfig}
                  className="mx-auto aspect-square max-h-[260px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent nameKey="visitas" hideLabel />}
                    />
                    <Pie
                      data={channelData}
                      dataKey="visitas"
                      nameKey="channel"
                      innerRadius={55}
                    />
                    <ChartLegend
                      content={<ChartLegendContent nameKey="channel" />}
                      className="flex-wrap gap-2"
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent sales */}
          <Card>
            <CardHeader>
              <CardTitle>Recent sales</CardTitle>
              <CardDescription>You made 265 sales this month.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Customer</TableHead>
                    <TableHead className="text-right pr-6">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.email}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage
                              src={`https://i.pravatar.cc/80?img=${sale.img}`}
                              alt={sale.name}
                            />
                            <AvatarFallback>
                              {sale.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{sale.name}</span>
                            <span className="text-muted-foreground text-xs">
                              {sale.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 text-right font-medium">
                        {sale.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export const Default: Story = {
  render: () => <DashboardApp />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    await expect(canvas.getByText('$45,231')).toBeInTheDocument()
    // The navigation marks the active item.
    await expect(canvas.getByRole('button', { name: 'Dashboard' })).toHaveAttribute(
      'data-active',
      'true',
    )
  },
}
