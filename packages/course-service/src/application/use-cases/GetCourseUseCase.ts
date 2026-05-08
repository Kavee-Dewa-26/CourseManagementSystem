import { createHttpError }   from '@shared/errors';
import { ICourseRepository } from '../../domain/repositories/ICourseRepository';
import { Course }            from '../../domain/entities/Course';

export class GetCourseUseCase {
  constructor(private readonly courseRepo: ICourseRepository) {}

  async execute(id: string, isAdmin: boolean): Promise<Course> {
    const course = await this.courseRepo.findById(id);

    if (!course || course.deletedAt !== null) {
      throw createHttpError(404, 'COURSE_NOT_FOUND', 'Course not found.');
    }

    if (!isAdmin && course.state !== 'published') {
      throw createHttpError(404, 'COURSE_NOT_FOUND', 'Course not found.');
    }

    return course;
  }
}
