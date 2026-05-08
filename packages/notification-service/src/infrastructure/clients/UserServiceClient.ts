import { createInternalClient } from '@shared/internal-http-client';
import { config }               from '../../config';

export class UserServiceClient {
  private readonly http = createInternalClient(config.serviceUserUrl, config.internalServiceKey);

  async getAdminUids(): Promise<string[]> {
    try {
      const res = await this.http.get<{ uids: string[] }>('/internal/users/admins');
      return res.data.uids;
    } catch {
      return [];
    }
  }
}
