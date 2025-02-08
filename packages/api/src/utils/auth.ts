export function readBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) return null
  const parts = authorizationHeader.split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1] || null
  }
  return null
}
