import { Elysia, t } from 'elysia'
import { authenticated, requireTeacherOrAdmin, requireAdmin } from '../../shared/guards'
import type { CourseService } from './course.service'

export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  createRoutes() {
    return new Elysia({ prefix: '/courses', tags: ['Courses'] })

      // ── Listar turmas ──────────────────────────────
      .use(authenticated)
      .get('/', ({ user }) => this.courseService.list(user), {
        auth: true,
        detail: {
          summary: 'Listar turmas',
          description: 'Retorna as turmas do usuário. Admin vê todas, Teacher vê as que leciona, Student vê as que está matriculado.',
        },
      })

      // ── Detalhe de uma turma ───────────────────────
      .get('/:courseId', async ({ params: { courseId }, user, status }) => {
        const result = await this.courseService.getById(courseId, user)
        if ('error' in result) {
          return result.error === 'NOT_FOUND' ? status(404) : status(403)
        }
        return result.data
      }, {
        auth: true,
        params: t.Object({ courseId: t.String({ format: 'uuid' }) }),
        detail: {
          summary: 'Detalhe da turma',
          description: 'Retorna os dados completos de uma turma, incluindo materiais, atividades e alunos matriculados. Acesso restrito aos participantes da turma.',
        },
      })

      // ── Criar turma (teacher/admin) ────────────────
      .use(requireTeacherOrAdmin)
      .post('/', async ({ body, user, status }) => {
        const result = await this.courseService.create(body, user)
        if ('error' in result) {
          if (result.error === 'TEACHER_NOT_FOUND') return status(404)
          if (result.error === 'INVALID_TEACHER') return status(422)
        }
        return result.data
      }, {
        requireTeacherOrAdmin: true,
        body: t.Object({
          name: t.String({ minLength: 1, description: 'Nome da turma' }),
          description: t.Optional(t.String({ description: 'Descrição da turma' })),
          semester: t.Optional(t.String({ description: 'Semestre letivo (ex: 2026.1)' })),
          teacherId: t.Optional(t.String({ description: 'ID do professor (apenas admin pode definir; se omitido, usa o usuário logado)' })),
        }),
        detail: {
          summary: 'Criar turma',
          description: 'Cria uma nova turma/disciplina. Requer role Teacher ou Admin. O professor é automaticamente o usuário logado, a menos que um Admin especifique outro teacherId.',
        },
      })

      // ── Atualizar turma ────────────────────────────
      .put('/:courseId', async ({ params: { courseId }, body, user, status }) => {
        const result = await this.courseService.update(courseId, body, user)

        if ('error' in result) {
          return result.error === 'NOT_FOUND' ? status(404) : status(403)
        }

        return result.data
      }, {
        requireTeacherOrAdmin: true,
        params: t.Object({ courseId: t.String({ format: 'uuid' }) }),
        body: t.Object({
          name: t.Optional(t.String({ minLength: 1, description: 'Novo nome da turma' })),
          description: t.Optional(t.String({ description: 'Nova descrição' })),
          semester: t.Optional(t.String({ description: 'Novo semestre letivo' })),
          isActive: t.Optional(t.Boolean({ description: 'Ativar ou desativar a turma' })),
        }),
        detail: {
          summary: 'Atualizar turma',
          description: 'Atualiza dados de uma turma existente. Teacher só pode atualizar turmas que leciona. Admin pode atualizar qualquer turma.',
        },
      })

      // ── Deletar turma (admin only) ─────────────────
      .use(requireAdmin)
      .delete('/:courseId', async ({ params: { courseId }, status }) => {
        const result = await this.courseService.delete(courseId)
        if ('error' in result) return status(404)
        return result.data
      }, {
        params: t.Object({ courseId: t.String({ format: 'uuid' }) }),
        detail: {
          summary: 'Deletar turma',
          description: 'Remove permanentemente uma turma e todos os dados associados (materiais, atividades, matrículas). Apenas Admin.',
        },
      })
  }
}
