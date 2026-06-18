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
  title: 'UI/Chart',
  component: ChartContainer,
  tags: ['autodocs'],
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
/*  Dados e configurações compartilhadas                                       */
/* -------------------------------------------------------------------------- */

// Série temporal com duas categorias (desktop x mobile).
const monthlyData = [
  { month: 'Janeiro', desktop: 186, mobile: 80 },
  { month: 'Fevereiro', desktop: 305, mobile: 200 },
  { month: 'Março', desktop: 237, mobile: 120 },
  { month: 'Abril', desktop: 173, mobile: 190 },
  { month: 'Maio', desktop: 209, mobile: 130 },
  { month: 'Junho', desktop: 264, mobile: 140 },
]

// O `color` vira a variável CSS `--color-desktop` / `--color-mobile`.
const seriesConfig = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile', color: 'var(--chart-2)' },
} satisfies ChartConfig

// Dados categóricos para Pie/Radial: cada item carrega o próprio `fill`.
const browserData = [
  { browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' },
  { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
  { browser: 'firefox', visitors: 187, fill: 'var(--color-firefox)' },
  { browser: 'edge', visitors: 173, fill: 'var(--color-edge)' },
  { browser: 'other', visitors: 90, fill: 'var(--color-other)' },
]

const browserConfig = {
  visitors: { label: 'Visitantes' },
  chrome: { label: 'Chrome', color: 'var(--chart-1)' },
  safari: { label: 'Safari', color: 'var(--chart-2)' },
  firefox: { label: 'Firefox', color: 'var(--chart-3)' },
  edge: { label: 'Edge', color: 'var(--chart-4)' },
  other: { label: 'Outros', color: 'var(--chart-5)' },
} satisfies ChartConfig

// Dados para o radar (uma única série com vários eixos).
const radarData = [
  { metric: 'Performance', value: 186 },
  { metric: 'Acessibilidade', value: 305 },
  { metric: 'SEO', value: 237 },
  { metric: 'PWA', value: 273 },
  { metric: 'Boas práticas', value: 209 },
  { metric: 'Segurança', value: 214 },
]

const radarConfig = {
  value: { label: 'Pontuação', color: 'var(--chart-1)' },
} satisfies ChartConfig

/* -------------------------------------------------------------------------- */
/*  Playground                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Composição mínima: um `AreaChart` do Recharts dentro de `ChartContainer`.
 * Comece por aqui — copie e troque os dados, o `config` e os eixos.
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
    // Smoke test: o ChartContainer monta e expõe seu slot.
    const chart = canvasElement.querySelector('[data-slot="chart"]')
    await expect(chart).toBeTruthy()
  },
}

/* -------------------------------------------------------------------------- */
/*  Area Charts                                                                 */
/* -------------------------------------------------------------------------- */

/** Área simples com uma única série e tooltip. */
export const AreaBasic: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Visitas — Área</CardTitle>
        <CardDescription>Janeiro a Junho de 2026</CardDescription>
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
 * Área empilhada com gradiente. Duas `<Area>` com `stackId` igual se somam, e
 * o `<defs>` define um degradê por série reaproveitando `--color-*`.
 */
export const AreaStacked: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Desktop + Mobile</CardTitle>
        <CardDescription>Área empilhada com gradiente</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Dimensões inline garantem render no ambiente de teste (sem Tailwind). */}
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
    // A legenda renderiza os labels do config.
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Desktop')).toBeInTheDocument()
    await expect(canvas.getByText('Mobile')).toBeInTheDocument()
  },
}

/* -------------------------------------------------------------------------- */
/*  Bar Charts                                                                  */
/* -------------------------------------------------------------------------- */

/** Barras verticais com cantos arredondados. */
export const BarBasic: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Visitas — Barras</CardTitle>
        <CardDescription>Janeiro a Junho de 2026</CardDescription>
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

/** Múltiplas séries lado a lado e legenda. */
export const BarMultiple: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Desktop x Mobile</CardTitle>
        <CardDescription>Barras agrupadas</CardDescription>
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

/** Barras empilhadas: mesmo `stackId` soma as séries em cada categoria. */
export const BarStacked: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Composição mensal</CardTitle>
        <CardDescription>Barras empilhadas</CardDescription>
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

/** Barras horizontais: use `layout="vertical"` e o `YAxis` como categoria. */
export const BarHorizontal: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Ranking horizontal</CardTitle>
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

/** Rótulos sobre as barras com `<LabelList>`. */
export const BarLabel: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Barras com rótulos</CardTitle>
        <CardDescription>`LabelList` posicionado no topo</CardDescription>
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

/** Linha simples sem pontos. */
export const LineBasic: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Visitas — Linha</CardTitle>
        <CardDescription>Janeiro a Junho de 2026</CardDescription>
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

/** Duas linhas com pontos e legenda. */
export const LineMultiple: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Desktop x Mobile</CardTitle>
        <CardDescription>Linhas múltiplas com pontos</CardDescription>
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

/** Pizza com fatias coloridas pelo `fill` de cada item e legenda. */
export const PieBasic: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader className="items-center text-center">
        <CardTitle>Navegadores</CardTitle>
        <CardDescription>Distribuição de visitantes</CardDescription>
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

/** Donut: `innerRadius` abre o miolo e um `<Label>` central exibe o total. */
export const PieDonut: Story = {
  render: () => {
    const total = browserData.reduce((acc, item) => acc + item.visitors, 0)
    return (
      <Card className="w-[360px]">
        <CardHeader className="items-center text-center">
          <CardTitle>Navegadores</CardTitle>
          <CardDescription>Donut com total no centro</CardDescription>
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
                            Visitantes
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
          <TrendingUp className="size-4" /> +5,2% no mês
        </CardFooter>
      </Card>
    )
  },
}

/* -------------------------------------------------------------------------- */
/*  Radar Chart                                                                 */
/* -------------------------------------------------------------------------- */

/** Radar com uma série, grade polar e área preenchida. */
export const RadarBasic: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader className="items-center text-center">
        <CardTitle>Auditoria Lighthouse</CardTitle>
        <CardDescription>Pontuação por categoria</CardDescription>
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

/** Barras radiais com trilho de fundo e legenda. */
export const RadialBasic: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader className="items-center text-center">
        <CardTitle>Navegadores</CardTitle>
        <CardDescription>Barras radiais</CardDescription>
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

/** Radial com texto central, usando `PolarRadiusAxis` para ancorar o `<Label>`. */
export const RadialText: Story = {
  render: () => {
    const total = browserData.reduce((acc, item) => acc + item.visitors, 0)
    return (
      <Card className="w-[360px]">
        <CardHeader className="items-center text-center">
          <CardTitle>Total de visitantes</CardTitle>
          <CardDescription>Radial com texto no centro</CardDescription>
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
                            Visitantes
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
 * O `ChartTooltipContent` aceita três indicadores (`dot` | `line` | `dashed`),
 * além de `hideLabel`, `hideIndicator`, `nameKey`/`labelKey` e `formatter`.
 * Aqui estão os formatos lado a lado — passe o cursor sobre cada gráfico.
 */
export const Tooltips: Story = {
  render: () => {
    const variants = [
      { title: 'Dot (padrão)', content: <ChartTooltipContent /> },
      { title: 'Line', content: <ChartTooltipContent indicator="line" /> },
      { title: 'Dashed', content: <ChartTooltipContent indicator="dashed" /> },
      { title: 'Sem label', content: <ChartTooltipContent hideLabel /> },
      {
        title: 'Formatter customizado',
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
 * **Sincronização entre gráficos.** Dê o mesmo `syncId` a vários gráficos que
 * compartilham o eixo (aqui, `month`): ao passar o cursor sobre um deles, o
 * Recharts ativa o **mesmo ponto** em todos — cursor, tooltip e o **label**
 * (o mês em foco) ficam sincronizados. Por padrão o casamento é por índice
 * (`syncMethod="index"`); use `syncMethod="value"` quando os eixos tiverem
 * categorias iguais mas em ordem/quantidade diferentes. O `ChartConfig` também
 * é compartilhado, então as séries herdam as mesmas cores e labels.
 *
 * Passe o cursor sobre a área para ver as barras destacarem o mesmo mês.
 */
export const Synchronized: Story = {
  render: () => (
    <Card className="w-[460px]">
      <CardHeader>
        <CardTitle>Visão combinada</CardTitle>
        <CardDescription>
          Mesmo <code>syncId</code> — o hover sincroniza o mês em ambos os gráficos
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Gráfico de área (Desktop) */}
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

        {/* Gráfico de barras (Mobile) — mesmo syncId e mesmo eixo `month` */}
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
    // Ambos os gráficos montam e compartilham o config (mesmas séries/cores).
    const charts = canvasElement.querySelectorAll('[data-slot="chart"]')
    await expect(charts.length).toBe(2)
  },
}
