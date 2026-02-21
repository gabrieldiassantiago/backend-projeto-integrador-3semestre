import type { PrismaClient } from '../../generated/prisma/client'

export class CourseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll() {
    return this.prisma.course.findMany({
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  findByTeacherId(teacherId: string) {
    return this.prisma.course.findMany({
      where: { teacherId },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  findByStudentId(studentId: string) {
    return this.prisma.course.findMany({
      where: { enrollments: { some: { studentId } } },
      include: {
        teacher: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  findById(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        materials: { orderBy: { createdAt: 'desc' } },
        assignments: { orderBy: { createdAt: 'desc' } },
        enrollments: {
          include: { student: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { enrollments: true } },
      },
    })
  }

  create(data: { name: string; description?: string; semester?: string; teacherId?: string }) {
    return this.prisma.course.create({
      data: {
        name: data.name,
        description: data.description,
        semester: data.semester,
        ...(data.teacherId ? { teacher: { connect: { id: data.teacherId } } } : {}),
      },
    })
  }

  update(id: string, data: { name?: string; description?: string; semester?: string; isActive?: boolean }) {
    return this.prisma.course.update({ where: { id }, data })
  }

  delete(id: string) {
    return this.prisma.course.delete({ where: { id } })
  }
}
