export function getTenant(req: Request): { userId: string; companyId: string; role: string } {
  const userId = req.headers.get('x-user-id')
  const companyId = req.headers.get('x-company-id')
  const role = req.headers.get('x-user-role')

  if (!userId || !companyId || !role) {
    throw new Error('Unauthorized')
  }

  return { userId, companyId, role }
}

export function getUserId(req: Request): string {
  const userId = req.headers.get('x-user-id')
  if (!userId) throw new Error('Unauthorized')
  return userId
}
