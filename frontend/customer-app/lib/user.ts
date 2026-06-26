// Maps strictly to the user API contract:
//   GET /api/v1/users/my-info -> UserDTO

export type UserRole = 'ROLE_STUDENT' | 'ROLE_MANAGER' | 'ROLE_ADMIN'

export interface UserDTO {
  id: number
  name: string
  email: string
  phoneNumber?: string
  address?: string
  profileUrl: string | null
  active: boolean
  roles: UserRole[]
}

// Human-friendly label for the first role in the roles array.
export const ROLE_LABEL: Record<UserRole, string> = {
  ROLE_STUDENT: 'Student',
  ROLE_MANAGER: 'Manager',
  ROLE_ADMIN: 'Admin',
}

// Derives uppercase initials from a full name, e.g. "John Doe" -> "JD".
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}