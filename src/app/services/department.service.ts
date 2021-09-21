export class DepartmentService {
  private departments;

  constructor() {
    this.departments = require('../../assets/data/departments.json');
  }

  public getDepartments() {
    return this.departments;
  }

  public departmentsInFaculty(faculty) {
    return (this.departments.filter((department) => faculty.majors.includes(department.name)));
  }

  public allowedPaper() {
    return;
  }

  private checkFlag(department, flag: string): boolean {
    return department.flags.map((str: string) => str.toLowerCase()).includes(flag);
  }

}
