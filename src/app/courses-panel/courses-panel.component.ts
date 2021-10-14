import { ValueTransformer } from '@angular/compiler/src/util';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChange
} from '@angular/core';
import { query } from '@angular/core/src/render3';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { auth } from 'firebase';
import { subscribeToPromise } from 'rxjs/internal-compatibility';
import 'rxjs/Rx';
import { isUndefined } from 'util';
import { Store } from '../app.store';
import { AuthService } from '../core/auth.service';
import { ICourse } from '../interfaces';
import {
  CourseModel,
  CourseStatus,
  Message,
  MessageStatus,
  Period,
  SemesterModel
} from '../models';
import {
  ClickedEvent,
  CourseEventService,
  CourseService,
  MovedEvent,
  RemovedEvent,
  StoreHelper,
} from '../services';

/*
  Component for displaying a list of courses organised by year and semester
*/
@Component({
  host: {
    style: 'flex: 3 0 auto;'
  },
  selector: 'courses-panel',
  styles: [require('./courses-panel.component.scss')],
  templateUrl: './courses-panel.template.html'
})
export class CoursesPanel {
  @Output() public courseMoved: EventEmitter<MovedEvent>;
  @Output() public courseRemoved: EventEmitter<RemovedEvent>;
  @Output() public courseClicked: EventEmitter<ClickedEvent>;
  @Input() public courses: ICourse[] = [];

  private messages: Message[];
  private semesters = [];
  private filteredCourses;
  private newOpen;
  private courseCounter: number;

  private selectedYear;
  private selectedPeriod;
  private addingSemester = false;
  private semDbCount: number;
  private email: string;

  constructor(
    private coursesService: CourseService,
    private courseEventService: CourseEventService,
    private store: Store,
    private storeHelper: StoreHelper,
    private db_courses: AngularFireDatabase,
    private db: AngularFirestore,
    public authService: AuthService,
  ) {

    this.courseMoved = new EventEmitter<MovedEvent>();
    this.courseRemoved = new EventEmitter<RemovedEvent>();
    this.courseClicked = new EventEmitter<ClickedEvent>();

    // when the user moves a course, this will fire
    courseEventService.courseMoved.subscribe((event: MovedEvent) => {
      this.courseMoved.emit(event);
    });

    // when the user removes a course, this will fire
    courseEventService.courseRemoved.subscribe((event: RemovedEvent) => {
      this.courseRemoved.emit(event);
    });

    // when the user clicks a course, this will fire
    courseEventService.courseClicked.subscribe((event: ClickedEvent) => {
      this.courseClicked.emit(event);
    });

    // this.semesters = this.storeHelper.current('semesters');
    this.store.changes.pluck('semesters').
      subscribe((semesters: any[]) => this.semesters = semesters);

    this.courseCounter = this.coursesService.courseCounter;

    this.authService.afAuth.authState.subscribe(
      async (auth) => {
        if (auth == null) {
          this.email = '';
          console.log("Not logged in")
        } else {
          console.log("Logged in")
          this.email = auth.email;
          this.loadPlanFromDb()
          }
    
        }
      )

  }

  public ngOnInit() {
    
  }

  public ngOnChanges(): void {

    this.newOpen = false;
    this.selectedYear = 2021;
    this.selectedPeriod = Period.One;

    this.filteredCourses =
    this.semesters.map((semester) => this.filterCourses(semester.year, semester.period));  
  }

  private filterCourses(year: number, period: Period) {
    return this.courses.filter((course: ICourse) =>
      course.year === year && course.period === period);
  }

  private canAddSemester(semester): boolean {
    return this.semesters.filter((s) => s.year === semester.year && s.period === semester.period).length === 0;
  }

  private newSemester(): void {
    const newSemester = { year: Number(this.selectedYear), period: Number(this.selectedPeriod)};
    if (this.canAddSemester(newSemester)) {
      this.semesters.push(newSemester);
      this.semesters.sort((s1, s2) =>
        (s1.year === s2.year) ? s1.period - s2.period : s1.year - s2.year);
      this.storeHelper.update('semesters', this.semesters);
      this.addingSemester = false;
    }
  }

  private getSemesterFromDb() {
    return new Promise<any>((resolve) => {
    const semesterFromDb = {year: (this.db.collection("users").doc(this.email).collection("courses").doc("1pCXWbkcg5EUDdgZK4o1").get().toPromise().then(
      resultYear => { resolve(resultYear.data().year )}))
      }
    }
    )
  }

  private getPeriodFromDb() {
    return new Promise<any>((resolve) => {
      const periodFromDb = { period: Number(this.db.collection("users").doc(this.email).collection("courses").doc("1pCXWbkcg5EUDdgZK4o1").get().toPromise().then(
        resultPeriod => { resolve(resultPeriod.data().period)}))}
        })
  }

  private addSemesterFromDb() {
   const sem = this.getSemesterFromDb().then(
      (theYear) => this.selectedYear = theYear)
   const per = this.getPeriodFromDb().then(
      (thePeriod) => this.selectedPeriod = thePeriod)
   const newSemesterFromDb = {year: Number(this.selectedYear), period: Number(this.selectedPeriod) }   
   if (this.canAddSemester(newSemesterFromDb)) {
    this.semesters.push(newSemesterFromDb);
    this.semesters.sort((s1, s2) =>
    (s1.year === s2.year) ? s1.period - s2.period : s1.year - s2.year);
    this.storeHelper.update('semesters', this.semesters);
    this.addingSemester = false;
   }
  }

  private loadPlanFromDb() {
      if(this.email !== undefined) {
        this.db.collection('users').doc(this.email)
        .get().toPromise().then(
           doc => {
              if (doc.exists) {
                 this.db.collection('users').doc(this.email).collection('courses').get().toPromise().
                 then(sub => {
                    if (sub.docs.length > 0) {
                       console.log('subcollection exists');
                       this.addSemesterFromDb();
                    }
                 });
              } else {
                console.log("No sems exist in db, free to add in now")
              }
           })
          } else {
            console.log("Still undefined " + this.email)
          }

    }

  }


