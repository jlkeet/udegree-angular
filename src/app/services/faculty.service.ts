import { AngularFireDatabase } from '@angular/fire/database';
import { Injectable } from '@angular/core';

@Injectable()
export class FacultyService {
  public faculties;

  constructor(
    public db_facs: AngularFireDatabase,
  ) {
    // this.faculties = require('../../assets/data/facultiesNew.json');
  }

  public async getFaculties() {
    this.db_facs
    .list("/", (ref) => ref.orderByChild("name"))
    .valueChanges()
    .subscribe((result: any) => {this.faculties = result[1].faculties_admin, this.faculties.sort((a,b) => a.name.localeCompare(b.name)), this.faculties.map((facs) => facs.canDelete = true)})

    return new Promise((resolve) => { setTimeout(() => {resolve(this.faculties)}, 100)})
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

  public checkFlag(faculty, flag: string): boolean {
    return faculty.flags.map((str: string) => str.toLowerCase()).includes(flag);
  }

}
