import type { ModuleRepository } from './module.repository'
import type { CourseRepository } from '../course/course.repository'
import type { EnrollmentRepository } from '../enrollment/enrollment.repository'

export class ModuleService {
    constructor(
        private readonly moduleRepository: ModuleRepository,
        private readonly courseRepository: CourseRepository,
        private readonly enrollmentRepository: EnrollmentRepository,
    ) { }

    async listByCourse(courseId: string, user: { id: string; role: string }) {
        const course = await this.courseRepository.findById(courseId)
        if (!course) return { error: 'NOT_FOUND' as const }

        if (user.role === 'STUDENT') {
            const enrolled = await this.enrollmentRepository.findByStudentAndCourse(user.id, courseId)
            if (!enrolled) return { error: 'FORBIDDEN' as const }
        }
        if (user.role === 'TEACHER' && course.teacherId !== user.id) {
            return { error: 'FORBIDDEN' as const }
        }

        return { data: await this.moduleRepository.findByCourseId(courseId) }
    }

    async getById(id: string, courseId: string, user: { id: string; role: string }) {
        const module = await this.moduleRepository.findById(id)
        if (!module || module.courseId !== courseId) return { error: 'NOT_FOUND' as const }

        if (user.role === 'STUDENT') {
            const enrolled = await this.enrollmentRepository.findByStudentAndCourse(user.id, courseId)
            if (!enrolled) return { error: 'FORBIDDEN' as const }
        }
        if (user.role === 'TEACHER' && module.course.teacherId !== user.id) {
            return { error: 'FORBIDDEN' as const }
        }

        return { data: module }
    }

    async create(courseId: string, body: { title: string; description?: string; order: number }, user: { id: string; role: string }) {
        const course = await this.courseRepository.findById(courseId)
        if (!course) return { error: 'NOT_FOUND' as const }
        if (user.role === 'TEACHER' && course.teacherId !== user.id) {
            return { error: 'FORBIDDEN' as const }
        }

        return {
            data: await this.moduleRepository.create({
                title: body.title,
                description: body.description,
                order: body.order,
                courseId,
            }),
        }
    }

    async update(id: string, courseId: string, body: { title?: string; description?: string; order?: number }, user: { id: string; role: string }) {
        const module = await this.moduleRepository.findById(id)
        if (!module || module.courseId !== courseId) return { error: 'NOT_FOUND' as const }
        if (user.role === 'TEACHER' && module.course.teacherId !== user.id) {
            return { error: 'FORBIDDEN' as const }
        }

        return {
            data: await this.moduleRepository.update(id, body),
        }
    }

    async delete(id: string, courseId: string, user: { id: string; role: string }) {
        const module = await this.moduleRepository.findById(id)
        if (!module || module.courseId !== courseId) return { error: 'NOT_FOUND' as const }
        if (user.role === 'TEACHER' && module.course.teacherId !== user.id) {
            return { error: 'FORBIDDEN' as const }
        }

        await this.moduleRepository.delete(id)
        return { data: { success: true } }
    }
}
