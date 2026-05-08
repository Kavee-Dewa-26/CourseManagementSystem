import { YouTubeVideoId } from '../../../src/domain/value-objects/YouTubeVideoId';

describe('YouTubeVideoId', () => {
  it('accepts a valid 11-character ID', () => {
    const id = YouTubeVideoId.from('dQw4w9WgXcQ');
    expect(id?.value).toBe('dQw4w9WgXcQ');
  });

  it('accepts IDs with underscores and hyphens', () => {
    expect(YouTubeVideoId.from('abc_DEF-123')?.value).toBe('abc_DEF-123');
  });

  it('returns null for null input', () => {
    expect(YouTubeVideoId.from(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(YouTubeVideoId.from(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(YouTubeVideoId.from('')).toBeNull();
  });

  it('throws 400 INVALID_YOUTUBE_ID for 10-character ID', () => {
    expect(() => YouTubeVideoId.from('dQw4w9WgXc')).toThrow(expect.objectContaining({ status: 400, errorCode: 'INVALID_YOUTUBE_ID' }));
  });

  it('throws 400 INVALID_YOUTUBE_ID for 12-character ID', () => {
    expect(() => YouTubeVideoId.from('dQw4w9WgXcQQ')).toThrow(expect.objectContaining({ status: 400 }));
  });

  it('throws 400 INVALID_YOUTUBE_ID for ID with invalid characters', () => {
    expect(() => YouTubeVideoId.from('dQw4w9WgX!!')).toThrow(expect.objectContaining({ status: 400 }));
  });
});
