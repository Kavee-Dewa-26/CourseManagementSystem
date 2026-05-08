import { OutboxEventPublisher }    from '@shared/events';
import { FirestoreUserRepository } from './infrastructure/repositories/FirestoreUserRepository';
import { FirebaseAuthClient }      from './infrastructure/clients/FirebaseAuthClient';
import { GetMeUseCase }            from './application/use-cases/GetMeUseCase';
import { UpdateProfileUseCase }    from './application/use-cases/UpdateProfileUseCase';
import { ChangePasswordUseCase }   from './application/use-cases/ChangePasswordUseCase';
import { GetUsersUseCase }         from './application/use-cases/GetUsersUseCase';
import { GetUserByIdUseCase }      from './application/use-cases/GetUserByIdUseCase';
import { SuspendUserUseCase }      from './application/use-cases/SuspendUserUseCase';
import { ReactivateUserUseCase }   from './application/use-cases/ReactivateUserUseCase';
import { CreateAdminUseCase }      from './application/use-cases/CreateAdminUseCase';
import { DeleteAdminUseCase }      from './application/use-cases/DeleteAdminUseCase';
import { CheckEmailExistsUseCase } from './application/use-cases/CheckEmailExistsUseCase';
import { ApproveUserUseCase }      from './application/use-cases/ApproveUserUseCase';
import { MeController }            from './http/controllers/MeController';
import { UsersController }         from './http/controllers/UsersController';
import { SuperAdminController }    from './http/controllers/SuperAdminController';
import { InternalController }      from './http/controllers/InternalController';

// Infrastructure
const userRepo   = new FirestoreUserRepository();
const authClient = new FirebaseAuthClient();
const outbox     = new OutboxEventPublisher();

// Use cases
const getMe          = new GetMeUseCase(userRepo);
const updateProfile  = new UpdateProfileUseCase(userRepo);
const changePassword = new ChangePasswordUseCase(userRepo, authClient);
const getUsers       = new GetUsersUseCase(userRepo);
const getUserById    = new GetUserByIdUseCase(userRepo);
const suspendUser    = new SuspendUserUseCase(userRepo, authClient, outbox);
const reactivate     = new ReactivateUserUseCase(userRepo, authClient);
const createAdmin    = new CreateAdminUseCase(userRepo, authClient, outbox);
const deleteAdmin    = new DeleteAdminUseCase(userRepo, authClient);
const checkEmail     = new CheckEmailExistsUseCase(userRepo);
const approveUser    = new ApproveUserUseCase(userRepo, authClient);

// Controllers
export const container = {
  meController:         new MeController(getMe, updateProfile, changePassword),
  usersController:      new UsersController(getUsers, getUserById, suspendUser, reactivate),
  superAdminController: new SuperAdminController(createAdmin, deleteAdmin, getUsers, getUserById, suspendUser, reactivate),
  internalController:   new InternalController(checkEmail, approveUser, getUsers),
};
