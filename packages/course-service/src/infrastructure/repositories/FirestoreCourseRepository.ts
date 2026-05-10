import { getFirestore }                                                          from 'firebase-admin/firestore';
import { Course, CourseProps }                                                    from '../../domain/entities/Course';
import { ICourseRepository, CourseFindAllOptions, CourseFindPublishedOptions, CourseListResult } from '../../domain/repositories/ICourseRepository';

type CourseDoc = Omit<CourseProps, 'id'>;

function toEntity(id: string, data: CourseDoc): Course {
  return new Course({ ...data, id });
}

export class FirestoreCourseRepository implements ICourseRepository {
  private readonly col = getFirestore().collection('courses');

  async findById(id: string): Promise<Course | null> {
    const snap = await this.col.doc(id).get();
    if (!snap.exists) return null;
    return toEntity(snap.id, snap.data() as CourseDoc);
  }

  async findPublished(opts: CourseFindPublishedOptions): Promise<CourseListResult> {
    let q: FirebaseFirestore.Query = this.col
      .where('state',     '==', 'published')
      .where('deletedAt', '==', null);

    const total = (await q.count().get()).data().count;

    q = q.orderBy('publishedAt', 'desc').limit(opts.limit);
    if (opts.cursor) {
      const cursorSnap = await this.col.doc(opts.cursor).get();
      if (cursorSnap.exists) q = q.startAfter(cursorSnap);
    }

    const snap  = await q.get();
    const items = snap.docs.map(d => toEntity(d.id, d.data() as CourseDoc));
    const last  = snap.docs[snap.docs.length - 1];
    return { items, nextCursor: snap.docs.length === opts.limit && last ? last.id : null, total };
  }

  async findAll(opts: CourseFindAllOptions): Promise<CourseListResult> {
    let q: FirebaseFirestore.Query = this.col.where('deletedAt', '==', null);
    if (opts.state) q = q.where('state', '==', opts.state);

    const total = (await q.count().get()).data().count;

    q = q.orderBy('createdAt', 'desc').limit(opts.limit);
    if (opts.cursor) {
      const cursorSnap = await this.col.doc(opts.cursor).get();
      if (cursorSnap.exists) q = q.startAfter(cursorSnap);
    }

    const snap  = await q.get();
    const items = snap.docs.map(d => toEntity(d.id, d.data() as CourseDoc));
    const last  = snap.docs[snap.docs.length - 1];
    return { items, nextCursor: snap.docs.length === opts.limit && last ? last.id : null, total };
  }

  async create(course: Course): Promise<void> {
    const { id, ...doc } = { ...course } as CourseProps;
    await this.col.doc(id).set(doc);
  }

  async update(course: Course): Promise<void> {
    const { id, ...doc } = { ...course } as CourseProps;
    await this.col.doc(id).update(doc as Record<string, unknown>);
  }

  async softDelete(id: string): Promise<void> {
    await this.col.doc(id).update({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
}
