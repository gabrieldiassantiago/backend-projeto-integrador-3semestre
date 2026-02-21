import { prisma } from '../../../prisma/prisma.config'
import { CourseRepository } from './course.repository'
import { UserRepository } from '../user/user.repository'
import { CourseService } from './course.service'
import { CourseController } from './course.controller'

const courseRepository = new CourseRepository(prisma)
const userRepository = new UserRepository(prisma)
const courseService = new CourseService(courseRepository, userRepository)
const courseController = new CourseController(courseService)

export const courseRoutes = courseController.createRoutes()
export { courseRepository }