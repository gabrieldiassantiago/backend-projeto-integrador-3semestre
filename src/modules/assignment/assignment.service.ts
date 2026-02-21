import type { AssignmentRepository } from './assignment.repository'
import type { CourseRepository } from '../course/course.repository'
import type { EnrollmentRepository } from '../enrollment/enrollment.repository'

export class AssignmentService {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
    private readonly courseRepository: CourseRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

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

    return { data: await this.assignmentRepository.findByCourseId(courseId) }
  }

  async getById(id: string, courseId: string, user: { id: string; role: string }) {
    const assignment = await this.assignmentRepository.findById(id)
    if (!assignment || assignment.courseId !== courseId) return { error: 'NOT_FOUND' as const }

    if (user.role === 'STUDENT') {
      const enrolled = await this.enrollmentRepository.findByStudentAndCourse(user.id, courseId)
      if (!enrolled) return { error: 'FORBIDDEN' as const }
    }
    if (user.role === 'TEACHER' && assignment.course.teacherId !== user.id) {
      return { error: 'FORBIDDEN' as const }
    }

    return { data: assignment }
  }

  async create(
    courseId: string,
    body: { title: string; description?: string; dueDate?: string; maxScore?: number; materialId?: string },
    user: { id: string; role: string },
  ) {
    const course = await this.courseRepository.findById(courseId)
    if (!course) return { error: 'NOT_FOUND' as const }
    if (user.role === 'TEACHER' && course.teacherId !== user.id) {
      return { error: 'FORBIDDEN' as const }
    }

    if (body.materialId) {
      const materialBelongs = course.materials.some((m) => m.id === body.materialId)
      if (!materialBelongs) return { error: 'MATERIAL_NOT_IN_COURSE' as const }
    }

    return {
      data: await this.assignmentRepository.create({
        title: body.title,
        description: body.description,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        maxScore: body.maxScore,
        courseId,
        materialId: body.materialId,
      }),
    }
  }

  async update(
    id: string,
    courseId: string,
    body: { title?: string; description?: string; dueDate?: string | null; maxScore?: number; materialId?: string | null },
    user: { id: string; role: string },
  ) {
    const assignment = await this.assignmentRepository.findById(id)
    if (!assignment || assignment.courseId !== courseId) return { error: 'NOT_FOUND' as const }
    if (user.role === 'TEACHER' && assignment.course.teacherId !== user.id) {
      return { error: 'FORBIDDEN' as const }
    }

    if (body.materialId) {
      const course = await this.courseRepository.findById(courseId)
      const materialBelongs = course?.materials.some((m) => m.id === body.materialId)
      if (!materialBelongs) return { error: 'MATERIAL_NOT_IN_COURSE' as const }
    }

    return {
      data: await this.assignmentRepository.update(id, {
        title: body.title,
        description: body.description,
        dueDate: body.dueDate === null ? null : body.dueDate ? new Date(body.dueDate) : undefined,
        maxScore: body.maxScore,
        materialId: body.materialId,
      }),
    }
  }

  async delete(id: string, courseId: string, user: { id: string; role: string }) {
    const assignment = await this.assignmentRepository.findById(id)
    if (!assignment || assignment.courseId !== courseId) return { error: 'NOT_FOUND' as const }
    if (user.role === 'TEACHER' && assignment.course.teacherId !== user.id) {
      return { error: 'FORBIDDEN' as const }
    }

    await this.assignmentRepository.delete(id)
    return { data: { success: true } }
  }
}
