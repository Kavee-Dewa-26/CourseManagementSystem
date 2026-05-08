import { createHttpError } from '@shared/errors';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User }            from '../../domain/entities/User';

export interface UpdateProfileInput {
  uid:             string;
  firstName?:      string;
  lastName?:       string;
  profilePhotoUrl?: string | null;
}

export class UpdateProfileUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: UpdateProfileInput): Promise<User> {
    const user = await this.userRepo.findById(input.uid);
    if (!user) throw createHttpError(404, 'USER_NOT_FOUND', 'User not found.');

    user.updateProfile({
      firstName:       input.firstName,
      lastName:        input.lastName,
      profilePhotoUrl: input.profilePhotoUrl,
    });

    await this.userRepo.update(user);
    return user;
  }
}
