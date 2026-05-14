export interface SemesterProps {
  id:           string;
  courseId:     string;
  title:        string;
  subjectCount: number;
  order:        number;
  deletedAt:    string | null;
  createdAt:    string;
  updatedAt:    string;
}

export class Semester {
  id:           string;
  courseId:     string;
  title:        string;
  subjectCount: number;
  order:        number;
  deletedAt:    string | null;
  readonly createdAt: string;
  updatedAt:    string;

  constructor(props: SemesterProps) {
    this.id           = props.id;
    this.courseId     = props.courseId;
    this.title        = props.title;
    this.subjectCount = props.subjectCount;
    this.order        = props.order;
    this.deletedAt    = props.deletedAt;
    this.createdAt    = props.createdAt;
    this.updatedAt    = props.updatedAt;
  }

  update(fields: { title?: string }): void {
    if (fields.title !== undefined) this.title = fields.title;
    this.updatedAt = new Date().toISOString();
  }

  softDelete(): void {
    this.deletedAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}
