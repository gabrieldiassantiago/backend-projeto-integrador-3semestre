import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { auth, OpenAPI } from './shared/auth'
import { courseRoutes } from './modules/course'
import { enrollmentRoutes } from './modules/enrollment'
import { materialRoutes } from './modules/material'
import { assignmentRoutes } from './modules/assignment'

const betterAuth = new Elysia({ name: 'better-auth' })
  .mount(auth.handler)

const app = new Elysia()
  .use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))
  .use(openapi({
    path: '/docs',
    documentation: {
      components: await OpenAPI.components,
      paths: await OpenAPI.getPaths(),
      info: {
        title: 'AVA API',
        version: '1.0.0',
      },
    },
  }))
  .use(betterAuth)
  .get('/health', () => ({ status: 'ok' }))
  .use(courseRoutes)
  .use(enrollmentRoutes)
  .use(materialRoutes)
  .use(assignmentRoutes)
  .listen(3000)
