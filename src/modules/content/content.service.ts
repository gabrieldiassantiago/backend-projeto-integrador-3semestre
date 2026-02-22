import type { ContentRepository } from './content.repository'
import type { ModuleRepository } from '../module/module.repository'
import type { EnrollmentRepository } from '../enrollment/enrollment.repository'
import type { ContentType } from '../../generated/prisma/client'

export class ContentService {
    constructor(
        private readonly contentRepository: ContentRepository,
        private readonly moduleRepository: ModuleRepository,
        private readonly enrollmentRepository: EnrollmentRepository,
    ) { }

    async listByModule(moduleId: string, courseId: string, user: { id: string; role: string }) {
        const module = await this.moduleRepository.findById(moduleId)
        if (!module || module.courseId !== courseId) return { error: 'NOT_FOUND' as const }

        if (user.role === 'STUDENT') {
            const enrolled = await this.enrollmentRepository.findByStudentAndCourse(user.id, courseId)
            if (!enrolled) return { error: 'FORBIDDEN' as const }
        }
        if (user.role === 'TEACHER' && module.course.teacherId !== user.id) {
            return { error: 'FORBIDDEN' as const }
        }

        return { data: await this.contentRepository.findByModuleId(moduleId) }
    }

    async getById(id: string, moduleId: string, courseId: string, user: { id: string; role: string }) {
        const content = await this.contentRepository.findById(id)
        if (!content || content.moduleId !== moduleId || content.module.courseId !== courseId) return { error: 'NOT_FOUND' as const }

        if (user.role === 'STUDENT') {
            const enrolled = await this.enrollmentRepository.findByStudentAndCourse(user.id, courseId)
            if (!enrolled) return { error: 'FORBIDDEN' as const }
        }
        if (user.role === 'TEACHER' && content.module.course.teacherId !== user.id) {
            return { error: 'FORBIDDEN' as const }
        }

        return { data: content }
    }

    async create(moduleId: string, courseId: string, body: { title: string; type: ContentType; body?: string; fileUrl?: string; order: number }, user: { id: string; role: string }) {
        const module = await this.moduleRepository.findById(moduleId)
        if (!module || module.courseId !== courseId) return { error: 'NOT_FOUND' as const }
        if (user.role === 'TEACHER' && module.course.teacherId !== user.id) {
            return { error: 'FORBIDDEN' as const }
        }

        return {
            data: await this.contentRepository.create({
                ...body,
                moduleId,
            }),
        }
    }

    async update(id: string, moduleId: string, courseId: string, body: { title?: string; body?: string; fileUrl?: string; order?: number }, user: { id: string; role: string }) {
        const content = await this.contentRepository.findById(id)
        if (!content || content.moduleId !== moduleId || content.module.courseId !== courseId) return { error: 'NOT_FOUND' as const }
        if (user.role === 'TEACHER' && content.module.course.teacherId !== user.id) {
            return { error: 'FORBIDDEN' as const }
        }

        return {
            data: await this.contentRepository.update(id, body),
        }
    }

    async delete(id: string, moduleId: string, courseId: string, user: { id: string; role: string }) {
        const content = await this.contentRepository.findById(id)
        if (!content || content.moduleId !== moduleId || content.module.courseId !== courseId) return { error: 'NOT_FOUND' as const }
        if (user.role === 'TEACHER' && content.module.course.teacherId !== user.id) {
            return { error: 'FORBIDDEN' as const }
        }

        await this.contentRepository.delete(id)
        return { data: { success: true } }
    }
}
