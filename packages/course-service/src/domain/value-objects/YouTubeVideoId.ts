import { createHttpError } from '@shared/errors';

const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

export class YouTubeVideoId {
  private constructor(readonly value: string) {}

  static from(input: string | null | undefined): YouTubeVideoId | null {
    if (input === null || input === undefined || input === '') return null;
    if (!YOUTUBE_ID_REGEX.test(input)) {
      throw createHttpError(400, 'INVALID_YOUTUBE_ID', 'YouTube video ID must be exactly 11 characters [A-Za-z0-9_-].');
    }
    return new YouTubeVideoId(input);
  }
}
