import { Elysia } from 'elysia'
import { auth } from './auth'

/**
 * Plugin de autenticação — injeta user e session no contexto usando macro.
 */
export const authenticated = new Elysia({ name: 'guard/authenticated' })
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers })
        if (!session) return status(401)
        
        return {
          user: session.user,
          session: session.session
        }
      }
    }
  })

/**
 * Guard que exige role ADMIN ou TEACHER.
 */
export const requireTeacherOrAdmin = new Elysia({ name: 'guard/teacher-or-admin' })
  .use(authenticated)
  .macro({
    requireTeacherOrAdmin: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers })
        if (!session) return status(401)
        if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') return status(403)
        
        return {
          user: session.user,
          session: session.session
        }
      }
    }
  })

/**
 * Guard que exige role ADMIN.
 */
export const requireAdmin = new Elysia({ name: 'guard/admin' })
  .use(authenticated)
  .macro({
    requireAdmin: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers })
        if (!session) return status(401)
        if (session.user.role !== 'ADMIN') return status(403)
        
        return {
          user: session.user,
          session: session.session
        }
      }
    }
  })
