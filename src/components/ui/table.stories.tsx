// table.stories.tsx — documentation + interaction (regression) tests via play functions.
// Table is a COMPOSITIONAL primitive (Table + Header/Body/Footer/Row/Head/Cell/Caption),
// with no `cva` variants nor callbacks: the tests assert the semantic structure/ARIA
// (native table roles) and the row selection flow (`data-state="selected"`).

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

// Sample data reused across the stories (list of invoices).
const invoices = [
  { invoice: 'INV001', status: 'Paid', method: 'Credit card', amount: '$250.00' },
  { invoice: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
  { invoice: 'INV003', status: 'Unpaid', method: 'Bank slip', amount: '$350.00' },
  { invoice: 'INV004', status: 'Paid', method: 'Credit card', amount: '$450.00' },
]

const meta = {
  title: 'Data Display/Table',
  component: Table,
  // No `autodocs`: the docs page is the custom MDX (table.mdx). Having both
  // would generate duplicate Docs entries (MultipleIndexingError).
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

/* ----- States (render-tested + axe) ----- */

/** Base table composed of header and body. */
export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
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

/** Same as Default — entry point for the **Controls** panel. */
export const Playground: Story = { ...Default }

/** `TableCaption` labels the table (rendered as `<caption>`). */
export const WithCaption: Story = {
  render: (args) => (
    <Table {...args}>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
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

/** `TableFooter` closes the table with a totals row. */
export const WithFooter: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
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
          <TableCell className="text-right">$1,200.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

/** Empty state: a single cell that spans all columns. */
export const Empty: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} className="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

// Table with controlled per-row selection: each checkbox marks the row with
// `data-state="selected"` (the same style hook used by the data-table).
function SelectableTable() {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({})
  const allChecked = invoices.every((row) => selected[row.invoice])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              aria-label="Select all rows"
              checked={allChecked}
              onCheckedChange={(value) =>
                setSelected(
                  Object.fromEntries(invoices.map((row) => [row.invoice, !!value])),
                )
              }
            />
          </TableHead>
          <TableHead>Invoice</TableHead>
          <TableHead className="text-right">Amount</TableHead>
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
                aria-label={`Select ${row.invoice}`}
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

/** Row selection by checkbox; the selected row gets `data-state="selected"`. */
export const SelectableRows: Story = {
  render: () => <SelectableTable />,
}

// Accounts grouped by status (finance/CRM case): each group is labeled by
// a `TableGroupRow` that spans the full width.
const accounts = {
  Overdue: [
    { id: 'CT-001', cliente: 'ACME', amount: '$1,200.00' },
    { id: 'CT-002', cliente: 'Globex', amount: '$800.00' },
  ],
  'To pay': [{ id: 'CT-101', cliente: 'Initech', amount: '$500.00' }],
  Paid: [
    { id: 'CT-201', cliente: 'Umbrella', amount: '$2,000.00' },
    { id: 'CT-202', cliente: 'Soylent', amount: '$300.00' },
  ],
}

// Grouped accounts table reused by the group stories. `columnCount`
// vs. `colSpan` covers both sides of the hybrid model; `containerClassName`
// limits the height on the correct container for `sticky` to anchor to.
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
          <TableHead className="w-[120px]">Account</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead className="text-right">Amount</TableHead>
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
 * Rows grouped by status. `Table` provides `columnCount`, so each
 * `TableGroupRow` resolves its `colSpan` automatically (via context).
 */
export const GroupedRows: Story = {
  render: () => <GroupedAccountsTable columnCount={3} />,
}

/**
 * Without `columnCount` on `Table`, the `colSpan` comes via a prop on each
 * `TableGroupRow` (hybrid model fallback).
 */
export const GroupColSpanFallback: Story = {
  render: () => <GroupedAccountsTable colSpan={3} />,
}

/**
 * Group headers pinned on scroll. The vertical scroll lives on `Table`'s own
 * container (`containerClassName` with a limited height) — that is where the
 * `sticky` `top-0` anchors; an external wrapper would not work.
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

/* ----- Interaction tests (regression) ----- */

/** The composition exposes the native table semantics (roles and counts). */
export const RendersTableSemantics: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('table')).toBeInTheDocument()
    // 4 columns in the header.
    await expect(canvas.getAllByRole('columnheader')).toHaveLength(4)
    // 1 header row + 4 body rows.
    await expect(canvas.getAllByRole('row')).toHaveLength(invoices.length + 1)
    // Data cells: 4 columns × 4 rows.
    await expect(canvas.getAllByRole('cell')).toHaveLength(invoices.length * 4)
  },
}

/** `TableCaption` is rendered as `<caption>` and labels the table. */
export const CaptionLabelsTable: Story = {
  ...WithCaption,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const caption = canvas.getByText('A list of your recent invoices.')
    await expect(caption.tagName).toBe('CAPTION')
    await expect(canvas.getByRole('table')).toContainElement(caption)
  },
}

/** Checking a row's checkbox applies `data-state="selected"` to it. */
export const SelectsRow: Story = {
  render: () => <SelectableTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const rowCheckbox = canvas.getByRole('checkbox', { name: 'Select INV001' })
    await expect(rowCheckbox).not.toBeChecked()

    await userEvent.click(rowCheckbox)

    await expect(rowCheckbox).toBeChecked()
    await expect(rowCheckbox.closest('tr')).toHaveAttribute('data-state', 'selected')
    // The other rows remain unselected.
    const otherCheckbox = canvas.getByRole('checkbox', { name: 'Select INV002' })
    await expect(otherCheckbox.closest('tr')).not.toHaveAttribute('data-state')
  },
}

/** The "select all" checks all rows at once. */
export const SelectsAllRows: Story = {
  render: () => <SelectableTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select all rows' }))

    const rowCheckboxes = canvas.getAllByRole('checkbox', { name: /Select INV/ })
    for (const checkbox of rowCheckboxes) {
      await expect(checkbox).toBeChecked()
      await expect(checkbox.closest('tr')).toHaveAttribute('data-state', 'selected')
    }
  },
}

/** Empty state: a single cell reports the absence of results. */
export const RendersEmptyState: Story = {
  ...Empty,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('No results.')).toBeInTheDocument()
    // Only the header row + the "empty" row.
    await expect(canvas.getAllByRole('row')).toHaveLength(2)
  },
}

/** The `TableGroupRow` becomes a `<th scope="rowgroup">` with `colSpan` from the context. */
export const GroupHeaderSpansColumns: Story = {
  ...GroupedRows,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const overdue = canvas.getByText('Overdue')
    // Group header: <th>, rowgroup scope, colSpan inherited from columnCount=3.
    await expect(overdue.tagName).toBe('TH')
    await expect(overdue).toHaveAttribute('scope', 'rowgroup')
    await expect(overdue).toHaveAttribute('colspan', '3')
    // The count appears as "(n)" next to the label.
    await expect(within(overdue).getByText('(2)')).toBeInTheDocument()
    // There is one header per group.
    await expect(canvas.getByText('To pay')).toBeInTheDocument()
    await expect(canvas.getByText('Paid')).toBeInTheDocument()
  },
}

/** Without context, the `colSpan` comes from the prop (hybrid model fallback). */
export const GroupHeaderColSpanFallback: Story = {
  ...GroupColSpanFallback,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The Table does not provide columnCount, so the colSpan came from the prop.
    await expect(canvas.getByText('Overdue')).toHaveAttribute('colspan', '3')
  },
}

/** `sticky` marks the cell with `data-sticky` (the visual effect is covered by Chromatic). */
export const GroupHeaderIsSticky: Story = {
  ...StickyGroupHeaders,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Overdue')).toHaveAttribute('data-sticky', 'true')
  },
}
