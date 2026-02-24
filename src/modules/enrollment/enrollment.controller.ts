import { Elysia, t } from 'elysia'
import { requireTeacherOrAdmin } from '../../shared/guards'
import type { EnrollmentService } from './enrollment.service'

export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  createRoutes() {
    return new Elysia({ prefix: '/courses/:courseId/enrollments', tags: ['Enrollments'] })

      .use(requireTeacherOrAdmin)

      .get('/', async ({ params: { courseId }, user, status }) => {
        const result = await this.enrollmentService.listByCourse(courseId, user)
        if ('error' in result) {
          return result.error === 'NOT_FOUND' ? status(404) : status(403)
        }
        return result.data
      }, {
        requireTeacherOrAdmin: true,
        params: t.Object({ courseId: t.String({ format: 'uuid' }) }),
        detail: {
          summary: 'Listar alunos matriculados',
          description: 'Retorna todos os alunos matriculados em uma turma. Requer role Teacher (da turma) ou Admin.',
        },
      })


      //Matricular aluno 
      .post('/', async ({ params: { courseId }, body, user, status }) => {
        const result = await this.enrollmentService.enroll(courseId, body.studentId, user)
        if ('error' in result) {
          if (result.error === 'NOT_FOUND') return status(404)
          if (result.error === 'FORBIDDEN') return status(403)
          return status(409)  
        }
        return result.data
      }, {
        requireTeacherOrAdmin: true,
        params: t.Object({ courseId: t.String({ format: 'uuid' }) }),
        body: t.Object({
          studentId: t.String({ description: 'ID do aluno a ser matriculado' }),
        }),
        detail: {
          summary: 'Matricular aluno',
          description: 'Matricula um aluno em uma turma. Retorna 409 se o aluno já estiver matriculado. Requer role Teacher (da turma) ou Admin.',
        },
      })

      // ── Matricular em lote 
      .post('/batch', async ({ params: { courseId }, body, user, status }) => {
        const result = await this.enrollmentService.enrollBatch(courseId, body.studentIds, user)
        if ('error' in result) {
          return result.error === 'NOT_FOUND' ? status(404) : status(403)
        }
        return result.data
      }, {
        requireTeacherOrAdmin: true,
        params: t.Object({ courseId: t.String({ format: 'uuid' }) }),
        body: t.Object({
          studentIds: t.Array(t.String({ description: 'ID do aluno' }), { minItems: 1, description: 'Lista de IDs dos alunos a matricular' }),
        }),
        detail: {
          summary: 'Matricular alunos em lote',
          description: 'Matricula vários alunos de uma vez na turma. Duplicatas são ignoradas automaticamente. Requer role Teacher (da turma) ou Admin.',
        },
      })

      // ── Remover matrícula
      .delete('/:studentId', async ({ params: { courseId, studentId }, user, status }) => {
        const result = await this.enrollmentService.unenroll(courseId, studentId, user)
        if ('error' in result) {
          return result.error === 'NOT_FOUND' ? status(404) : status(403)
        }
        return result.data
      }, {
        requireTeacherOrAdmin: true,
        params: t.Object({
          courseId: t.String({ format: 'uuid' }),
          studentId: t.String({ description: 'ID do aluno a ser removido' }),
        }),
        detail: {
          summary: 'Remover matrícula',
          description: 'Remove a matrícula de um aluno de uma turma. Requer role Teacher (da turma) ou Admin.',
        },
      })
  }
}
