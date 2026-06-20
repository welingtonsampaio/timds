// table.stories.tsx — documentação + testes de interação (regressão) via play functions.
// Table é um primitivo COMPOSITIVO (Table + Header/Body/Footer/Row/Head/Cell/Caption),
// sem variantes `cva` nem callbacks: os testes asseguram estrutura/ARIA semântica
// (roles nativas de tabela) e o fluxo de seleção de linha (`data-state="selected"`).

import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { Checkbox } from './checkbox'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableGroupRow,
  TableHead,
  TableHeader,
  TableRow,
} from './table'

// Dados de exemplo reutilizados pelas stories (lista de faturas).
const invoices = [
  { invoice: 'INV001', status: 'Pago', method: 'Cartão de crédito', amount: 'R$ 250,00' },
  { invoice: 'INV002', status: 'Pendente', method: 'PayPal', amount: 'R$ 150,00' },
  { invoice: 'INV003', status: 'Em aberto', method: 'Boleto', amount: 'R$ 350,00' },
  { invoice: 'INV004', status: 'Pago', method: 'Cartão de crédito', amount: 'R$ 450,00' },
]

const meta = {
  title: 'Data Display/Table',
  component: Table,
  // Sem `autodocs`: a página de docs é a MDX customizada (table.mdx). Ter os dois
  // geraria entradas de Docs duplicadas (MultipleIndexingError).
  parameters: {
    docs: {
      description: {
        component:
          'Compositional data table built on native HTML table elements wrapped for ' +
          'consistent styling. Compose `Table` with `TableHeader`, `TableBody`, ' +
          '`TableFooter`, `TableRow`, `TableHead`, `TableCell` and an optional ' +
          '`TableCaption`. It has **no visual variants**: it inherits the design ' +
          'tokens and exposes the native table semantics (roles `table`, `row`, ' +
          '`columnheader`, `cell`). Mark a selected row with `data-state="selected"`.',
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Extra classes merged onto the `<table>` element (via `cn`).',
    },
  },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

/* ----- Estados (render-tested + axe) ----- */

/** Tabela base composta de cabeçalho e corpo. */
export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Fatura</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Método</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((row) => (
          <TableRow key={row.invoice}>
            <TableCell className="font-medium">{row.invoice}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell>{row.method}</TableCell>
            <TableCell className="text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

/** Igual à Default — ponto de entrada para o painel **Controls**. */
export const Playground: Story = { ...Default }

/** `TableCaption` rotula a tabela (renderizado como `<caption>`). */
export const WithCaption: Story = {
  render: (args) => (
    <Table {...args}>
      <TableCaption>Lista das suas faturas recentes.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Fatura</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((row) => (
          <TableRow key={row.invoice}>
            <TableCell className="font-medium">{row.invoice}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell className="text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

/** `TableFooter` fecha a tabela com uma linha de totais. */
export const WithFooter: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Fatura</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((row) => (
          <TableRow key={row.invoice}>
            <TableCell className="font-medium">{row.invoice}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell className="text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right">R$ 1.200,00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

/** Estado vazio: uma única célula que ocupa todas as colunas. */
export const Empty: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Fatura</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} className="h-24 text-center">
            Nenhum resultado.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

// Tabela com seleção controlada por linha: cada checkbox marca a linha com
// `data-state="selected"` (o mesmo gancho de estilo usado pelo data-table).
function SelectableTable() {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({})
  const allChecked = invoices.every((row) => selected[row.invoice])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              aria-label="Selecionar todas as linhas"
              checked={allChecked}
              onCheckedChange={(value) =>
                setSelected(
                  Object.fromEntries(invoices.map((row) => [row.invoice, !!value])),
                )
              }
            />
          </TableHead>
          <TableHead>Fatura</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((row) => (
          <TableRow
            key={row.invoice}
            data-state={selected[row.invoice] ? 'selected' : undefined}
          >
            <TableCell>
              <Checkbox
                aria-label={`Selecionar ${row.invoice}`}
                checked={!!selected[row.invoice]}
                onCheckedChange={(value) =>
                  setSelected((prev) => ({ ...prev, [row.invoice]: !!value }))
                }
              />
            </TableCell>
            <TableCell className="font-medium">{row.invoice}</TableCell>
            <TableCell className="text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/** Seleção de linha por checkbox; a linha marcada recebe `data-state="selected"`. */
export const SelectableRows: Story = {
  render: () => <SelectableTable />,
}

// Contas agrupadas por status (caso financeiro/CRM): cada grupo é rotulado por
// uma `TableGroupRow` que ocupa a largura toda.
const accounts = {
  Vencidas: [
    { id: 'CT-001', cliente: 'ACME', amount: 'R$ 1.200,00' },
    { id: 'CT-002', cliente: 'Globex', amount: 'R$ 800,00' },
  ],
  'A pagar': [{ id: 'CT-101', cliente: 'Initech', amount: 'R$ 500,00' }],
  Pagas: [
    { id: 'CT-201', cliente: 'Umbrella', amount: 'R$ 2.000,00' },
    { id: 'CT-202', cliente: 'Soylent', amount: 'R$ 300,00' },
  ],
}

// Tabela de contas agrupadas reutilizada pelas stories de grupo. `columnCount`
// vs. `colSpan` cobre os dois lados do modelo híbrido; `containerClassName`
// limita a altura no container correto para o `sticky` ancorar.
function GroupedAccountsTable({
  columnCount,
  colSpan,
  sticky,
  containerClassName,
}: {
  columnCount?: number
  colSpan?: number
  sticky?: boolean
  containerClassName?: string
}) {
  return (
    <Table columnCount={columnCount} containerClassName={containerClassName}>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Conta</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(accounts).map(([group, rows]) => (
          <React.Fragment key={group}>
            <TableGroupRow colSpan={colSpan} count={rows.length} sticky={sticky}>
              {group}
            </TableGroupRow>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.id}</TableCell>
                <TableCell>{row.cliente}</TableCell>
                <TableCell className="text-right">{row.amount}</TableCell>
              </TableRow>
            ))}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  )
}

/**
 * Linhas agrupadas por status. `Table` informa `columnCount`, então cada
 * `TableGroupRow` resolve o `colSpan` automaticamente (via context).
 */
export const GroupedRows: Story = {
  render: () => <GroupedAccountsTable columnCount={3} />,
}

/**
 * Sem `columnCount` na `Table`, o `colSpan` vem por prop em cada `TableGroupRow`
 * (fallback do modelo híbrido).
 */
export const GroupColSpanFallback: Story = {
  render: () => <GroupedAccountsTable colSpan={3} />,
}

/**
 * Cabeçalhos de grupo fixos no scroll. O scroll vertical mora no container da
 * própria `Table` (`containerClassName` com altura limitada) — é nele que o
 * `top-0` do `sticky` se ancora; um wrapper externo não funcionaria.
 */
export const StickyGroupHeaders: Story = {
  render: () => (
    <GroupedAccountsTable
      columnCount={3}
      sticky
      containerClassName="max-h-64 overflow-y-auto rounded-md border"
    />
  ),
}

/* ----- Testes de interação (regressão) ----- */

/** A composição expõe a semântica nativa de tabela (roles e contagem). */
export const RendersTableSemantics: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('table')).toBeInTheDocument()
    // 4 colunas no cabeçalho.
    await expect(canvas.getAllByRole('columnheader')).toHaveLength(4)
    // 1 linha de cabeçalho + 4 de corpo.
    await expect(canvas.getAllByRole('row')).toHaveLength(invoices.length + 1)
    // Células de dados: 4 colunas × 4 linhas.
    await expect(canvas.getAllByRole('cell')).toHaveLength(invoices.length * 4)
  },
}

/** `TableCaption` é renderizado como `<caption>` e rotula a tabela. */
export const CaptionLabelsTable: Story = {
  ...WithCaption,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const caption = canvas.getByText('Lista das suas faturas recentes.')
    await expect(caption.tagName).toBe('CAPTION')
    await expect(canvas.getByRole('table')).toContainElement(caption)
  },
}

/** Marcar o checkbox de uma linha aplica `data-state="selected"` a ela. */
export const SelectsRow: Story = {
  render: () => <SelectableTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const rowCheckbox = canvas.getByRole('checkbox', { name: 'Selecionar INV001' })
    await expect(rowCheckbox).not.toBeChecked()

    await userEvent.click(rowCheckbox)

    await expect(rowCheckbox).toBeChecked()
    await expect(rowCheckbox.closest('tr')).toHaveAttribute('data-state', 'selected')
    // As demais linhas seguem sem seleção.
    const otherCheckbox = canvas.getByRole('checkbox', { name: 'Selecionar INV002' })
    await expect(otherCheckbox.closest('tr')).not.toHaveAttribute('data-state')
  },
}

/** O "selecionar todas" marca todas as linhas de uma vez. */
export const SelectsAllRows: Story = {
  render: () => <SelectableTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Selecionar todas as linhas' }),
    )

    const rowCheckboxes = canvas.getAllByRole('checkbox', { name: /Selecionar INV/ })
    for (const checkbox of rowCheckboxes) {
      await expect(checkbox).toBeChecked()
      await expect(checkbox.closest('tr')).toHaveAttribute('data-state', 'selected')
    }
  },
}

/** Estado vazio: uma única célula informa a ausência de resultados. */
export const RendersEmptyState: Story = {
  ...Empty,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Nenhum resultado.')).toBeInTheDocument()
    // Apenas a linha de cabeçalho + a linha de "vazio".
    await expect(canvas.getAllByRole('row')).toHaveLength(2)
  },
}

/** A `TableGroupRow` vira um `<th scope="rowgroup">` com `colSpan` vindo do context. */
export const GroupHeaderSpansColumns: Story = {
  ...GroupedRows,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const vencidas = canvas.getByText('Vencidas')
    // Cabeçalho de grupo: <th>, escopo rowgroup, colSpan herdado de columnCount=3.
    await expect(vencidas.tagName).toBe('TH')
    await expect(vencidas).toHaveAttribute('scope', 'rowgroup')
    await expect(vencidas).toHaveAttribute('colspan', '3')
    // A contagem aparece como "(n)" ao lado do rótulo.
    await expect(within(vencidas).getByText('(2)')).toBeInTheDocument()
    // Há um cabeçalho por grupo.
    await expect(canvas.getByText('A pagar')).toBeInTheDocument()
    await expect(canvas.getByText('Pagas')).toBeInTheDocument()
  },
}

/** Sem context, o `colSpan` vem da prop (fallback do modelo híbrido). */
export const GroupHeaderColSpanFallback: Story = {
  ...GroupColSpanFallback,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // A Table não informa columnCount, então o colSpan veio da prop.
    await expect(canvas.getByText('Vencidas')).toHaveAttribute('colspan', '3')
  },
}

/** `sticky` marca a célula com `data-sticky` (o efeito visual é coberto pelo Chromatic). */
export const GroupHeaderIsSticky: Story = {
  ...StickyGroupHeaders,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Vencidas')).toHaveAttribute('data-sticky', 'true')
  },
}
