import type { Meta, StoryObj } from '@storybook/react-vite'
import { MoreHorizontal, Search, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { PaginationShort } from '@/components/ui/pagination'
import { Select } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/**
 * **Team** — uma tela de gestão orientada a dados. Reúne busca (`InputGroup`),
 * filtro (`Select`), seleção de linhas (`Checkbox` + `data-state="selected"`),
 * status com `Badge`, ações por linha em `DropdownMenu` e `PaginationShort`,
 * tudo dentro de um `Card`.
 */
const meta = {
  title: 'Examples/Team',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A data-management screen: a searchable, filterable, paginated `Table` ' +
          'with row selection, avatars, role and status `Badge`s and per-row ' +
          '`DropdownMenu` actions — wrapped in a `Card` toolbar.',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

type Status = 'Ativo' | 'Convidado' | 'Inativo'

type Member = {
  id: string
  name: string
  email: string
  role: string
  status: Status
  img: number
}

const members: Member[] = [
  {
    id: '1',
    name: 'Ana Souza',
    email: 'ana@timds.dev',
    role: 'Admin',
    status: 'Ativo',
    img: 47,
  },
  {
    id: '2',
    name: 'Bruno Lima',
    email: 'bruno@timds.dev',
    role: 'Dev',
    status: 'Ativo',
    img: 12,
  },
  {
    id: '3',
    name: 'Carla Dias',
    email: 'carla@timds.dev',
    role: 'Design',
    status: 'Convidado',
    img: 5,
  },
  {
    id: '4',
    name: 'Diego Reis',
    email: 'diego@timds.dev',
    role: 'Dev',
    status: 'Ativo',
    img: 33,
  },
  {
    id: '5',
    name: 'Elena Prado',
    email: 'elena@timds.dev',
    role: 'Produto',
    status: 'Inativo',
    img: 24,
  },
  {
    id: '6',
    name: 'Felipe Nunes',
    email: 'felipe@timds.dev',
    role: 'Dev',
    status: 'Ativo',
    img: 8,
  },
  {
    id: '7',
    name: 'Gabi Rocha',
    email: 'gabi@timds.dev',
    role: 'Design',
    status: 'Convidado',
    img: 16,
  },
  {
    id: '8',
    name: 'Hugo Mello',
    email: 'hugo@timds.dev',
    role: 'Produto',
    status: 'Ativo',
    img: 51,
  },
]

const statusVariant: Record<Status, 'success' | 'warning' | 'secondary'> = {
  Ativo: 'success',
  Convidado: 'warning',
  Inativo: 'secondary',
}

const roleOptions = [
  { value: 'all', label: 'Todas as funções' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Dev', label: 'Dev' },
  { value: 'Design', label: 'Design' },
  { value: 'Produto', label: 'Produto' },
]

const PAGE_SIZE = 5

function TeamTable() {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return members.filter((m) => {
      const matchesQuery =
        !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      const matchesRole = role === 'all' || m.role === role
      return matchesQuery && matchesRole
    })
  }, [query, role])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const pageRows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const allOnPageSelected =
    pageRows.length > 0 && pageRows.every((m) => selected.has(m.id))

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allOnPageSelected) {
        for (const m of pageRows) next.delete(m.id)
      } else {
        for (const m of pageRows) next.add(m.id)
      }
      return next
    })
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 py-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-2xl tracking-tight">Equipe</h1>
          <p className="text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'membro' : 'membros'}
            {selected.size > 0 ? ` · ${selected.size} selecionado(s)` : ''}
          </p>
        </div>
        <Button>
          <UserPlus className="size-4" aria-hidden="true" /> Convidar
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <CardHeader className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <InputGroup className="sm:max-w-xs">
            <InputGroupAddon>
              <Search className="size-4" aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar por nome ou e-mail..."
              aria-label="Buscar membros"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
            />
          </InputGroup>
          <Select
            options={roleOptions}
            defaultValue="all"
            aria-label="Filtrar por função"
            onValueChange={(v) => {
              setRole(v as string)
              setPage(1)
            }}
            triggerClassName="sm:w-48"
          />
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    aria-label="Selecionar todos nesta página"
                    checked={allOnPageSelected}
                    onCheckedChange={toggleAllOnPage}
                  />
                </TableHead>
                <TableHead>Membro</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10 text-right">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((m) => (
                <TableRow
                  key={m.id}
                  data-state={selected.has(m.id) ? 'selected' : undefined}
                >
                  <TableCell>
                    <Checkbox
                      aria-label={`Selecionar ${m.name}`}
                      checked={selected.has(m.id)}
                      onCheckedChange={() => toggle(m.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage
                          src={`https://i.pravatar.cc/80?img=${m.img}`}
                          alt={m.name}
                        />
                        <AvatarFallback>
                          {m.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-muted-foreground text-xs">{m.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{m.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[m.status]}>{m.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Ações de ${m.name}`}
                        >
                          <MoreHorizontal className="size-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                        <DropdownMenuItem>Editar função</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          Remover da equipe
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhum membro encontrado.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <PaginationShort page={current} total={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => <TeamTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Buscar reduz a lista a um único membro.
    await userEvent.type(canvas.getByLabelText('Buscar membros'), 'bruno')
    await expect(canvas.getByText('Bruno Lima')).toBeInTheDocument()
    await expect(canvas.queryByText('Ana Souza')).not.toBeInTheDocument()
    // Selecionar a linha marca o estado "selected".
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Selecionar Bruno Lima' }))
    await expect(canvas.getByText(/1 selecionado/)).toBeInTheDocument()
  },
}
