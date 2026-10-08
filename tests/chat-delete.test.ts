import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  member: vi.fn(),
  remove: vi.fn(),
  doc: vi.fn(),
}))
vi.mock('next-auth', () => ({ getServerSession: mocks.session }))
vi.mock('@/auth', () => ({ authOptions: {} }))
vi.mock('@/firebase-admin', () => ({
  adminDB: {
    collection: () => ({ doc: mocks.doc }),
    recursiveDelete: mocks.remove,
  },
}))
import { DELETE } from '@/app/api/chat/delete/route'
function request(
  body: unknown = { chatId: 'chat-123' },
  origin = 'http://localhost:3000'
) {
  return new Request('http://localhost:3000/api/chat/delete', {
    method: 'DELETE',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}
beforeEach(() => {
  vi.resetAllMocks()
  mocks.session.mockResolvedValue({ user: { id: 'user-123' } })
  mocks.member.mockResolvedValue({
    exists: true,
    data: () => ({ isAdmin: true }),
  })
  mocks.doc.mockReturnValue({
    collection: () => ({ doc: () => ({ get: mocks.member }) }),
  })
  mocks.remove.mockResolvedValue(undefined)
})
describe('chat deletion authorization', () => {
  it('rejects unauthenticated callers', async () => {
    mocks.session.mockResolvedValue(null)
    expect((await DELETE(request())).status).toBe(401)
    expect(mocks.doc).not.toHaveBeenCalled()
  })
  it('rejects cross-origin requests', async () => {
    expect(
      (await DELETE(request(undefined, 'https://attacker.example'))).status
    ).toBe(403)
    expect(mocks.remove).not.toHaveBeenCalled()
  })
  it.each([{}, { chatId: '../other' }, { chatId: 1 }, { chatId: '' }])(
    'rejects invalid IDs: %j',
    async (body) => {
      expect((await DELETE(request(body))).status).toBe(400)
      expect(mocks.doc).not.toHaveBeenCalled()
    }
  )
  it('rejects malformed JSON', async () => {
    const req = new Request('http://localhost:3000/api/chat/delete', {
      method: 'DELETE',
      body: '{',
    })
    expect((await DELETE(req)).status).toBe(400)
  })
  it.each([
    { exists: false, data: () => undefined },
    { exists: true, data: () => ({ isAdmin: false }) },
  ])('rejects non-admin users', async (member) => {
    mocks.member.mockResolvedValue(member)
    expect((await DELETE(request())).status).toBe(403)
    expect(mocks.remove).not.toHaveBeenCalled()
  })
  it('allows a chat admin to delete their chat', async () => {
    const response = await DELETE(request())
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true })
    expect(mocks.remove).toHaveBeenCalledOnce()
  })
})
