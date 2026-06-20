import { describe, expect, it } from 'vitest'

import { getPaginationRange } from './pagination'

// `getPaginationRange` is pure logic (no DOM): we cover the ellipsis branches
// here in jsdom; UI behavior lives in the stories (ADR 0006).
describe('getPaginationRange', () => {
  it('lists all pages when they fit without ellipsis', () => {
    expect(getPaginationRange({ page: 1, total: 5 })).toEqual([1, 2, 3, 4, 5])
  })

  it('places ellipsis on the right near the start', () => {
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

  it('places ellipsis on the left near the end', () => {
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

  it('places ellipsis on both sides in the middle', () => {
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

  it('respects a larger siblingCount', () => {
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

  it('respects a larger boundaryCount', () => {
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

  it('replaces the ellipsis with a single page when it would hide only 1', () => {
    // total=8, page=7: on the right side only page 7 would remain between the block
    // and the edge, so we show the page itself instead of an ellipsis.
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

  it('handles a total of 1 page', () => {
    expect(getPaginationRange({ page: 1, total: 1 })).toEqual([1])
  })
})
