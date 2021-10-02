import { ICourse } from '../interfaces';
import { Period } from '../models';

export class SemesterModel {
  public id: number;
  public title: string;
  public courses: ICourse[] = [];
  public year: number;
  public complete: boolean;
  public period: Period;

  constructor(
    id: number,
    title: string,
    courses: ICourse[],
    year: number,
    period: Period,
  ) {
    this.id = id;
    this.title = title;
    this.courses = courses;
    this.year = year;
    this.period = period;
    this.complete = false;
  }
}
