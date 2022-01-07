import { ValueTransformer } from "@angular/compiler/src/util";
import { UserContainer } from "../user/user-status.component";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChange,
} from "@angular/core";
import { query } from "@angular/core/src/render3";
import { AngularFireDatabase } from "@angular/fire/database";
import { AngularFirestore } from "@angular/fire/firestore";
import * as firebase from "firebase";
import { auth } from "firebase";
import { subscribeToPromise } from "rxjs/internal-compatibility";
import "rxjs/Rx";
import { isUndefined } from "util";
import { Store } from "../app.store";
import { AuthService } from "../core/auth.service";
import { ICourse } from "../interfaces";
import {
  CourseModel,
  CourseStatus,
  Message,
  MessageStatus,
  Period,
  SemesterModel,
} from "../models";
import {
  ClickedEvent,
  CourseEventService,
  CourseService,
  MovedEvent,
  RemovedEvent,
  StoreHelper,
} from "../services";
import { UserComponent } from "../user/user.component";
import { MatFormFieldControl, MatListOption } from "@angular/material";
import { DegreeSelection } from "../select-major";
import request from 'request';
import { FirebaseDbService } from "../core/firebase.db.service";

/*
  Component for displaying a list of courses organised by year and semester
*/
@Component({
  host: {
    style: "flex: 3 0 auto;",
  },
  selector: "courses-panel",
  styles: [require("./courses-panel.component.scss")],
  templateUrl: "./courses-panel.template.html",
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
  public newCourses: ICourse[] = [];

  public selectedYear;
  public selectedPeriod;
  public addingSemester = false;
  private semDbCount: number;
  private logInCounter;
  private courseDbCounter: number = 0;
  public email: string;
  private delCount = 0;

  private dbCoursesSavedArrayById = [];
  private onPageChange = new EventEmitter<null>();

  constructor(
    private coursesService: CourseService,
    private courseEventService: CourseEventService,
    private store: Store,
    private storeHelper: StoreHelper,
    private db_courses: AngularFireDatabase,
    private db: AngularFirestore,
    public authService: AuthService,
    private userContainer: UserContainer,
    private degreeSelection: DegreeSelection,
    private dbCourses: FirebaseDbService,
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

    this.store.changes
      .pluck("semesters")
      .subscribe((semesters: any[]) => (this.semesters = semesters));

    // Course checker to mimic the semester one
    this.store.changes
      .pluck("courses")
      .subscribe(
        (dbCoursesSavedArrayById: any[]) =>
          (this.dbCoursesSavedArrayById = dbCoursesSavedArrayById)
      );

    this.courseCounter = this.coursesService.courseCounter;
    this.selectedYear = 2021;
    this.selectedPeriod = Period.One;

    this.authService.afAuth.authState.subscribe(async (auth) => {
      if (auth == null) {
        this.email = "";
      } else {
        //this.email = auth.email;
        this.email = userContainer.email
        if (this.userContainer.logInCounter > 1) {
          // This is necessary to stop the duplicate course loading
        } else {
          this.loadPlanFromDb();
          this.userContainer.logInCounter++; // This is necessary to stop the duplicate course loading
        }
      }
    });
  }

  public ngOnInit() {

  }

  public ngOnChanges(): void {

    this.nextSemesterCheck();

    this.newOpen = false;
    this.filteredCourses = this.semesters.map((semester) =>
      this.filterCourses(semester.year, semester.period)
    );
  }

  private filterCourses(year: number, period: Period) {
    return this.courses.filter(
      (course: ICourse) => course.year === year && course.period === period
    );
  }

  private canAddSemester(semester): boolean {
    return (
      this.semesters.filter(
        (s) => s.year === semester.year && s.period === semester.period
      ).length === 0
    );
  }

  public newSemester(): void {
    const newSemester = {
      year: Number(this.selectedYear),
      period: Number(this.selectedPeriod),
      both: this.selectedYear + " " + this.selectedPeriod
    };
    if (this.canAddSemester(newSemester)) {
      this.semesters.push(newSemester);
      this.semesters.sort((s1, s2) =>
        s1.year === s2.year ? s1.period - s2.period : s1.year - s2.year
      );
      this.storeHelper.update("semesters", this.semesters);
      this.dbCourses.addSelection(this.email, "semester", newSemester, "semesters")
      this.addingSemester = false;
      this.nextSemesterCheck();
    }
  }

  // This function gets the year from the course

  private getSemesterFromDb(courseDbId) {
    return new Promise<any>((resolve) => {
      const semesterFromDb = {
        year:
          this.dbCourses.getCollection("users", "courses", courseDbId).then( (res) => {resolve((res.year))} )
      };
    });
  }

  // This function gets the semester period from the course

  private getPeriodFromDb(courseDbId) {
    return new Promise<any>((resolve) => {
      const periodFromDb = {
        period: Number(
          this.dbCourses.getCollection("users", "courses", courseDbId).then( (res) => {resolve((res.period))} )
        ),
      };
    });
  }

  public addSemesterFromDb(courseDbId: string) {
    
    var newSemesterFromDb = { year: Number(), period: Number() };

    // The following code is super gumby, because of the promised value not being returned before executing the next lines
    // I put everything into the promise on line 194 by chaining then() functions. It works though.

    this.getSemesterFromDb(courseDbId)
      .then((theYear) => {
        this.selectedYear = theYear;
      })
      .then(
        () => (newSemesterFromDb = { year: this.selectedYear, period: null })
      ); // Updates the year value withing the newSemesterFromDb variable
    this.getPeriodFromDb(courseDbId)
      .then(
        // This call is the first chained then
        (thePeriod) => (this.selectedPeriod = thePeriod)
      )
      .then(
        () =>
          (newSemesterFromDb = {
            year: this.selectedYear,
            period: this.selectedPeriod,
          }
        )
      )
      .then(() => {
        // Updates the period value withing the newSemesterFromDb variable
        if (this.canAddSemester(newSemesterFromDb)) {
          // Here is the rest of the code to execute within the chained then statements. So that it can occur within the promise
          this.semesters.push(newSemesterFromDb);
          this.semesters.sort((s1, s2) =>
            s1.year === s2.year ? s1.period - s2.period : s1.year - s2.year
          );
          this.storeHelper.update("semesters", this.semesters);
          this.addingSemester = false; // Reverts the semster panel back to neutral
          this.selectedPeriod = Period.One; // Revert to the default value
          this.selectedYear++; // Increment the selected year so that it defaults to the next one, this avoids confusion if accidentally trying to add the same period and year, probably worth putting in a catch on the error at some point
        } else {
        }
      });
  }

  public loadPlanFromDb() {
    if (this.email !== undefined) {
      this.db
        .collection("users")
        .doc(this.email)
        .get()
        .toPromise()
        .then((doc) => {
          if (doc.exists) {
            this.db
              .collection("users")
              .doc(this.email)
              .collection("courses")
              .get()
              .toPromise()
              .then((sub) => {
                if (sub.docs.length > 0) {
                  // Check to see if documents exist in the courses collection
                  sub.forEach((element) => {
                    // Loop to get all the ids of the docs
                    this.addSemesterFromDb(element.id);
                    this.loadCourseFromDb(element.id); // Call to loading the courses on the screen, by id
                  });
                }
              });
            }
        });
    }
  }

  public loadPlanFromDbAfterDel() {
    if (this.email !== undefined) {
      this.db
        .collection("users")
        .doc(this.email)
        .get()
        .toPromise()
        .then((doc) => {
          if (doc.exists) {
            this.db
              .collection("users")
              .doc(this.email)
              .collection("courses") 
              .get()
              .toPromise()
              .then((sub) => {
                if (sub.docs.length > 0) {
                  // Check to see if documents exist in the courses collection
                  sub.forEach((element) => {
                    // Loop to get all the ids of the docs
                    //this.addSemesterFromDb(element.id);
                    this.loadCourseFromDbAfterDel(element.id); // Call to loading the courses on the screen, by id
                  });
                }
              });
            }
        });
    }
  }

  private getCourseFromDb(courseDbId: string) {
    return new Promise<any>((resolve) => {
      const semesterFromDb = {
        course: 
          this.dbCourses.getCollection("users", "courses", courseDbId).then( (res) => {resolve((res))} )
      };
    });
  }

  private loadCourseFromDb(courseDbId) {
    const courseDb = this.getCourseFromDb(courseDbId).then((copy) => {
      Object.assign({
        department: copy[0],
        desc: copy[1],
        faculties: copy[2],
        id: copy[3],
        name: copy[4],
        period: copy[5],
        points: copy[6],
        requirements: copy[7],
        stage: copy[8],
        status: copy[9],
        title: copy[10],
        year: copy[11],
        canDelete: true,
      });
      this.getCourseFromDb(courseDbId).then((res) => {
          this.storeHelper.add("courses", res);
          this.coursesService.updateErrors();
      });
    });
  }

  private loadCourseFromDbAfterDel(courseDbId) {
    const courseDb = this.getCourseFromDb(courseDbId).then((copy) => {
      Object.assign({
        department: copy[0],
        desc: copy[1],
        faculties: copy[2],
        id: copy[3],
        name: copy[4],
        period: copy[5],
        points: copy[6],
        requirements: copy[7],
        stage: copy[8],
        status: copy[9],
        title: copy[10],
        year: copy[11],
        canDelete: true,
      })
      this.getCourseFromDb(courseDbId).then((res) => {
        this.courses = this.storeHelper.current("courses")
    for (let i = 0; i < this.courses.length; i++) {    
      if (res.id === this.courses[i].id) {
        if (res.year !== this.courses[i].year || res.period !== this.courses[i].period) {
      this.storeHelper.findAndDelete("courses", this.courses[i].id)  
      this.storeHelper.add("courses", res)
        
      // Will change this code when I eventually understand the findAndUpdate part of the storehelper.
    
      }
    }
  }
    })
  })
}

  // Function that updates to the correct year and period when selecting to add a new semester
  private nextSemesterCheck() {
    if (this.semesters.length > 0) {
      let latestYear = this.semesters[this.semesters.length-1]['year']
      let latestPeriod = this.semesters[this.semesters.length-1]['period']

      switch (latestPeriod) {
        case 0:
          this.selectedPeriod = 1;
          this.selectedYear = latestYear;
          break
        case 1:
          this.selectedPeriod = 2;
          this.selectedYear = latestYear;
          break
        case 2:
          this.selectedPeriod = 0;
          this.selectedYear = latestYear + 1;
          break
      }
    }
  }

// Function that updates the correct year and period when deleting a semester

public updateSemesterCheck() {
  if (this.semesters.length > 0) {
    let latestYear = this.semesters[this.semesters.length-1]['year']
    let latestPeriod = this.semesters[this.semesters.length-1]['period']

    switch (latestPeriod) {
      case 0:
        this.selectedPeriod = 0;
        this.selectedYear = latestYear;
        break
      case 1:
        this.selectedPeriod = 1;
        this.selectedYear = latestYear;
        break
      case 2:
        this.selectedPeriod = 2;
        this.selectedYear = latestYear;
        break
    }
    }
}

}