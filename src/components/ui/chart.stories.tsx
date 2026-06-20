import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrendingUp } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from 'recharts'
import { expect, within } from 'storybook/test'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from './chart'

const meta = {
  title: 'Data Display/Chart',
  component: ChartContainer,
  // No `autodocs`: the docs page is the custom MDX (chart.mdx), which embeds
  // these stories. Having both would generate duplicate Docs entries.
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A thin, themeable wrapper around [Recharts](https://recharts.org). You compose a
native Recharts chart inside \`<ChartContainer>\` and feed it a **\`ChartConfig\`** — a
map from each data series to a \`label\`, an optional \`icon\` and a \`color\` (or
per-theme colors).

### How it works

- The container injects each series color as a \`--color-<key>\` CSS variable, which
  you reference with \`fill="var(--color-desktop)"\`. A single config drives the
  series, the tooltip **and** the legend, and adapts to dark mode automatically.
- Pair it with \`ChartTooltip\` + \`ChartTooltipContent\` and \`ChartLegend\` +
  \`ChartLegendContent\` for consistent, accessible overlays.
- The design-system palette lives in the \`--chart-1\`…\`--chart-5\` tokens.

### Synchronizing multiple charts

Give two or more charts a shared \`syncId\` (and the same axis): hovering one
highlights the same point — **cursor, tooltip and label** — on all of them. See the
**Synchronized** story.

### Gallery

Covers every family from the shadcn gallery: **Area**, **Bar**, **Line**, **Pie**,
**Radar**, **Radial**, **Tooltips** and **Synchronized** charts.
`,
      },
    },
  },
} satisfies Meta<typeof ChartContainer>

export default meta

type Story = StoryObj<typeof ChartContainer>

/* -------------------------------------------------------------------------- */
/*  Shared data and configurations                                             */
/* -------------------------------------------------------------------------- */

// Time series with two categories (desktop x mobile).
const monthlyData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 173, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 264, mobile: 140 },
]

// The `color` becomes the CSS variable `--color-desktop` / `--color-mobile`.
const seriesConfig = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile', color: 'var(--chart-2)' },
} satisfies ChartConfig

// Categorical data for Pie/Radial: each item carries its own `fill`.
const browserData = [
  { browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' },
  { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
  { browser: 'firefox', visitors: 187, fill: 'var(--color-firefox)' },
  { browser: 'edge', visitors: 173, fill: 'var(--color-edge)' },
  { browser: 'other', visitors: 90, fill: 'var(--color-other)' },
]

const browserConfig = {
  visitors: { label: 'Visitors' },
  chrome: { label: 'Chrome', color: 'var(--chart-1)' },
  safari: { label: 'Safari', color: 'var(--chart-2)' },
  firefox: { label: 'Firefox', color: 'var(--chart-3)' },
  edge: { label: 'Edge', color: 'var(--chart-4)' },
  other: { label: 'Other', color: 'var(--chart-5)' },
} satisfies ChartConfig

// Data for the radar (a single series with multiple axes).
const radarData = [
  { metric: 'Performance', value: 186 },
  { metric: 'Accessibility', value: 305 },
  { metric: 'SEO', value: 237 },
  { metric: 'PWA', value: 273 },
  { metric: 'Best practices', value: 209 },
  { metric: 'Security', value: 214 },
]

const radarConfig = {
  value: { label: 'Score', color: 'var(--chart-1)' },
} satisfies ChartConfig

/* -------------------------------------------------------------------------- */
/*  Playground                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Minimal composition: a Recharts `AreaChart` inside `ChartContainer`.
 * Start here — copy it and swap the data, the `config` and the axes.
 */
export const Playground: Story = {
  render: () => (
    <ChartContainer config={seriesConfig} className="h-[260px] w-[460px]">
      <AreaChart accessibilityLayer data={monthlyData} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Area
          dataKey="desktop"
          type="natural"
          fill="var(--color-desktop)"
          fillOpacity={0.4}
          stroke="var(--color-desktop)"
        />
      </AreaChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    // Smoke test: the ChartContainer mounts and exposes its slot.
    const chart = canvasElement.querySelector('[data-slot="chart"]')
    await expect(chart).toBeTruthy()
  },
}

/* -------------------------------------------------------------------------- */
/*  Area Charts                                                                 */
/* -------------------------------------------------------------------------- */

/** Simple area with a single series and tooltip. */
export const AreaBasic: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Visits — Area</CardTitle>
        <CardDescription>January to June 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={seriesConfig} className="h-[240px] w-full">
          <AreaChart
            accessibilityLayer
            data={monthlyData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="desktop"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
}

/**
 * Stacked area with gradient. Two `<Area>` with the same `stackId` add up, and
 * the `<defs>` defines a gradient per series reusing `--color-*`.
 */
export const AreaStacked: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Desktop + Mobile</CardTitle>
        <CardDescription>Stacked area with gradient</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Inline dimensions ensure render in the test environment (no Tailwind). */}
        <ChartContainer
          config={seriesConfig}
          className="h-[240px] w-full"
          style={{ width: 420, height: 240 }}
        >
          <AreaChart
            accessibilityLayer
            data={monthlyData}
            margin={{ left: 12, right: 12 }}
          >
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    // The legend renders the labels from the config.
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Desktop')).toBeInTheDocument()
    await expect(canvas.getByText('Mobile')).toBeInTheDocument()
  },
}

/* -------------------------------------------------------------------------- */
/*  Bar Charts                                                                  */
/* -------------------------------------------------------------------------- */

/** Vertical bars with rounded corners. */
export const BarBasic: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Visits — Bars</CardTitle>
        <CardDescription>January to June 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={seriesConfig} className="h-[240px] w-full">
          <BarChart accessibilityLayer data={monthlyData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
}

/** Multiple series side by side and a legend. */
export const BarMultiple: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Desktop x Mobile</CardTitle>
        <CardDescription>Grouped bars</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={seriesConfig} className="h-[240px] w-full">
          <BarChart accessibilityLayer data={monthlyData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
}

/** Stacked bars: the same `stackId` sums the series in each category. */
export const BarStacked: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Monthly composition</CardTitle>
        <CardDescription>Stacked bars</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={seriesConfig} className="h-[240px] w-full">
          <BarChart accessibilityLayer data={monthlyData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="desktop"
              stackId="a"
              fill="var(--color-desktop)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="mobile"
              stackId="a"
              fill="var(--color-mobile)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
}

/** Horizontal bars: use `layout="vertical"` and the `YAxis` as category. */
export const BarHorizontal: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Horizontal ranking</CardTitle>
        <CardDescription>`layout="vertical"`</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={seriesConfig} className="h-[260px] w-full">
          <BarChart
            accessibilityLayer
            data={monthlyData}
            layout="vertical"
            margin={{ left: 8 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <XAxis dataKey="desktop" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
}

/** Labels over the bars with `<LabelList>`. */
export const BarLabel: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Bars with labels</CardTitle>
        <CardDescription>`LabelList` positioned at the top</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={seriesConfig} className="h-[240px] w-full">
          <BarChart accessibilityLayer data={monthlyData} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
}

/* -------------------------------------------------------------------------- */
/*  Line Charts                                                                 */
/* -------------------------------------------------------------------------- */

/** Simple line without dots. */
export const LineBasic: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Visits — Line</CardTitle>
        <CardDescription>January to June 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={seriesConfig} className="h-[240px] w-full">
          <LineChart
            accessibilityLayer
            data={monthlyData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Line
              dataKey="desktop"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
}

/** Two lines with dots and a legend. */
export const LineMultiple: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Desktop x Mobile</CardTitle>
        <CardDescription>Multiple lines with dots</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={seriesConfig} className="h-[240px] w-full">
          <LineChart
            accessibilityLayer
            data={monthlyData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="desktop"
              type="monotone"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-desktop)' }}
            />
            <Line
              dataKey="mobile"
              type="monotone"
              stroke="var(--color-mobile)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-mobile)' }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
}

/* -------------------------------------------------------------------------- */
/*  Pie Charts                                                                  */
/* -------------------------------------------------------------------------- */

/** Pie with slices colored by each item's `fill` and a legend. */
export const PieBasic: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader className="items-center text-center">
        <CardTitle>Browsers</CardTitle>
        <CardDescription>Visitor distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={browserConfig}
          className="mx-auto aspect-square max-h-[260px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="visitors" hideLabel />}
            />
            <Pie data={browserData} dataKey="visitors" nameKey="browser" />
            <ChartLegend
              content={<ChartLegendContent nameKey="browser" />}
              className="flex-wrap gap-2"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
}

/** Donut: `innerRadius` opens the center and a central `<Label>` shows the total. */
export const PieDonut: Story = {
  render: () => {
    const total = browserData.reduce((acc, item) => acc + item.visitors, 0)
    return (
      <Card className="w-[360px]">
        <CardHeader className="items-center text-center">
          <CardTitle>Browsers</CardTitle>
          <CardDescription>Donut with total in the center</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={browserConfig}
            className="mx-auto aspect-square max-h-[260px]"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="visitors" hideLabel />}
              />
              <Pie
                data={browserData}
                dataKey="visitors"
                nameKey="browser"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {total.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Visitors
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="justify-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="size-4" /> +5.2% this month
        </CardFooter>
      </Card>
    )
  },
}

/* -------------------------------------------------------------------------- */
/*  Radar Chart                                                                 */
/* -------------------------------------------------------------------------- */

/** Radar with one series, polar grid and filled area. */
export const RadarBasic: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader className="items-center text-center">
        <CardTitle>Lighthouse Audit</CardTitle>
        <CardDescription>Score by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={radarConfig}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <RadarChart data={radarData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <Radar
              dataKey="value"
              fill="var(--color-value)"
              fillOpacity={0.6}
              stroke="var(--color-value)"
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
}

/* -------------------------------------------------------------------------- */
/*  Radial Charts                                                               */
/* -------------------------------------------------------------------------- */

/** Radial bars with background track and legend. */
export const RadialBasic: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader className="items-center text-center">
        <CardTitle>Browsers</CardTitle>
        <CardDescription>Radial bars</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={browserConfig}
          className="mx-auto aspect-square max-h-[260px]"
        >
          <RadialBarChart data={browserData} innerRadius={30} outerRadius={110}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey="browser" hideLabel />}
            />
            <RadialBar dataKey="visitors" background>
              {browserData.map((entry) => (
                <Cell key={entry.browser} fill={entry.fill} />
              ))}
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
}

/** Radial with central text, using `PolarRadiusAxis` to anchor the `<Label>`. */
export const RadialText: Story = {
  render: () => {
    const total = browserData.reduce((acc, item) => acc + item.visitors, 0)
    return (
      <Card className="w-[360px]">
        <CardHeader className="items-center text-center">
          <CardTitle>Total visitors</CardTitle>
          <CardDescription>Radial with text in the center</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={browserConfig}
            className="mx-auto aspect-square max-h-[260px]"
          >
            <RadialBarChart
              data={[
                {
                  name: 'total',
                  ...Object.fromEntries(browserData.map((b) => [b.browser, b.visitors])),
                },
              ]}
              endAngle={180}
              innerRadius={80}
              outerRadius={130}
            >
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) - 16}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {total.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 4}
                            className="fill-muted-foreground"
                          >
                            Visitors
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar
                dataKey="chrome"
                stackId="a"
                cornerRadius={5}
                fill="var(--color-chrome)"
                className="stroke-transparent stroke-2"
              />
              <RadialBar
                dataKey="safari"
                stackId="a"
                cornerRadius={5}
                fill="var(--color-safari)"
                className="stroke-transparent stroke-2"
              />
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  },
}

/* -------------------------------------------------------------------------- */
/*  Tooltips                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * `ChartTooltipContent` accepts three indicators (`dot` | `line` | `dashed`),
 * plus `hideLabel`, `hideIndicator`, `nameKey`/`labelKey` and `formatter`.
 * Here are the formats side by side — hover over each chart.
 */
export const Tooltips: Story = {
  render: () => {
    const variants = [
      { title: 'Dot (default)', content: <ChartTooltipContent /> },
      { title: 'Line', content: <ChartTooltipContent indicator="line" /> },
      { title: 'Dashed', content: <ChartTooltipContent indicator="dashed" /> },
      { title: 'No label', content: <ChartTooltipContent hideLabel /> },
      {
        title: 'Custom formatter',
        content: (
          <ChartTooltipContent
            formatter={(value, name) => (
              <div className="flex w-full justify-between gap-3">
                <span className="text-muted-foreground capitalize">{name}</span>
                <span className="font-mono font-medium">
                  {Number(value).toLocaleString()} hits
                </span>
              </div>
            )}
          />
        ),
      },
    ]

    return (
      <div className="grid grid-cols-2 gap-4">
        {variants.map((variant) => (
          <Card key={variant.title} className="w-[300px]">
            <CardHeader>
              <CardTitle className="text-sm">{variant.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={seriesConfig} className="h-[160px] w-full">
                <BarChart accessibilityLayer data={monthlyData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={8}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip cursor={false} content={variant.content} />
                  <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                  <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  },
}

/* -------------------------------------------------------------------------- */
/*  Synchronized                                                                */
/* -------------------------------------------------------------------------- */

/**
 * **Synchronization across charts.** Give the same `syncId` to several charts
 * that share the axis (here, `month`): when you hover over one of them, Recharts
 * activates the **same point** on all of them — cursor, tooltip and the **label**
 * (the focused month) stay synchronized. By default the match is by index
 * (`syncMethod="index"`); use `syncMethod="value"` when the axes have the same
 * categories but in a different order/quantity. The `ChartConfig` is also
 * shared, so the series inherit the same colors and labels.
 *
 * Hover over the area to see the bars highlight the same month.
 */
export const Synchronized: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Combined view</CardTitle>
        <CardDescription>
          Same <code>syncId</code> — hover synchronizes the month across both charts
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Area chart (Desktop) */}
        <ChartContainer
          config={seriesConfig}
          className="h-[160px] w-full"
          style={{ width: 412, height: 160 }}
        >
          <AreaChart
            accessibilityLayer
            data={monthlyData}
            syncId="visitas"
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor content={<ChartTooltipContent indicator="line" />} />
            <Area
              dataKey="desktop"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
            />
          </AreaChart>
        </ChartContainer>

        {/* Bar chart (Mobile) — same syncId and same `month` axis */}
        <ChartContainer
          config={seriesConfig}
          className="h-[160px] w-full"
          style={{ width: 412, height: 160 }}
        >
          <BarChart accessibilityLayer data={monthlyData} syncId="visitas">
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor content={<ChartTooltipContent indicator="line" />} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    // Both charts mount and share the config (same series/colors).
    const charts = canvasElement.querySelectorAll('[data-slot="chart"]')
    await expect(charts.length).toBe(2)
  },
}
