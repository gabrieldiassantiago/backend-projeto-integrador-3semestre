import type { PrismaClient } from '../../generated/prisma/client'

export class AssignmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByCourseId(courseId: string) {
    return this.prisma.assignment.findMany({
      where: { courseId },
      include: {
        material: { select: { id: true, title: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  findById(id: string) {
    return this.prisma.assignment.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, teacherId: true } },
        material: { select: { id: true, title: true, content: true, fileUrl: true } },
        submissions: {
          include: { student: { select: { id: true, name: true, email: true } } },
          orderBy: { submittedAt: 'desc' },
        },
        _count: { select: { submissions: true } },
      },
    })
  }

  create(data: {
    title: string
    description?: string
    dueDate?: Date
    maxScore?: number
    courseId: string
    materialId?: string
  }) {
    return this.prisma.assignment.create({ data })
  }

  update(id: string, data: {
    title?: string
    description?: string
    dueDate?: Date | null
    maxScore?: number
    materialId?: string | null
  }) {
    return this.prisma.assignment.update({ where: { id }, data })
  }

  delete(id: string) {
    return this.prisma.assignment.delete({ where: { id } })
  }
}
