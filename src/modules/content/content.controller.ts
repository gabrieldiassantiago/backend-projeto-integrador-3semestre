import { Elysia, t } from 'elysia'
import { authenticated, requireTeacherOrAdmin } from '../../shared/guards'
import type { ContentService } from './content.service'
import { ContentType } from '../../generated/prisma/client'

export class ContentController {
    constructor(private readonly contentService: ContentService) { }

    createRoutes() {
        return new Elysia({ prefix: '/courses/:courseId/modules/:moduleId/contents', tags: ['Contents'] })
            .use(authenticated)

            .get('/', async ({ params: { courseId, moduleId }, user, status }) => {
                const result = await this.contentService.listByModule(moduleId, courseId, user)
                if ('error' in result) {
                    return result.error === 'NOT_FOUND' ? status(404) : status(403)
                }
                return result.data
            }, {
                auth: true,
                params: t.Object({
                    courseId: t.String({ format: 'uuid' }),
                    moduleId: t.String({ format: 'uuid' })
                }),
                detail: {
                    summary: 'Listar conteúdos',
                    description: 'Lista todos os conteúdos, dados e arquivos que pertencem a um módulo específico de uma turma. O usuário deve ser aluno ou professor.',
                },
            })

            .get('/:contentId', async ({ params: { courseId, moduleId, contentId }, user, status }) => {
                const result = await this.contentService.getById(contentId, moduleId, courseId, user)
                if ('error' in result) {
                    return result.error === 'NOT_FOUND' ? status(404) : status(403)
                }
                return result.data
            }, {
                auth: true,
                params: t.Object({
                    courseId: t.String({ format: 'uuid' }),
                    moduleId: t.String({ format: 'uuid' }),
                    contentId: t.String({ format: 'uuid' }),
                }),
                detail: {
                    summary: 'Detalhar conteúdo',
                    description: 'Traz de forma detalhada o conteúdo selecionado, informando corpo, url de arquivo (se possuir) e as informações do módulo atrelado.',
                },
            })

            .use(requireTeacherOrAdmin)
            .post('/', async ({ params: { courseId, moduleId }, body, user, status }) => {
                const result = await this.contentService.create(moduleId, courseId, body as any, user)
                if ('error' in result) {
                    return result.error === 'NOT_FOUND' ? status(404) : status(403)
                }
                return result.data
            }, {
                requireTeacherOrAdmin: true,
                params: t.Object({
                    courseId: t.String({ format: 'uuid' }),
                    moduleId: t.String({ format: 'uuid' })
                }),
                body: t.Object({
                    title: t.String({ minLength: 1, description: 'Título do conteúdo (ex: Vídeo 1)' }),
                    type: t.Enum(ContentType, { description: 'Enum dos tipos de arquivo aceitos, como TEXT, ATTACHMENT, VIDEO, LINK' }),
                    body: t.Optional(t.String({ description: 'Markdown, código HTML ou formatação de texto se aplicável' })),
                    fileUrl: t.Optional(t.String({ description: 'Link ou caminho onde o arquivo se encontra, se o content for vídeo ou anexo' })),
                    order: t.Number({ description: 'O peso ou ordem em que deve aparecer' }),
                }),
                detail: {
                    summary: 'Criar conteúdo',
                    description: 'Adiciona novos arquivos, anexos, textos ou links dentro de um módulo de ensino (professores ou admins apenas).',
                },
            })

            .put('/:contentId', async ({ params: { courseId, moduleId, contentId }, body, user, status }) => {
                const result = await this.contentService.update(contentId, moduleId, courseId, body, user)
                if ('error' in result) {
                    return result.error === 'NOT_FOUND' ? status(404) : status(403)
                }
                return result.data
            }, {
                requireTeacherOrAdmin: true,
                params: t.Object({
                    courseId: t.String({ format: 'uuid' }),
                    moduleId: t.String({ format: 'uuid' }),
                    contentId: t.String({ format: 'uuid' }),
                }),
                body: t.Object({
                    title: t.Optional(t.String({ minLength: 1 })),
                    body: t.Optional(t.String()),
                    fileUrl: t.Optional(t.String()),
                    order: t.Optional(t.Number()),
                }),
                detail: {
                    summary: 'Atualizar conteúdo',
                    description: 'Altera os paramentros de textos, links, etc de um conteúdo ativo já instanciado (professores ou admins apenas).',
                },
            })

            .delete('/:contentId', async ({ params: { courseId, moduleId, contentId }, user, status }) => {
                const result = await this.contentService.delete(contentId, moduleId, courseId, user)
                if ('error' in result) {
                    return result.error === 'NOT_FOUND' ? status(404) : status(403)
                }
                return result.data
            }, {
                requireTeacherOrAdmin: true,
                params: t.Object({
                    courseId: t.String({ format: 'uuid' }),
                    moduleId: t.String({ format: 'uuid' }),
                    contentId: t.String({ format: 'uuid' }),
                }),
                detail: {
                    summary: 'Excluir conteúdo',
                    description: 'Apaga inteiramente da base de dados um material que se referia ao conteúdo anterior e sua chave correspondente. Este comando não desvincula arquivos de nuvem. Só exclui o metadado. Professores/admins.',
                },
            })
    }
}
