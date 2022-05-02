export class DepartmentService {
  public departments;

  constructor() {
    this.departments = require('../../assets/data/departments.json');
  }

  public getDepartments() {
    return this.departments;
  }

  public departmentsInFaculty(faculty) {
    this.departments.filter((department) => {faculty.majors.includes(department.name)})
    return (this.departments.filter((department) => faculty.name.includes(department.faculties[0])));
  }

  public allowedPaper() {
    return;
  }

  public checkFlag(department, flag: string): boolean {
    return department.flags.map((str: string) => str.toLowerCase()).includes(flag);
  }

}
