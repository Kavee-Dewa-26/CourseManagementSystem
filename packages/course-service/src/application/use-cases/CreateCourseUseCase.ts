import { v4 as uuidv4 }       from 'uuid';
import { createHttpError }    from '@shared/errors';
import { ICourseRepository }  from '../../domain/repositories/ICourseRepository';
import { Course }             from '../../domain/entities/Course';

export interface CreateCourseInput {
  code:          string;
  title:         string;
  description:   string;
  coverImageUrl: string | null;
  createdBy:     string;
}

export class CreateCourseUseCase {
  constructor(private readonly courseRepo: ICourseRepository) {}

  async execute(input: CreateCourseInput): Promise<Course> {
    const existingCode = await this.courseRepo.findByCode(input.code);
    if (existingCode) throw createHttpError(409, 'COURSE_CODE_EXISTS', 'A course with this code already exists.');

    const existingTitle = await this.courseRepo.findByTitle(input.title);
    if (existingTitle) throw createHttpError(409, 'COURSE_TITLE_EXISTS', 'A course with this title already exists.');

    const now    = new Date().toISOString();
    const course = new Course({
      id:            uuidv4(),
      code:          input.code,
      title:         input.title,
      description:   input.description,
      coverImageUrl: input.coverImageUrl,
      state:         'draft',
      createdBy:     input.createdBy,
      semesterCount: 0,
      publishedAt:   null,
      deletedAt:     null,
      createdAt:     now,
      updatedAt:     now,
    });
    await this.courseRepo.create(course);
    return course;
  }
}
