import { getFirestore }                                   from 'firebase-admin/firestore';
import { User, UserProps }                                from '../../domain/entities/User';
import { IUserRepository, FindAllOptions, FindAllResult } from '../../domain/repositories/IUserRepository';

type UserDoc = Omit<UserProps, 'uid'>;

function toUser(id: string, data: UserDoc): User {
  return new User({ ...data, uid: id });
}

export class FirestoreUserRepository implements IUserRepository {
  private readonly col = getFirestore().collection('users');

  async findById(uid: string): Promise<User | null> {
    const snap = await this.col.doc(uid).get();
    if (!snap.exists) return null;
    const data = snap.data() as UserDoc;
    if (data.deletedAt !== null) return null;
    return toUser(snap.id, data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const snap = await this.col
      .where('email',     '==', email)
      .where('deletedAt', '==', null)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return toUser(doc.id, doc.data() as UserDoc);
  }

  async findAll(opts: FindAllOptions): Promise<FindAllResult> {
    let base: FirebaseFirestore.Query = this.col.where('deletedAt', '==', null);
    if (opts.role)   base = base.where('role',   '==', opts.role);
    if (opts.status) base = base.where('status', '==', opts.status);

    const countSnap = await base.count().get();
    const total     = countSnap.data().count;

    let query = base.orderBy('createdAt', 'desc').limit(opts.limit);
    if (opts.cursor) {
      const cursorSnap = await this.col.doc(opts.cursor).get();
      if (cursorSnap.exists) query = query.startAfter(cursorSnap);
    }

    const snap  = await query.get();
    const items = snap.docs.map(d => toUser(d.id, d.data() as UserDoc));
    const last  = snap.docs[snap.docs.length - 1];
    const nextCursor = snap.docs.length === opts.limit && last ? last.id : null;

    return { items, nextCursor, total };
  }

  async create(user: User): Promise<void> {
    const { uid, ...doc } = { ...user } as UserProps;
    await this.col.doc(uid).set(doc);
  }

  async update(user: User): Promise<void> {
    const { uid, ...doc } = { ...user } as UserProps;
    await this.col.doc(uid).update(doc as Record<string, unknown>);
  }

  async softDelete(uid: string): Promise<void> {
    await this.col.doc(uid).update({
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}
