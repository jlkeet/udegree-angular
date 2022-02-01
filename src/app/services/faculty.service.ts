export class FacultyService {
  private faculties;

  constructor() {
    this.faculties = require('../../assets/data/facultiesNew.json');
  }

  public getFaculties() {
    return this.faculties;
  }

  public isPrescribed(faculty): boolean {
    return this.checkFlag(faculty, 'prescribed');
  }

  public allowsMinor(faculty): boolean {
    return this.checkFlag(faculty, 'mnr');
  }

  public allowsDoubleMajor(faculty): boolean {
    return this.checkFlag(faculty, 'dbl mjr');
  }

  private checkFlag(faculty, flag: string): boolean {
    return faculty.flags.map((str: string) => str.toLowerCase()).includes(flag);
  }

}
