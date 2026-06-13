import { createSession } from '../_shared'

export async function POST(request) {
  return createSession(request, '/auth/register')
}
