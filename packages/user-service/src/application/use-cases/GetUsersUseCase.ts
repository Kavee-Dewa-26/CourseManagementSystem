import { IUserRepository, FindAllOptions, FindAllResult } from '../../domain/repositories/IUserRepository';

export class GetUsersUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(opts: FindAllOptions): Promise<FindAllResult> {
    return this.userRepo.findAll(opts);
  }
}
