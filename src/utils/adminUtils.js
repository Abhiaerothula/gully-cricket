/** List of admin emails — owner can edit this list */
export const ADMIN_EMAILS = [
  'abhi.aero.thula@gmail.com',
]

export function isAdmin(email) {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.trim().toLowerCase())
}

const ADMIN_SESSION_KEY = 'gc_admin_email'

export function getAdminSession() {
  try { return localStorage.getItem(ADMIN_SESSION_KEY) || null } catch { return null }
}

export function setAdminSession(email) {
  try { localStorage.setItem(ADMIN_SESSION_KEY, email) } catch {}
}

export function clearAdminSession() {
  try { localStorage.removeItem(ADMIN_SESSION_KEY) } catch {}
}
