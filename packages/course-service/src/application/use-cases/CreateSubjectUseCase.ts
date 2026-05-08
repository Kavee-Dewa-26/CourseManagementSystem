import { v4 as uuidv4 }         from 'uuid';
import { createHttpError }       from '@shared/errors';
import { ISemesterRepository }   from '../../domain/repositories/ISemesterRepository';
import { ISubjectRepository }    from '../../domain/repositories/ISubjectRepository';
import { Subject }               from '../../domain/entities/Subject';
import { YouTubeVideoId }        from '../../domain/value-objects/YouTubeVideoId';

export interface CreateSubjectInput {
  semesterId:     string;
  title:          string;
  description:    string;
  youtubeVideoId: string | null;
  attachmentIds:  string[];
}

export class CreateSubjectUseCase {
  constructor(
    private readonly semesterRepo: ISemesterRepository,
    private readonly subjectRepo:  ISubjectRepository,
  ) {}

  async execute(input: CreateSubjectInput): Promise<Subject> {
    const semester = await this.semesterRepo.findById(input.semesterId);
    if (!semester) throw createHttpError(404, 'SEMESTER_NOT_FOUND', 'Semester not found.');

    const videoId  = YouTubeVideoId.from(input.youtubeVideoId); // throws 400 if invalid
    const existing = await this.subjectRepo.findBySemesterId(input.semesterId);
    const now      = new Date().toISOString();

    const subject = new Subject({
      id:             uuidv4(),
      semesterId:     input.semesterId,
      courseId:       semester.courseId,
      title:          input.title,
      description:    input.description,
      youtubeVideoId: videoId?.value ?? null,
      attachmentIds:  input.attachmentIds,
      order:          existing.length + 1,
      deletedAt:      null,
      createdAt:      now,
      updatedAt:      now,
    });

    await this.subjectRepo.create(subject);

    semester.subjectCount += 1;
    semester.updatedAt = now;
    await this.semesterRepo.update(semester);

    return subject;
  }
}
