import type { PrismaClient } from '../../generated/prisma/client'

export class EnrollmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByStudentAndCourse(studentId: string, courseId: string) {
    return this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    })
  }

  findByCourseId(courseId: string) {
    return this.prisma.enrollment.findMany({
      where: { courseId },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { enrolledAt: 'desc' },
    })
  }

  findByStudentId(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: { course: { select: { id: true, name: true, semester: true } } },
      orderBy: { enrolledAt: 'desc' },
    })
  }

  create(studentId: string, courseId: string) {
    return this.prisma.enrollment.create({
      data: { studentId, courseId },
      include: { student: { select: { id: true, name: true, email: true } } },
    })
  }

  createMany(studentIds: string[], courseId: string) {
    return this.prisma.enrollment.createMany({
      data: studentIds.map((studentId) => ({ studentId, courseId })),
      skipDuplicates: true,
    })
  }

  delete(studentId: string, courseId: string) {
    return this.prisma.enrollment.delete({
      where: { studentId_courseId: { studentId, courseId } },
    })
  }
}
