import { createHttpError }    from '@shared/errors';
import { ISubjectRepository } from '../../domain/repositories/ISubjectRepository';
import { Subject }            from '../../domain/entities/Subject';
import { YouTubeVideoId }     from '../../domain/value-objects/YouTubeVideoId';

export interface UpdateSubjectInput {
  id:              string;
  title?:          string;
  description?:    string;
  youtubeVideoId?: string | null;
  attachmentIds?:  string[];
}

export class UpdateSubjectUseCase {
  constructor(private readonly subjectRepo: ISubjectRepository) {}

  async execute(input: UpdateSubjectInput): Promise<Subject> {
    const subject = await this.subjectRepo.findById(input.id);
    if (!subject) throw createHttpError(404, 'SUBJECT_NOT_FOUND', 'Subject not found.');

    const videoId = input.youtubeVideoId !== undefined
      ? YouTubeVideoId.from(input.youtubeVideoId)
      : undefined;

    subject.update({
      title:          input.title,
      description:    input.description,
      youtubeVideoId: videoId !== undefined ? (videoId?.value ?? null) : undefined,
      attachmentIds:  input.attachmentIds,
    });

    await this.subjectRepo.update(subject);
    return subject;
  }
}
