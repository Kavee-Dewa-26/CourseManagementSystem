import multer                              from 'multer';
import { Request, Response, NextFunction } from 'express';
import { createHttpError }                 from '@shared/errors';

const ALLOWED_MIME = ['image/jpeg', 'image/png'];
const MAX_BYTES    = 5 * 1024 * 1024; // 5 MB per photo
const MAX_COUNT    = 10;

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_BYTES },
});

export function handleReportPhotos(req: Request, res: Response, next: NextFunction): void {
  upload.array('photos', MAX_COUNT)(req, res, err => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE')
        return next(createHttpError(413, 'FILE_TOO_LARGE', 'Each photo must be under 5 MB.'));
      if (err.code === 'LIMIT_UNEXPECTED_FILE')
        return next(createHttpError(400, 'VALIDATION_ERROR', `Maximum ${MAX_COUNT} photos allowed.`));
    }
    if (err) return next(err);

    const files = (req.files ?? []) as Express.Multer.File[];
    if (files.length === 0)
      return next(createHttpError(400, 'VALIDATION_ERROR', 'At least one photo is required.'));

    for (const f of files) {
      if (!ALLOWED_MIME.includes(f.mimetype))
        return next(createHttpError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Only JPEG and PNG photos are allowed.'));
    }
    next();
  });
}
