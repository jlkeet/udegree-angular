import { AngularFireDatabase } from '@angular/fire/database';
import { Injectable } from '@angular/core';
import { filter } from 'rxjs-compat/operator/filter';

@Injectable()
export class DepartmentService {
  public departments;

  constructor(
    public db_depts: AngularFireDatabase,
  ) {
    // this.departments = require('../../assets/data/departments.json');
  }


  public async getDepartments(): Promise<any[]> {
    return new Promise((resolve) => {
      this.db_depts
        .list("/", (ref) => ref.orderByChild("name"))
        .valueChanges()
        .subscribe((result: any) => {
          this.departments = result[2].departments_admin;
          this.departments.sort((a, b) => a.name.localeCompare(b.name));
          this.departments.map((depts) => (depts.canDelete = true));
          resolve(this.departments);
        });
    });
  }


  // public async getDepartments() {
  //   this.db_depts
  //   .list("/", (ref) => ref.orderByChild("name"))
  //   .valueChanges()
  //   .subscribe((result: any) => {this.departments = result[2].departments_admin, this.departments.sort((a,b) => a.name.localeCompare(b.name)), this.departments.map((depts) => depts.canDelete = true)})

  //   return new Promise((resolve) => { setTimeout(() => {resolve(this.departments)}, 50)})
  // }

  public departmentsInFaculty(faculty) {
    return this.departments.filter((department) => {
      return department.faculties.includes(faculty.name);
    });
  }

  // public departmentsInFaculty(faculty) {
  //   this.departments.filter((department) => {faculty.majors.includes(department.name)})
  //   return this.departments.filter((department) => faculty.name.includes(department.faculties[0]))
  // }

  public allowedPaper() {
    return;
  }

  public checkFlag(department, flag: string): boolean {
    return department.flags.map((str: string) => str.toLowerCase()).includes(flag);
  }

}
