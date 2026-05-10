import { getStorage } from 'firebase-admin/storage';

export class CloudStorageRepository {
  private get bucket() { return getStorage().bucket(); }

  async upload(buffer: Buffer, storagePath: string, mimeType: string): Promise<void> {
    const file = this.bucket.file(storagePath);
    await file.save(buffer, { contentType: mimeType, resumable: false });
  }

  async getSignedUrl(storagePath: string, expiresInMs: number): Promise<string> {
    // The Storage emulator does not support signing URLs (no real GCP credentials).
    // Return a direct download URL instead — functionally equivalent for local dev.
    const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
    if (emulatorHost) {
      const bucket  = this.bucket.name;
      const encoded = encodeURIComponent(storagePath);
      return `http://${emulatorHost}/v0/b/${bucket}/o/${encoded}?alt=media`;
    }
    const file  = this.bucket.file(storagePath);
    const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + expiresInMs });
    return url;
  }

  async delete(storagePath: string): Promise<void> {
    await this.bucket.file(storagePath).delete({ ignoreNotFound: true });
  }
}
