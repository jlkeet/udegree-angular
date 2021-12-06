import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Store } from '../app.store';
import { ICourse } from '../interfaces';
import {
  CourseModel,
  CourseStatus,
  Message,
  MessageStatus,
  Period,
} from '../models';
import { IRequirement, RequirementService } from './requirement.service';
import { StoreHelper } from './store-helper';
import { ErrorsChangedEvent } from './course.event';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import { OrderList } from 'primeng/primeng';
import { yearsPerPage } from '@angular/material/datepicker/typings/multi-year-view';
import { copyAnimationEvent } from '@angular/animations/browser/src/render/shared';
import { AuthService } from '../core/auth.service';

/*
    Helper service for courses
    Needs to be fixed for new course model
*/
@Injectable()
export class CourseService {

  private allCourses: ICourse[];
  private planned: ICourse[];
  public courseCounter = 0; // need to store this
  private errors: Message[];
  public email: string = "";

  constructor(
    private errorsChanged: ErrorsChangedEvent,
    private requirementService: RequirementService,
    private store: Store,
    private storeHelper: StoreHelper,
    private db_courses: AngularFireDatabase,
    private db: AngularFirestore,
    public authService: AuthService,
    ) {

    this.authService.afAuth.authState.subscribe( async (auth) => { this.email = auth.email })

    this.allCourses = require('../../assets/data/courses.json');

    // By default, all courses are deletable
    this.allCourses.map((course: ICourse) => course.canDelete = true);
    this.store.changes.pluck('courses').subscribe((courses: ICourse[]) => this.planned = courses);

  }

  public addCustom(
    year: number, period: Period, code: string, title: string, points: number, stage: number,
    department: string, faculty: string, status: CourseStatus) {

    const customCourse: ICourse = {
      canDelete: true,
      department,
      desc: '',
      faculties: [faculty],
      id: -this.courseCounter,
      name: code,
      period,
      points,
      stage,
      status,
      title,
      year,
    };
    this.courseCounter++;
    this.storeHelper.add('courses', customCourse);
    this.updateErrors();
  }

  public getAllCourses() {
    return this.allCourses;
  }

  // rename this to coursesbyyear
  public getCourses(year: number, period: Period): ICourse[] {
    return this.planned.filter(
      (course: ICourse) => course.year === year && (period === null || period === course.period));
  }

  public moveCourse(courseId: number, period: Period, year: number) {
    const index = this.planned.findIndex((course: ICourse) => course.id === courseId);
    const copy = Object.assign({}, this.planned[index]);
    copy.period = period;
    copy.year = year;
    this.storeHelper.findAndUpdate('courses', copy);
    this.updateErrors();
  }

  public selectCourse(courseId: number, period: Period, year: number, status?: CourseStatus) {
    const index = this.allCourses.findIndex((course: ICourse) => course.id === courseId);
    const copy = Object.assign({}, this.allCourses[index]);
    copy.status = status ? status : CourseStatus.Planned;
    copy.period = period;
    copy.year = year;
    copy.id = courseId;  //this.courseCounter++;     I'm not exactly sure why we were making the course id linked to the course counter but have commented this out for now so we can match the index to the db.
    this.storeHelper.add('courses', copy);
    this.updateErrors();
    this.courseCounter++;
    this.setCourseDb(courseId, period, year, status)
  }

  private setCourseDb(courseId, coursePeriod, courseYear, status?: CourseStatus, grade?: null){
    this.db_courses.list("0/" + (courseId - 1)).valueChanges().subscribe(result => { 
    this.db
    .collection("users") 
    .doc(this.email) // Here is where we set the docID to the email so its accessible in the database.
    .collection("courses")
    .add(Object.assign({
      department:result[0],
      desc: result[1],
      faculties: result[2],
      id: result[3],
      name: result[4],
      period: coursePeriod,
      points: result[6],
      requirements: result[7] || null,
      stage: result[8],
      title: result[9],
      year: courseYear,
      status: status ? status : CourseStatus.Planned,
      grade: grade ? grade : null,
      canDelete: true,
      }))
      .then((docRef) => {console.log("Here's the docId " + docRef.id)} )
    }
  )    
 }

  public deselectCourse(courseId: number) { // Is this redundant now?
    this.storeHelper.findAndDelete('courses', courseId);
    this.updateErrors();
  }

  // Note that this is also linked to semester-panel.component, called there to remove all courses when exiting semester.

  public deselectCourseByName(courseName: string) {
    let course = this.findPlanned(courseName);
    this.storeHelper.findAndDelete('courses', course.id);
    this.updateErrors();
    this.courseCounter--;
    this.db.collection("users").doc(this.email).collection("courses", ref => {
      const query = ref.where('id', '==', course.id);
      query.get().then( snapshot => {
        snapshot.forEach(doc => {
          this.db
          .collection("users")
          .doc(this.email)
          .collection("courses")
          .doc(doc.id)
          .delete()
         })
        }
      )
      return query
      })
  }

  public changeStatus(courseToChange: ICourse, status: CourseStatus) {
    const lookupCourse = this.planned.find((course: ICourse) => course.id === courseToChange.id);
    const copy = Object.assign({}, lookupCourse);
    copy.status = status;
    this.storeHelper.findAndUpdate('courses', copy);
    let course = courseToChange;
    this.db.collection("users").doc(this.email).collection("courses", ref => {
      const query = ref.where('id', '==', course.id);
      query.get().then( snapshot => {
        snapshot.forEach(doc => {
          this.db
          .collection("users")
          .doc(this.email)
          .collection("courses")
          .doc(doc.id)
          .update({status: copy.status})
         })
        }
      )
      return query
      })

    
    this.updateErrors();
  }

  public changeGrade(courseToChange: ICourse, grade: number) {
    const lookupCourse = this.planned.find((course: ICourse) => course.id === courseToChange.id);
    const copy = Object.assign({}, lookupCourse);
    copy.grade = grade;
    this.storeHelper.findAndUpdate('courses', copy);
    let course = courseToChange;
    this.db.collection("users").doc(this.email).collection("courses", ref => {
      const query = ref.where('id', '==', course.id);
      query.get().then( snapshot => {
        snapshot.forEach(doc => {
          this.db
          .collection("users")
          .doc(this.email)
          .collection("courses")
          .doc(doc.id)
          .update({grade: copy.grade})
         })
        }
      )
      return query
      })
    this.updateErrors();
  }

  private updateErrors() {
    this.errors = [];
    this.planned.forEach((course: ICourse) => {
      if (course.requirements !== undefined && course.requirements !== null) {
        // To find which courses are ineligible, flag all courses that have at least one unfilled requirement
        let courseErrors = course.requirements.filter((requirement: IRequirement) =>
            !this.requirementService.requirementFilled(requirement,
              this.beforeSemester(course)));
        //this.errors.push({'course': course.title, 'errors': courseErrors});
        this.errors = this.errors.concat(courseErrors
          .map((unfilled: IRequirement) => this.requirementService.toString(unfilled, false))
          .map((unfilled: string) => new Message(course.name, course.name + ": " + unfilled, MessageStatus.Error)));
        course.isError = courseErrors.length > 0;
      } else {
        course.isError = false;
      }
    });
    this.storeHelper.update('messages', this.errors); // needs to be changed if different sources for messages
    //this.errorsChanged.raiseErrorsChanged(this.errors);
  }

  private beforeSemester(beforeCourse) {
    return this.planned.filter((course: ICourse) =>
      course.period < beforeCourse.period &&
      course.year === beforeCourse.year ||
      course.year < beforeCourse.year
    );
  }
  

  public findPlanned(courseName: string): ICourse {
    let generalToggle = this.generalToggle(courseName);
    let completed = this.completed(courseName);
    return completed ? completed : this.completed(generalToggle); //check general version as well
  }

  private completed(courseName: string): ICourse {
    const courses = this.storeHelper.current('courses');
    return courses.filter((course: ICourse) => course.status !== CourseStatus.Failed)
      .find((course: ICourse) => course.name === courseName);
  }

  private generalToggle(courseName: string): string {
    if (this.isGeneral(courseName)) {
      return courseName.substring(0, courseName.length - 1);
    } else {
      return courseName + 'G';
    }
  }

  public isGeneral(courseName: string): boolean {
    return courseName.substr(-1) === 'G';
  }

  public stringToCourse(courseName: string) {
    return this.allCourses.find((course: ICourse) => course.name === courseName);
  }

  public courseCounterOnDelete() {
    this.courseCounter--;
  }

}
