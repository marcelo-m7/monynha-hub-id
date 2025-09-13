import { describe, it, expect, vi } from 'vitest'
import * as clerk from '@clerk/nextjs/server'
import { safeAuth } from '../lib/safe-auth'

describe('safeAuth', () => {
  it('returns userId when auth succeeds', async () => {
    vi.spyOn(clerk, 'auth').mockResolvedValueOnce({ userId: '123' } as any)
    const result = await safeAuth()
    expect(result.userId).toBe('123')
  })

  it('returns null userId when auth throws', async () => {
    vi.spyOn(clerk, 'auth').mockRejectedValueOnce(new Error('fail'))
    const result = await safeAuth()
    expect(result.userId).toBeNull()
  })
})
