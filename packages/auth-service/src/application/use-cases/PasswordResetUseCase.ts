import { config } from '../../config';

export class PasswordResetUseCase {
  async execute(email: string): Promise<void> {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${config.firebaseWebApiKey}`;

    await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ requestType: 'PASSWORD_RESET', email }),
    });
    // Always succeed — never reveal whether email exists (spec §4)
  }
}
