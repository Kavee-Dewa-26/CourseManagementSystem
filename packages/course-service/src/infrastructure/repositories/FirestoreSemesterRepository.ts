import { getFirestore }        from 'firebase-admin/firestore';
import { Semester, SemesterProps } from '../../domain/entities/Semester';
import { ISemesterRepository } from '../../domain/repositories/ISemesterRepository';

type SemesterDoc = Omit<SemesterProps, 'id'>;

function toEntity(id: string, data: SemesterDoc): Semester {
  return new Semester({ ...data, id });
}

export class FirestoreSemesterRepository implements ISemesterRepository {
  private readonly col = getFirestore().collection('semesters');

  async findById(id: string): Promise<Semester | null> {
    const snap = await this.col.doc(id).get();
    if (!snap.exists) return null;
    const data = snap.data() as SemesterDoc;
    if (data.deletedAt !== null) return null;
    return toEntity(snap.id, data);
  }

  async findByCourseId(courseId: string): Promise<Semester[]> {
    const snap = await this.col
      .where('courseId',  '==', courseId)
      .where('deletedAt', '==', null)
      .orderBy('order', 'asc')
      .get();
    return snap.docs.map(d => toEntity(d.id, d.data() as SemesterDoc));
  }

  async create(semester: Semester): Promise<void> {
    const { id, ...doc } = { ...semester } as SemesterProps;
    await this.col.doc(id).set(doc);
  }

  async update(semester: Semester): Promise<void> {
    const { id, ...doc } = { ...semester } as SemesterProps;
    await this.col.doc(id).update(doc as Record<string, unknown>);
  }

  async softDelete(id: string): Promise<void> {
    await this.col.doc(id).update({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
}
