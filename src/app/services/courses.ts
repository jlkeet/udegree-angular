import { Injectable } from '@angular/core';
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
import { AuthService } from '../core/auth.service';
//import { UserContainer } from '../user/user-status.component';

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
  private findIfCorequesite = false;

  constructor(
    private errorsChanged: ErrorsChangedEvent,
    private requirementService: RequirementService,
    private store: Store,
    private storeHelper: StoreHelper,
    private db_courses: AngularFireDatabase,
    private db: AngularFirestore,
    public authService: AuthService,
    //private userContainer: UserContainer,
    ) {

    this.authService.afAuth.authState.subscribe( async (auth) => { if (auth) this.email = auth.email })

    //this.email = userContainer.email
    this.allCourses = require('../../assets/data/newCourses.json');
    this.allCourses.sort((a,b) => a.name.localeCompare(b.name))

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
    this.setCourseDb(copy ,courseId, period, year, status)
  }

private setCourseDb(course, courseId, coursePeriod, courseYear, status?: CourseStatus, grade?: null){
  let result = course;
  this.db
  .collection("users") 
  .doc(this.email) // Here is where we set the docID to the email so its accessible in the database.
  .collection("courses")
  .add(Object.assign({
    department:result['department'] || null,
    desc: result['desc'] || null,
    faculties: result['faculties'] || null,
    id: result['id'] || null,
    name: result['name'] || null,
    period: coursePeriod,
    points: result['points'] || null,
    requirements: result['requirements'] || null,
    stage: result['stage'] || null,
    title: result['title'] || null,
    year: courseYear,
    status: status ? status : CourseStatus.Planned,
    grade: grade ? grade : null,
    canDelete: true,
    }))
    console.log("firing " , this.email)
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

  public updateErrors() {
    this.errors = [];
    let courseErrors;
    let courseErrorsCoreq;

    this.planned.forEach((course: ICourse) => {
      if (course.requirements !== undefined && course.requirements !== null) {
      courseErrors = course.requirements.filter((requirement: IRequirement) =>
      {
        if (this.requirementService.checkFlag(requirement, "isCorequesite")) {
          return !this.requirementService.requirementFilled(requirement,this.currentSemester(course))
        } else {
          return !this.requirementService.requirementFilled(requirement,this.beforeSemester(course))
        }
      });
      this.errors = this.errors.concat(courseErrors
        .map((unfilled: IRequirement) => this.requirementService.toString(unfilled, false))
        .map((unfilled: string) => new Message(course.name, course.name + ": " + unfilled, MessageStatus.Error)));
        course.isError = courseErrors.length > 0;
  

        //this.errors.push({'course': course.title, 'errors': courseErrors});
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

  private currentSemester(currentCourse) {
    return this.planned.filter((course: ICourse) =>
      course.period === currentCourse.period &&
      course.year === currentCourse.year
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
     // return courseName + 'G';
    }
  }

  public isGeneral(courseName: string): boolean {
    return courseName.lastIndexOf("G") === courseName.length - 1;
  }

  public stringToCourse(courseName: string) {
    return this.allCourses.find((course: ICourse) => course.name === courseName);
  }

  public courseCounterOnDelete() {
    this.courseCounter--;
  }

}
