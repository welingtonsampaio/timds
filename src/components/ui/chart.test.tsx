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

// Renderiza o conteúdo de tooltip dentro do container (que provê o contexto).
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
  it('lança erro quando o conteúdo é usado fora do ChartContainer', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<ChartTooltipContent active payload={[]} />)).toThrow(
      /ChartContainer/,
    )
    spy.mockRestore()
  })

  it('respeita o id informado no data-chart', () => {
    const { container } = render(
      <ChartContainer id="vendas" config={config}>
        <div />
      </ChartContainer>,
    )
    expect(container.querySelector('[data-chart="chart-vendas"]')).not.toBeNull()
  })
})

describe('ChartStyle', () => {
  it('não renderiza nada quando nenhuma cor/tema é configurada', () => {
    const { container } = render(
      <ChartStyle id="x" config={{ desktop: { label: 'Desktop' } }} />,
    )
    expect(container.querySelector('style')).toBeNull()
  })

  it('injeta variáveis CSS para cores e temas', () => {
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

  it('omite a variável quando a cor do tema é vazia', () => {
    const { container } = render(
      <ChartStyle
        id="z"
        config={{ c: { label: 'C', theme: { light: 'green', dark: '' } } }}
      />,
    )
    const style = container.querySelector('style')
    expect(style?.innerHTML).toContain('--color-c: green')
    // O tema dark tem cor vazia → não gera a variável.
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

  it('não renderiza nada sem payload', () => {
    const { container } = renderLegend({ payload: [] })
    expect(container.querySelector('.gap-4')).toBeNull()
  })

  it('renderiza rótulos e o swatch de cor padrão', () => {
    renderLegend({
      payload: [
        { value: 'desktop', dataKey: 'desktop', color: 'red', type: 'square' },
        // Sem dataKey nem nameKey → cai no fallback de chave 'value'.
        { value: 'sem-chave', color: 'green', type: 'square' },
        { value: 'none', dataKey: 'none', color: 'gray', type: 'none' },
      ] as never,
    })
    expect(screen.getByText('Desktop')).toBeInTheDocument()
    // O item type "none" é filtrado.
    expect(screen.queryByText('none')).not.toBeInTheDocument()
  })

  it('usa o ícone do config quando presente e hideIcon é falso', () => {
    const Icon = () => <svg data-testid="legend-icon" />
    renderLegend(
      { verticalAlign: 'top', payload: [{ dataKey: 'desktop', color: 'red' }] as never },
      { desktop: { label: 'Desktop', color: 'red', icon: Icon } },
    )
    expect(screen.getByTestId('legend-icon')).toBeInTheDocument()
  })

  it('oculta o ícone do config com hideIcon e resolve via nameKey', () => {
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
  it('não renderiza quando inativo ou sem payload', () => {
    const { container } = renderTooltip({ active: false, payload: [] })
    expect(container.querySelector('.grid')).toBeNull()
  })

  it('mostra o rótulo a partir do config quando label é string', () => {
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
    // value numérico formatado com toLocaleString.
    expect(screen.getByText((1234).toLocaleString())).toBeInTheDocument()
  })

  it('usa a própria string de label quando não está no config', () => {
    renderTooltip({
      active: true,
      label: 'Sem Config',
      payload: [{ dataKey: 'desktop', name: 'desktop', value: 1 }] as never,
    })
    expect(screen.getByText('Sem Config')).toBeInTheDocument()
  })

  it('usa labelFormatter quando fornecido', () => {
    renderTooltip({
      active: true,
      label: 'desktop',
      labelFormatter: (value) => <span>FMT:{String(value)}</span>,
      payload: [{ dataKey: 'desktop', name: 'desktop', value: 1 }] as never,
    })
    expect(screen.getByText(/FMT:Desktop/)).toBeInTheDocument()
  })

  it('não renderiza rótulo quando não há valor resolvível', () => {
    renderTooltip({
      active: true,
      payload: [{ dataKey: 'unknown', name: 'unknown', value: 5 }] as never,
    })
    expect(screen.queryByText('Desktop')).not.toBeInTheDocument()
  })

  it('oculta o rótulo com hideLabel', () => {
    renderTooltip({
      active: true,
      hideLabel: true,
      label: 'desktop',
      // Item fora do config para que "Desktop" só pudesse vir do rótulo do topo.
      payload: [{ dataKey: 'unknown', name: 'unknown', value: 1 }] as never,
    })
    expect(screen.queryByText('Desktop')).not.toBeInTheDocument()
  })

  it('aninha o rótulo (nestLabel) com indicator "line" e único item', () => {
    const { container } = renderTooltip({
      active: true,
      indicator: 'line',
      label: 'desktop',
      payload: [{ dataKey: 'desktop', name: 'desktop', value: 1, color: 'red' }] as never,
    })
    expect(screen.getAllByText('Desktop').length).toBeGreaterThan(0)
    expect(container.querySelector('.w-1')).not.toBeNull()
  })

  it('renderiza indicator "dashed"', () => {
    const { container } = renderTooltip({
      active: true,
      indicator: 'dashed',
      label: 'desktop',
      payload: [{ dataKey: 'desktop', name: 'desktop', value: 1, color: 'red' }] as never,
    })
    expect(container.querySelector('.border-dashed')).not.toBeNull()
  })

  it('omite o indicador com hideIndicator', () => {
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

  it('usa o formatter por item quando fornecido', () => {
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

  it('renderiza o ícone do config quando presente', () => {
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

  it('formata valor string e ignora itens type "none" e value nulo', () => {
    renderTooltip({
      active: true,
      payload: [
        { dataKey: 'desktop', name: 'desktop', value: 'texto' },
        { dataKey: 'mobile', name: 'mobile', value: 10, type: 'none' },
        { dataKey: 'extra', name: 'extra', value: null },
      ] as never,
    })
    expect(screen.getByText('texto')).toBeInTheDocument()
    // O item type "none" foi filtrado.
    expect(screen.queryByText((10).toLocaleString())).not.toBeInTheDocument()
  })

  it('resolve config via nameKey direto no item (string)', () => {
    renderTooltip({
      active: true,
      nameKey: 'name',
      payload: [
        { dataKey: 'x', name: 'desktop', value: 1, payload: { fill: 'red' } },
      ] as never,
    })
    expect(screen.getByText('Desktop')).toBeInTheDocument()
  })

  it('resolve config via chave aninhada em item.payload', () => {
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

  it('tolera item primitivo no payload (getPayloadConfigFromPayload)', () => {
    const { container } = renderTooltip({
      active: true,
      payload: ['rawstring'] as never,
    })
    // Não quebra: o container do tooltip é renderizado.
    expect(container.querySelector('.grid')).not.toBeNull()
  })
})
