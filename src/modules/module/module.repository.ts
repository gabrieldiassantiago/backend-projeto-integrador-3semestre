import type { PrismaClient } from '../../generated/prisma/client'

export class ModuleRepository {
    constructor(private readonly prisma: PrismaClient) { }

    findByCourseId(courseId: string) {
        return this.prisma.module.findMany({
            where: { courseId },
            include: {
                contents: { orderBy: { order: 'asc' } },
                assignments: { orderBy: { createdAt: 'desc' } },
            },
            orderBy: { order: 'asc' },
        })
    }

    findById(id: string) {
        return this.prisma.module.findUnique({
            where: { id },
            include: {
                course: { select: { id: true, teacherId: true } },
                contents: { orderBy: { order: 'asc' } },
            },
        })
    }

    create(data: { title: string; description?: string; order: number; courseId: string }) {
        return this.prisma.module.create({ data })
    }

    update(id: string, data: { title?: string; description?: string; order?: number }) {
        return this.prisma.module.update({ where: { id }, data })
    }

    delete(id: string) {
        return this.prisma.module.delete({ where: { id } })
    }
}
