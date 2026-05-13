import { createHttpError }   from '@shared/errors';
import { ICourseRepository } from '../../domain/repositories/ICourseRepository';
import { Course }            from '../../domain/entities/Course';

export interface UpdateCourseInput {
  id:             string;
  code?:          string;
  title?:         string;
  description?:   string;
  coverImageUrl?: string | null;
}

export class UpdateCourseUseCase {
  constructor(private readonly courseRepo: ICourseRepository) {}

  async execute(input: UpdateCourseInput): Promise<Course> {
    const course = await this.courseRepo.findById(input.id);
    if (!course) throw createHttpError(404, 'COURSE_NOT_FOUND', 'Course not found.');

    if (input.code !== undefined && input.code !== course.code) {
      const existing = await this.courseRepo.findByCode(input.code);
      if (existing) throw createHttpError(409, 'COURSE_CODE_EXISTS', 'A course with this code already exists.');
    }

    if (input.title !== undefined && input.title !== course.title) {
      const existing = await this.courseRepo.findByTitle(input.title);
      if (existing) throw createHttpError(409, 'COURSE_TITLE_EXISTS', 'A course with this title already exists.');
    }

    course.update({ code: input.code, title: input.title, description: input.description, coverImageUrl: input.coverImageUrl });
    await this.courseRepo.update(course);
    return course;
  }
}
