import { Elysia, t } from 'elysia'
import { authenticated, requireTeacherOrAdmin } from '../../shared/guards'
import type { ModuleService } from './module.service'

export class ModuleController {
    constructor(private readonly moduleService: ModuleService) { }

    createRoutes() {
        return new Elysia({ prefix: '/courses/:courseId/modules', tags: ['Modules'] })
            .use(authenticated)

            .get('/', async ({ params: { courseId }, user, status }) => {
                const result = await this.moduleService.listByCourse(courseId, user)
                if ('error' in result) {
                    return result.error === 'NOT_FOUND' ? status(404) : status(403)
                }
                return result.data
            }, {
                auth: true,
                params: t.Object({ courseId: t.String({ format: 'uuid' }) }),
                detail: {
                    summary: 'Listar módulos',
                    description: 'Retorna todos os módulos de uma turma específica. O usuário deve ser aluno matriculado ou professor da turma.',
                },
            })

            .get('/:moduleId', async ({ params: { courseId, moduleId }, user, status }) => {
                const result = await this.moduleService.getById(moduleId, courseId, user)
                if ('error' in result) {
                    return result.error === 'NOT_FOUND' ? status(404) : status(403)
                }
                return result.data
            }, {
                auth: true,
                params: t.Object({
                    courseId: t.String({ format: 'uuid' }),
                    moduleId: t.String({ format: 'uuid' }),
                }),
                detail: {
                    summary: 'Detalhar módulo',
                    description: 'Retorna os detalhes de um módulo específico de forma unificada (junto dos seus conteúdos e atividades).',
                },
            })

            .use(requireTeacherOrAdmin)
            .post('/', async ({ params: { courseId }, body, user, status }) => {
                const result = await this.moduleService.create(courseId, body, user)
                if ('error' in result) {
                    return result.error === 'NOT_FOUND' ? status(404) : status(403)
                }
                return result.data
            }, {
                requireTeacherOrAdmin: true,
                params: t.Object({ courseId: t.String({ format: 'uuid' }) }),
                body: t.Object({
                    title: t.String({ minLength: 1, description: 'Título do módulo' }),
                    description: t.Optional(t.String({ description: 'Descrição detalhada do módulo' })),
                    order: t.Number({ description: 'Ordem de exibição do módulo (ex: 1, 2, 3...)' }),
                }),
                detail: {
                    summary: 'Criar módulo',
                    description: 'Cria um novo módulo dentro de uma turma. Somente professores ou admins podem criar módulos.',
                },
            })

            .put('/:moduleId', async ({ params: { courseId, moduleId }, body, user, status }) => {
                const result = await this.moduleService.update(moduleId, courseId, body, user)
                if ('error' in result) {
                    return result.error === 'NOT_FOUND' ? status(404) : status(403)
                }
                return result.data
            }, {
                requireTeacherOrAdmin: true,
                params: t.Object({
                    courseId: t.String({ format: 'uuid' }),
                    moduleId: t.String({ format: 'uuid' }),
                }),
                body: t.Object({
                    title: t.Optional(t.String({ minLength: 1, description: 'Novo título' })),
                    description: t.Optional(t.String({ description: 'Nova descrição' })),
                    order: t.Optional(t.Number({ description: 'Nova ordem de exibição' })),
                }),
                detail: {
                    summary: 'Atualizar módulo',
                    description: 'Atualiza um ou mais campos de um módulo existente. Somente professores ou admins podem realizar esta ação.',
                },
            })

            .delete('/:moduleId', async ({ params: { courseId, moduleId }, user, status }) => {
                const result = await this.moduleService.delete(moduleId, courseId, user)
                if ('error' in result) {
                    return result.error === 'NOT_FOUND' ? status(404) : status(403)
                }
                return result.data
            }, {
                requireTeacherOrAdmin: true,
                params: t.Object({
                    courseId: t.String({ format: 'uuid' }),
                    moduleId: t.String({ format: 'uuid' }),
                }),
                detail: {
                    summary: 'Excluir módulo',
                    description: 'Remove um módulo específico permanentemente. Ao fazer isso, todos os conteúdos atrelados ao módulo também são apagados devido ao Cascade.',
                },
            })
    }
}
