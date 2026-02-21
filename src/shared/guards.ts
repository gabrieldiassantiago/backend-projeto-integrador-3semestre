import { Elysia } from 'elysia'
import { auth } from './auth'

/**
 * Plugin de autenticação — injeta user e session no contexto.
 */

export const authenticated = new Elysia({ name: 'guard/authenticated' })
  .derive({ as: 'scoped' }, async ({ request: { headers }, status }) => {
    const session = await auth.api.getSession({ headers })
    if (!session) return status(401)
    return { user: session.user, session: session.session }
  })

/**
 * Guard que exige role ADMIN ou TEACHER.
 */

export const requireTeacherOrAdmin = new Elysia({ name: 'guard/teacher-or-admin' })
  .use(authenticated)
  .derive({ as: 'scoped' }, ({ user, status }) => {
    if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) return status(403)
    return { user }
  })

/**
 * Guard que exige role ADMIN.
 */

export const requireAdmin = new Elysia({ name: 'guard/admin' })
  .use(authenticated)
  .derive({ as: 'scoped' }, ({ user, status }) => {
    if (!user || user.role !== 'ADMIN') return status(403)
    return { user }
  })
