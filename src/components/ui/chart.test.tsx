import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  type ChartConfig,
  ChartContainer,
  ChartLegendContent,
  ChartStyle,
  ChartTooltipContent,
} from './chart'

const config: ChartConfig = {
  desktop: { label: 'Desktop', color: 'red' },
  mobile: { label: 'Mobile', color: 'blue' },
}

// Renders the tooltip content inside the container (which provides the context).
function renderTooltip(
  props: React.ComponentProps<typeof ChartTooltipContent>,
  cfg: ChartConfig = config,
) {
  return render(
    <ChartContainer config={cfg}>
      <ChartTooltipContent {...props} />
    </ChartContainer>,
  )
}

describe('ChartContainer / useChart', () => {
  it('throws an error when the content is used outside the ChartContainer', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<ChartTooltipContent active payload={[]} />)).toThrow(
      /ChartContainer/,
    )
    spy.mockRestore()
  })

  it('respects the provided id in data-chart', () => {
    const { container } = render(
      <ChartContainer id="vendas" config={config}>
        <div />
      </ChartContainer>,
    )
    expect(container.querySelector('[data-chart="chart-vendas"]')).not.toBeNull()
  })
})

describe('ChartStyle', () => {
  it('renders nothing when no color/theme is configured', () => {
    const { container } = render(
      <ChartStyle id="x" config={{ desktop: { label: 'Desktop' } }} />,
    )
    expect(container.querySelector('style')).toBeNull()
  })

  it('injects CSS variables for colors and themes', () => {
    const { container } = render(
      <ChartStyle
        id="y"
        config={{
          a: { label: 'A', color: 'red' },
          b: { label: 'B', theme: { light: 'green', dark: 'black' } },
        }}
      />,
    )
    const style = container.querySelector('style')
    expect(style).not.toBeNull()
    expect(style?.innerHTML).toContain('--color-a: red')
    expect(style?.innerHTML).toContain('--color-b: green')
    expect(style?.innerHTML).toContain('--color-b: black')
  })

  it('omits the variable when the theme color is empty', () => {
    const { container } = render(
      <ChartStyle
        id="z"
        config={{ c: { label: 'C', theme: { light: 'green', dark: '' } } }}
      />,
    )
    const style = container.querySelector('style')
    expect(style?.innerHTML).toContain('--color-c: green')
    // The dark theme has an empty color → does not generate the variable.
    expect(style?.innerHTML).not.toContain('--color-c: ;')
  })
})

describe('ChartLegendContent', () => {
  function renderLegend(
    props: React.ComponentProps<typeof ChartLegendContent>,
    cfg: ChartConfig = config,
  ) {
    return render(
      <ChartContainer config={cfg}>
        <ChartLegendContent {...props} />
      </ChartContainer>,
    )
  }

  it('renders nothing without a payload', () => {
    const { container } = renderLegend({ payload: [] })
    expect(container.querySelector('.gap-4')).toBeNull()
  })

  it('renders labels and the default color swatch', () => {
    renderLegend({
      payload: [
        { value: 'desktop', dataKey: 'desktop', color: 'red', type: 'square' },
        // No dataKey or nameKey → falls back to the 'value' key.
        { value: 'no-key', color: 'green', type: 'square' },
        { value: 'none', dataKey: 'none', color: 'gray', type: 'none' },
      ] as never,
    })
    expect(screen.getByText('Desktop')).toBeInTheDocument()
    // The item with type "none" is filtered out.
    expect(screen.queryByText('none')).not.toBeInTheDocument()
  })

  it('uses the config icon when present and hideIcon is false', () => {
    const Icon = () => <svg data-testid="legend-icon" />
    renderLegend(
      { verticalAlign: 'top', payload: [{ dataKey: 'desktop', color: 'red' }] as never },
      { desktop: { label: 'Desktop', color: 'red', icon: Icon } },
    )
    expect(screen.getByTestId('legend-icon')).toBeInTheDocument()
  })

  it('hides the config icon with hideIcon and resolves via nameKey', () => {
    const Icon = () => <svg data-testid="legend-icon" />
    const { container } = renderLegend(
      {
        hideIcon: true,
        nameKey: 'tipo',
        payload: [{ payload: { tipo: 'mobile' }, color: 'blue' }] as never,
      },
      { mobile: { label: 'Mobile', color: 'blue', icon: Icon } },
    )
    expect(screen.queryByTestId('legend-icon')).not.toBeInTheDocument()
    expect(screen.getByText('Mobile')).toBeInTheDocument()
    expect(container.querySelector('.h-2.w-2')).not.toBeNull()
  })
})

describe('ChartTooltipContent', () => {
  it('does not render when inactive or without a payload', () => {
    const { container } = renderTooltip({ active: false, payload: [] })
    expect(container.querySelector('.grid')).toBeNull()
  })

  it('shows the label from the config when label is a string', () => {
    renderTooltip({
      active: true,
      label: 'desktop',
      payload: [
        {
          dataKey: 'desktop',
          name: 'desktop',
          value: 1234,
          color: 'red',
          payload: { fill: 'red' },
        },
      ] as never,
    })
    expect(screen.getAllByText('Desktop').length).toBeGreaterThan(0)
    // numeric value formatted with toLocaleString.
    expect(screen.getByText((1234).toLocaleString())).toBeInTheDocument()
  })

  it('uses the label string itself when it is not in the config', () => {
    renderTooltip({
      active: true,
      label: 'No Config',
      payload: [{ dataKey: 'desktop', name: 'desktop', value: 1 }] as never,
    })
    expect(screen.getByText('No Config')).toBeInTheDocument()
  })

  it('uses labelFormatter when provided', () => {
    renderTooltip({
      active: true,
      label: 'desktop',
      labelFormatter: (value) => <span>FMT:{String(value)}</span>,
      payload: [{ dataKey: 'desktop', name: 'desktop', value: 1 }] as never,
    })
    expect(screen.getByText(/FMT:Desktop/)).toBeInTheDocument()
  })

  it('does not render a label when there is no resolvable value', () => {
    renderTooltip({
      active: true,
      payload: [{ dataKey: 'unknown', name: 'unknown', value: 5 }] as never,
    })
    expect(screen.queryByText('Desktop')).not.toBeInTheDocument()
  })

  it('hides the label with hideLabel', () => {
    renderTooltip({
      active: true,
      hideLabel: true,
      label: 'desktop',
      // Item outside the config so that "Desktop" could only come from the top label.
      payload: [{ dataKey: 'unknown', name: 'unknown', value: 1 }] as never,
    })
    expect(screen.queryByText('Desktop')).not.toBeInTheDocument()
  })

  it('nests the label (nestLabel) with indicator "line" and a single item', () => {
    const { container } = renderTooltip({
      active: true,
      indicator: 'line',
      label: 'desktop',
      payload: [{ dataKey: 'desktop', name: 'desktop', value: 1, color: 'red' }] as never,
    })
    expect(screen.getAllByText('Desktop').length).toBeGreaterThan(0)
    expect(container.querySelector('.w-1')).not.toBeNull()
  })

  it('renders indicator "dashed"', () => {
    const { container } = renderTooltip({
      active: true,
      indicator: 'dashed',
      label: 'desktop',
      payload: [{ dataKey: 'desktop', name: 'desktop', value: 1, color: 'red' }] as never,
    })
    expect(container.querySelector('.border-dashed')).not.toBeNull()
  })

  it('omits the indicator with hideIndicator', () => {
    const { container } = renderTooltip({
      active: true,
      hideIndicator: true,
      payload: [
        { dataKey: 'desktop', name: 'desktop', value: 1, color: 'red' },
        { dataKey: 'mobile', name: 'mobile', value: 2, color: 'blue' },
      ] as never,
    })
    expect(container.querySelector('.h-2\\.5.w-2\\.5')).toBeNull()
  })

  it('uses the per-item formatter when provided', () => {
    renderTooltip({
      active: true,
      formatter: (value, name) => (
        <span>
          ITEM:{name}={String(value)}
        </span>
      ),
      payload: [{ dataKey: 'desktop', name: 'desktop', value: 9 }] as never,
    })
    expect(screen.getByText('ITEM:desktop=9')).toBeInTheDocument()
  })

  it('renders the config icon when present', () => {
    const Icon = () => <svg data-testid="cfg-icon" />
    renderTooltip(
      {
        active: true,
        payload: [{ dataKey: 'desktop', name: 'desktop', value: 1 }] as never,
      },
      { desktop: { label: 'Desktop', color: 'red', icon: Icon } },
    )
    expect(screen.getByTestId('cfg-icon')).toBeInTheDocument()
  })

  it('formats a string value and ignores items with type "none" and null value', () => {
    renderTooltip({
      active: true,
      payload: [
        { dataKey: 'desktop', name: 'desktop', value: 'text' },
        { dataKey: 'mobile', name: 'mobile', value: 10, type: 'none' },
        { dataKey: 'extra', name: 'extra', value: null },
      ] as never,
    })
    expect(screen.getByText('text')).toBeInTheDocument()
    // The item with type "none" was filtered out.
    expect(screen.queryByText((10).toLocaleString())).not.toBeInTheDocument()
  })

  it('resolves config via nameKey directly on the item (string)', () => {
    renderTooltip({
      active: true,
      nameKey: 'name',
      payload: [
        { dataKey: 'x', name: 'desktop', value: 1, payload: { fill: 'red' } },
      ] as never,
    })
    expect(screen.getByText('Desktop')).toBeInTheDocument()
  })

  it('resolves config via a nested key in item.payload', () => {
    renderTooltip({
      active: true,
      nameKey: 'category',
      payload: [
        {
          dataKey: 'x',
          name: 'x',
          value: 1,
          payload: { category: 'mobile', fill: 'blue' },
        },
      ] as never,
    })
    expect(screen.getByText('Mobile')).toBeInTheDocument()
  })

  it('tolerates a primitive item in the payload (getPayloadConfigFromPayload)', () => {
    const { container } = renderTooltip({
      active: true,
      payload: ['rawstring'] as never,
    })
    // Does not break: the tooltip container is rendered.
    expect(container.querySelector('.grid')).not.toBeNull()
  })
})
