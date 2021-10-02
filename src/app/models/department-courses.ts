import { ICourse } from '../interfaces';

/* conveneience model for grouping courses by dept */

export class DepartmentCoursesModel {
  public faculty: string;
  public department: string;
  public title: string;
  public courses: ICourse[];

  constructor(
    faculty: string,
    department: string,
    title: string,
    courses: ICourse[]
  ) {
    this.faculty = faculty;
    this.title = title;
    this.department = department;
    this.courses = courses;
  }
}
