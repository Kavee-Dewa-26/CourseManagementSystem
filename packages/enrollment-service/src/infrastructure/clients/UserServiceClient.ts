import { createInternalClient } from '@shared/internal-http-client';
import { config }               from '../../config';

export class UserServiceClient {
  private readonly http = createInternalClient(config.serviceUserUrl, config.internalServiceKey);

  async approveUser(uid: string): Promise<void> {
    await this.http.post('/internal/users/approve', { uid });
  }

  async addRole(uid: string, role: string): Promise<void> {
    await this.http.post('/internal/users/add-role', { uid, role });
  }
}