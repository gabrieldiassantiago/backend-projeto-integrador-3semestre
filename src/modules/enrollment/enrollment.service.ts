import type { EnrollmentRepository } from './enrollment.repository'
import type { CourseRepository } from '../course/course.repository'

export class EnrollmentService {
  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  async listByCourse(courseId: string, user: { id: string; role: string }) {
    const course = await this.courseRepository.findById(courseId)
    if (!course) return { error: 'NOT_FOUND' as const }


    return { data: await this.enrollmentRepository.findByCourseId(courseId) }
  }

  async enroll(courseId: string, studentId: string, user: { id: string; role: string }) {
    const course = await this.courseRepository.findById(courseId)
    if (!course) return { error: 'NOT_FOUND' as const }
    if (user.role === 'TEACHER' && course.teacherId !== user.id) {
      return { error: 'FORBIDDEN' as const }
    }

    const existing = await this.enrollmentRepository.findByStudentAndCourse(studentId, courseId)
    if (existing) return { error: 'ALREADY_ENROLLED' as const }

    return { data: await this.enrollmentRepository.create(studentId, courseId) }
  }

  async enrollBatch(courseId: string, studentIds: string[], user: { id: string; role: string }) {
    const course = await this.courseRepository.findById(courseId)
    if (!course) return { error: 'NOT_FOUND' as const }
    if (user.role === 'TEACHER' && course.teacherId !== user.id) {
      return { error: 'FORBIDDEN' as const }
    }

    const result = await this.enrollmentRepository.createMany(studentIds, courseId)
    return { data: { enrolled: result.count } }
  }

  async unenroll(courseId: string, studentId: string, user: { id: string; role: string }) {
    const course = await this.courseRepository.findById(courseId)
    if (!course) return { error: 'NOT_FOUND' as const }
    if (user.role === 'TEACHER' && course.teacherId !== user.id) {
      return { error: 'FORBIDDEN' as const }
    }

    const existing = await this.enrollmentRepository.findByStudentAndCourse(studentId, courseId)
    if (!existing) return { error: 'NOT_FOUND' as const }

    await this.enrollmentRepository.delete(studentId, courseId)
    return { data: { success: true } }
  }
}
