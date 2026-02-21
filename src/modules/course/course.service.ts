import type { CourseRepository } from './course.repository'
import type { UserRepository } from '../user/user.repository'

export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async list(user: { id: string; role: string }) {
    if (user.role === 'ADMIN') return this.courseRepository.findAll()
    if (user.role === 'TEACHER') return this.courseRepository.findByTeacherId(user.id)
    return this.courseRepository.findByStudentId(user.id)
  }

  async getById(id: string, user: { id: string; role: string }) {

    const course = await this.courseRepository.findById(id)
    if (!course) return { error: 'NOT_FOUND' as const }

    if (user.role === 'STUDENT') {
      const enrolled = course.enrollments.some((e) => e.studentId === user.id)
      if (!enrolled) return { error: 'FORBIDDEN' as const }
    }

    if (user.role === 'TEACHER' && course.teacherId !== user.id) {
      return { error: 'FORBIDDEN' as const }
    }

    return { data: course }
  }

  async create(
    body: { name: string; description?: string; semester?: string; teacherId?: string },
    user: { id: string; role: string },
  ) {
    if (user.role !== 'ADMIN') {
      return { error: 'FORBIDDEN' as const }
    }

    if (body.teacherId) {
      const teacher = await this.userRepository.findById(body.teacherId)
      if (!teacher) return { error: 'TEACHER_NOT_FOUND' as const }
      if (teacher.role !== 'TEACHER') return { error: 'INVALID_TEACHER' as const }
    }

    return { data: await this.courseRepository.create({
      name: body.name,
      description: body.description,
      semester: body.semester,
      teacherId: body.teacherId,
    }) }
  }

  async update(
    id: string,
    body: { name?: string; description?: string; semester?: string; isActive?: boolean },
    user: { id: string; role: string },
  ) {
    const course = await this.courseRepository.findById(id)
    if (!course) return { error: 'NOT_FOUND' as const }
    if (user.role === 'TEACHER' && course.teacherId !== user.id) {
      return { error: 'FORBIDDEN' as const }
    }

    return { data: await this.courseRepository.update(id, body) }
  }

  async delete(id: string) {
    const course = await this.courseRepository.findById(id)
    if (!course) return { error: 'NOT_FOUND' as const }

    await this.courseRepository.delete(id)
    return { data: { success: true } }
  }
}
