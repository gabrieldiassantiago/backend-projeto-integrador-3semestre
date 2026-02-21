import { Elysia, t } from 'elysia'
import { authenticated, requireTeacherOrAdmin } from '../../shared/guards'
import type { AssignmentService } from './assignment.service'

export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  createRoutes() {
    return new Elysia({ prefix: '/courses/:courseId/assignments', tags: ['Assignments'] })

      // ── Listar atividades da turma ─────────────────
      .use(authenticated)
      .get('/', async ({ params: { courseId }, user, status }) => {
        const result = await this.assignmentService.listByCourse(courseId, user)
        if ('error' in result) {
          return result.error === 'NOT_FOUND' ? status(404) : status(403)
        }
        return result.data
      }, {
        auth: true,
        params: t.Object({ courseId: t.String({ format: 'uuid' }) }),
        detail: {
          summary: 'Listar atividades',
          description: 'Retorna todas as atividades de uma turma com contagem de entregas. Alunos precisam estar matriculados.',
        },
      })

      // ── Detalhe de uma atividade ───────────────────
      .get('/:id', async ({ params: { courseId, id }, user, status }) => {
        const result = await this.assignmentService.getById(id, courseId, user)
        if ('error' in result) {
          return result.error === 'NOT_FOUND' ? status(404) : status(403)
        }
        return result.data
      }, {
        auth: true,
        params: t.Object({
          courseId: t.String({ format: 'uuid' }),
          id: t.String({ format: 'uuid', description: 'ID da atividade' }),
        }),
        detail: {
          summary: 'Detalhe da atividade',
          description: 'Retorna dados completos de uma atividade incluindo todas as entregas dos alunos. Alunos precisam estar matriculados.',
        },
      })

      // ── Criar atividade (teacher/admin) ────────────
      .use(requireTeacherOrAdmin)
      .post('/', async ({ params: { courseId }, body, user, status }) => {
        const result = await this.assignmentService.create(courseId, body, user)
        if ('error' in result) {
          if (result.error === 'NOT_FOUND') return status(404)
          if (result.error === 'MATERIAL_NOT_IN_COURSE') return status(422)
          return status(403)
        }
        return result.data
      }, {        requireTeacherOrAdmin: true,        params: t.Object({ courseId: t.String({ format: 'uuid' }) }),
        body: t.Object({
          title: t.String({ minLength: 1, description: 'Título da atividade' }),
          description: t.Optional(t.String({ description: 'Descrição/enunciado da atividade' })),
          dueDate: t.Optional(t.String({ format: 'date-time', description: 'Data limite de entrega (ISO 8601)' })),
          maxScore: t.Optional(t.Number({ minimum: 1, description: 'Nota máxima (padrão: 100)' })),
          materialId: t.Optional(t.String({ format: 'uuid', description: 'ID do material vinculado (deve pertencer à mesma turma)' })),
        }),
        detail: {
          summary: 'Criar atividade',
          description: 'Cria uma nova atividade/tarefa na turma. Requer role Teacher (da turma) ou Admin.',
        },
      })

      // ── Atualizar atividade ────────────────────────
      .put('/:id', async ({ params: { courseId, id }, body, user, status }) => {
        const result = await this.assignmentService.update(id, courseId, body, user)
        if ('error' in result) {
          if (result.error === 'NOT_FOUND') return status(404)
          if (result.error === 'MATERIAL_NOT_IN_COURSE') return status(422)
          return status(403)
        }
        return result.data
      }, {
        requireTeacherOrAdmin: true,
        params: t.Object({
          courseId: t.String({ format: 'uuid' }),
          id: t.String({ format: 'uuid', description: 'ID da atividade' }),
        }),
        body: t.Object({
          title: t.Optional(t.String({ minLength: 1, description: 'Novo título' })),
          description: t.Optional(t.String({ description: 'Nova descrição/enunciado' })),
          dueDate: t.Optional(t.Nullable(t.String({ format: 'date-time', description: 'Nova data limite (null para remover)' }))),
          maxScore: t.Optional(t.Number({ minimum: 1, description: 'Nova nota máxima' })),
          materialId: t.Optional(t.Nullable(t.String({ format: 'uuid', description: 'ID do material vinculado (null para desvincular)' }))),
        }),
        detail: {
          summary: 'Atualizar atividade',
          description: 'Atualiza uma atividade existente. Envie apenas os campos que deseja alterar. Envie dueDate como null para remover o prazo. Requer role Teacher (da turma) ou Admin.',
        },
      })

      // ── Deletar atividade ──────────────────────────
      .delete('/:id', async ({ params: { courseId, id }, user, status }) => {
        const result = await this.assignmentService.delete(id, courseId, user)
        if ('error' in result) {
          return result.error === 'NOT_FOUND' ? status(404) : status(403)
        }
        return result.data
      }, {
        requireTeacherOrAdmin: true,
        params: t.Object({
          courseId: t.String({ format: 'uuid' }),
          id: t.String({ format: 'uuid', description: 'ID da atividade' }),
        }),
        detail: {
          summary: 'Deletar atividade',
          description: 'Remove permanentemente uma atividade e todas as entregas associadas. Requer role Teacher (da turma) ou Admin.',
        },
      })
  }
}
