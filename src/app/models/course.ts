import { ICourse } from '../interfaces';
import { CourseStatus } from './course-status.enum';
import { Period } from './period.enum';

/*
    Represents a course that the student can add to a semester.
    This is the model that backs any component where a course is displayed.
    It is also the model that is used to maintain a list of planned etc courses.
*/

export class CourseModel implements ICourse {
  public id: number;
  public period: Period;
  public year: number;
  public name: string;
  public status: CourseStatus;
  public faculties: string[];
  public department: string[];
  public desc: string;
  public moreInfo?: string;
  public isError: boolean = false;

  constructor(
    id: number,
    name: string,
    desc: string,
    faculties: string[],
    department: string[],
    status: CourseStatus = CourseStatus.None,
    period?: Period,
    year?: number,
  ) {
    this.id = id;
    this.name = name;
    this.desc = desc;
    this.faculties = faculties;
    this.department = department;
    this.period = period;
    this.year = year;
    this.status = status !== null ? status : CourseStatus.Enrolled;
  }
}
