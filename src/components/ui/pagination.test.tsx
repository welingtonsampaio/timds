import { describe, expect, it } from 'vitest'

import { getPaginationRange } from './pagination'

// `getPaginationRange` é lógica pura (sem DOM): cobrimos os ramos de reticências
// aqui em jsdom; o comportamento de UI fica nas stories (ADR 0006).
describe('getPaginationRange', () => {
  it('lista todas as páginas quando cabem sem reticências', () => {
    expect(getPaginationRange({ page: 1, total: 5 })).toEqual([1, 2, 3, 4, 5])
  })

  it('coloca reticências à direita perto do início', () => {
    expect(getPaginationRange({ page: 1, total: 10 })).toEqual([
      1,
      2,
      3,
      4,
      5,
      'ellipsis',
      10,
    ])
  })

  it('coloca reticências à esquerda perto do fim', () => {
    expect(getPaginationRange({ page: 10, total: 10 })).toEqual([
      1,
      'ellipsis',
      6,
      7,
      8,
      9,
      10,
    ])
  })

  it('coloca reticências dos dois lados no meio', () => {
    expect(getPaginationRange({ page: 6, total: 10 })).toEqual([
      1,
      'ellipsis',
      5,
      6,
      7,
      'ellipsis',
      10,
    ])
  })

  it('respeita siblingCount maior', () => {
    expect(getPaginationRange({ page: 6, total: 12, siblingCount: 2 })).toEqual([
      1,
      'ellipsis',
      4,
      5,
      6,
      7,
      8,
      'ellipsis',
      12,
    ])
  })

  it('respeita boundaryCount maior', () => {
    expect(getPaginationRange({ page: 6, total: 12, boundaryCount: 2 })).toEqual([
      1,
      2,
      'ellipsis',
      5,
      6,
      7,
      'ellipsis',
      11,
      12,
    ])
  })

  it('substitui a reticência por uma página solta quando ela esconderia só 1', () => {
    // total=8, page=7: do lado direito sobraria apenas a página 7 entre o bloco e
    // a borda, então mostramos a própria página em vez de uma reticência.
    expect(getPaginationRange({ page: 7, total: 8 })).toEqual([
      1,
      'ellipsis',
      4,
      5,
      6,
      7,
      8,
    ])
  })

  it('lida com total de 1 página', () => {
    expect(getPaginationRange({ page: 1, total: 1 })).toEqual([1])
  })
})
