import type { PrismaClient, ContentType } from '../../generated/prisma/client'

export class ContentRepository {
    constructor(private readonly prisma: PrismaClient) { }

    findByModuleId(moduleId: string) {
        return this.prisma.content.findMany({
            where: { moduleId },
            include: { module: { select: { id: true, courseId: true } } },
            orderBy: { order: 'asc' },
        })
    }

    findById(id: string) {
        return this.prisma.content.findUnique({
            where: { id },
            include: { module: { select: { id: true, courseId: true, course: { select: { teacherId: true } } } } },
        })
    }

    create(data: { title: string; type: ContentType; body?: string; fileUrl?: string; order: number; moduleId: string }) {
        return this.prisma.content.create({ data })
    }

    update(id: string, data: { title?: string; body?: string; fileUrl?: string; order?: number }) {
        return this.prisma.content.update({ where: { id }, data })
    }

    delete(id: string) {
        return this.prisma.content.delete({ where: { id } })
    }
}
