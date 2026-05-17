import { getStorage }      from 'firebase-admin/storage';
import { createHttpError } from '@shared/errors';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User }            from '../../domain/entities/User';
import { config }          from '../../config';

export interface UploadAvatarInput {
  uid:      string;
  buffer:   Buffer;
  mimeType: string;
}

export class UploadAvatarUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: UploadAvatarInput): Promise<User> {
    const user = await this.userRepo.findById(input.uid);
    if (!user) throw createHttpError(404, 'USER_NOT_FOUND', 'User not found.');

    const ext      = input.mimeType === 'image/png' ? 'png' : 'jpg';
    const filePath = `avatars/${input.uid}.${ext}`;
    const bucket   = getStorage().bucket(config.storageBucket);
    const file     = bucket.file(filePath);

    await file.save(input.buffer, { contentType: input.mimeType });
    await file.makePublic();

    const profilePhotoUrl = `https://storage.googleapis.com/${config.storageBucket}/${filePath}`;
    user.updateProfile({ profilePhotoUrl });
    await this.userRepo.update(user);
    return user;
  }
}
