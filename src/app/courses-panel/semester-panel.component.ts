import { Component, Input, ViewEncapsulation } from "@angular/core";
import { snapshotChanges } from "@angular/fire/database";
import { AngularFirestore } from "@angular/fire/firestore";
import { DragulaService } from "ng2-dragula";
import { DragulaModule } from "ng2-dragula";
import { type } from "os";
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable";
import { ICourse } from "../interfaces";
import { CourseStatus } from "../models";
import { CourseEventService, CourseService, StoreHelper } from "../services";
import { MatExpansionModule } from '@angular/material/expansion';
import { forEach } from "@angular/router/src/utils/collection";
import { NgbTooltip } from "@ng-bootstrap/ng-bootstrap";
import { CoursesPanel } from "./courses-panel.component";
import { HighlightSpanKind } from "typescript";

@Component({
  selector: "semester-panel",
  styles: [require("./semester-panel.component.scss")],
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'semester-panel.template.html'
})
export class SemesterPanel {
  @Input() private semester;
  @Input() private courses: ICourse[];


  private addingSemester = false;
  private MAX_POINTS = 80;
  private toggled = true;
  private bagName;
  private atMaxPoints;
  private gpa;
  private courseCounter: number;
  private email: string;
  private collapsed = false;
  private yearListArray = [];
  private periodListArray = [];
  private isDisabled = false;
  private savedNewSem;
  private savedNewYear;
  private previousYear;
  private previousPeriod;

  constructor(
    private courseService: CourseService,
    private courseEventService: CourseEventService,
    private dragulaService: DragulaService,
    private dragulaModule: DragulaModule,
    private storeHelper: StoreHelper,
    private db: AngularFirestore,
    private coursePanelService: CoursesPanel,
  ) {
    this.email = this.courseService.email;
  }

  private ngOnInit() {
    this.bagName = "courses";
    const bag = this.dragulaService.find(this.bagName);

    if (bag === undefined) {
      this.dragulaService.createGroup(this.bagName, {
        isContainer: (el) => el!.classList.contains("dragula-container"),
        moves: (el, source, handle, sibling) => {
          return !el!.hasAttribute("fake");
        },
      });
    }

    this.dragulaService.drop().subscribe((value: any) => {
      // need to handle event for this bag only! TODO and semester too?
      if (value.name === this.bagName) {
        this.onDropModel(value);
      }
    });

    this.dragulaService.remove().subscribe((value: any) => {
      this.onRemoveModel(value.slice(1));
    });

    const totalPoints = this.courses.reduce(
      (points, course) => points + course.points,
      0
    );
    this.atMaxPoints = totalPoints >= this.MAX_POINTS;

    this.courseCounter = this.courseService.courseCounter;
  }

  private onDropModel(args) {
    const [el, target, source] = args;

    // Extract all the info form the course and set it. The newPeriod and newYear are set from the target destination of the bag
    const droppedCourse = {
      id: Number(args.el.dataset.id),
      period: Number(args.el.dataset.period),
      year: Number(args.el.dataset.year),
      newPeriod: Number(args.target.attributes.period.value),
      newYear: Number(args.target.attributes.year.value),
    };
    // this logic is essentially saying only handle this for the semester that is not the same
    // as the semester the course started in.
    if (!this.sameTime(droppedCourse)) {
      // this index will be greater than one when a semester contains this course - this is waiting on model sync?
      let moveHere =
        this.courses.filter((course: ICourse) => {
          course.id === droppedCourse.id;
        }).length !== 0;
      moveHere = true;
      if (!moveHere) {
        console.error(
          `could not move course id: ${droppedCourse.id} to semester ${this.semester.id} `
        );
      } else {
        // this.semester.id =
        console.log(`onDropModel: moving to semester ${this.semester.period}`);
        this.droppedCourseSaveDB(droppedCourse);
        this.courseEventService.raiseCourseMoved({
          courseId: droppedCourse.id,
          period: droppedCourse.newPeriod,
          year: droppedCourse.newYear,
        });
      }
    } else {
    }
  }

  private ngOnChanges() {
    const courseGrades = this.courses
      .filter(
        (course: ICourse) =>
          course.status === CourseStatus.Completed &&
          course.grade !== undefined &&
          course.grade !== -42
      )
      .map((course: ICourse) => (course.grade < 0 ? 0 : course.grade));
    const failed = this.courses.filter(
      (course: ICourse) => course.status === CourseStatus.Failed
    ).length;
    this.gpa =
      courseGrades.reduce((gradeTotal, grade) => gradeTotal + grade, 0) /
      (courseGrades.length + failed);
  }

  private sameTime(course: any) {
    return (
      this.semester.year === Number(course.year) &&
      this.semester.period === Number(course.period)
    );
  }

  private onRemoveModel(args) {
    const [el, source] = args;
    el.dataset.id = Number(el.dataset.id);
    el.dataset.period = Number(el.dataset.period);
    el.dataset.year = Number(el.dataset.year);

    if (this.sameTime(el.dataset)) {
      this.courseEventService.raiseCourseRemoved({
        courseId: el.dataset.id,
        period: el.dataset.semester,
        year: el.dataset.year,
      });
    }
  }

  private collapse() {
    const collapsed = this.storeHelper.update("collapsed", !this.collapsed);
    this.collapsed = !this.collapsed;
  }

  private toggle() {
    this.toggled = !this.toggled;
  }

  private courseClicked(course: ICourse) {
    this.courseEventService.raiseCourseClicked({ course });
  }

  private droppedCourseSaveDB(course) {
    this.db
      .collection("users")
      .doc(this.email)
      .collection("courses", (ref) => {
        const query = ref.where("id", "==", String(course.id));
        query.get().then((snapshot) => {
          snapshot.forEach((doc) => {
            this.db
              .collection("users")
              .doc(this.email)
              .collection("courses")
              .doc(doc.id)
              .update({
                year: course.newYear,
                period: course.newPeriod,
              });
          });
        });
        return query;
      });
  }

  private deleteCourse(course: ICourse) {
    this.courseService.courseCounterOnDelete();
    if (this.sameTime(course)) {
      this.courseEventService.raiseCourseRemoved({
        courseId: course.id,
        period: course.period,
        year: course.year,
      });
    }
    this.db
      .collection("users")
      .doc(this.email)
      .collection("courses", (ref) => {
        const query = ref.where("id", "==", course.id);
        query.get().then((snapshot) => {
          snapshot.forEach((doc) => {
            this.db
              .collection("users")
              .doc(this.email)
              .collection("courses")
              .doc(doc.id)
              .delete();
          });
        });
        return query;
      });
  }

  private deleteSemester() {
    this.coursePanelService.updateSemesterCheck();
    this.courses.forEach((course: ICourse) =>
      this.courseService.deselectCourseByName(course.name)
    );
    let semesters = this.storeHelper.current("semesters");
    semesters = semesters.filter(
      (semester) =>
        semester.year !== this.semester.year ||
        semester.period !== this.semester.period
    );
    this.storeHelper.update("semesters", semesters);
  }

  private smallCourseStatusBar(course) {
    switch(course.status) {
      case 0: 
        return '#66bbff';
      case 1:
        return '#f3d602';
      case 2:
        return '#65cc01';
      case 3:
        return '#ff8087';
    }
  }

 private smallCourseStatusBarHover(course) {
   return course.name;
  }

  private newSemesterDD() {
    this.addingSemester = true;
    //this.coursePanelService.newSemester();
  }

  private expansionOnClick() {
    this.isDisabled = false;
    return this.isDisabled
  } 

  private noExpansionOnClick() {
    this.isDisabled = true;
    return this.isDisabled
  } 

  private yearList() {
    this.yearListArray = [];
    let i = new Date().getFullYear();
    while (i < 2030 ) {
      this.yearListArray.push(i)
      i++;
    }
    return this.yearListArray[0-9];

  }

  private periodList() {
    this.periodListArray = [];
    let i = 0;
    while (i < 3 ) {
      if ( i === 0) {
        this.periodListArray.push( "Summer School");
        i++;
      } else {
      this.periodListArray.push( "Semester " + i)
      i++;
      }
    }
    return this.periodListArray[0-2];
  }

  private getSelectedYear(i) {
    this.previousYear = this.semester.year;
    this.semester.year = i;
    //console.log(this.semester.year)

    this.saveChangedSemCourse(i)

  }

  private getSelectedSem(j) {
    this.previousPeriod = this.semester.period;
    let k;
    switch (j){
      case "Summer School":
        this.semester.period = 0;
        k = 0;
        break;
      case "Semester 1":
        this.semester.period = 1;
        k = 1;
        break;
      case "Semester 2":
        this.semester.period = 2;
        k = 2;
        break;
    }
    console.log(k)
    this.saveChangedSemCourse(k)

  }

  private updatePeriodsInCourse(period) {
    console.log("Updating course period " + period)
    return period;
  }

  private updateYearsInCourse(year) {
    console.log("Updating course year " + year)
    return year;

  }

  private saveChangedSemCourse(i) {
    let courses = this.storeHelper.current('courses')
   
  if (i < 10) {
    console.log(i)  
    this.savedNewSem = this.updatePeriodsInCourse(i)
  } else {
    console.log("not working period")
    this.savedNewSem = this.semester.period;
    this.previousPeriod = this.semester.period;
  }
  if (i > 10) {  
    this.savedNewYear = this.updateYearsInCourse(i)
  } else {
    console.log("not working year")
    this.savedNewYear = this.semester.year;
    this.previousYear = this.semester.year;
  }
  
  for (let j = 0; j < courses.length; j++) {  
    this.db
      .collection("users")
      .doc(this.email)
      .collection("courses", (ref) => {
        const query = ref.where("id", "==", String(courses[j].id));
        query.get().then((snapshot) => {
          snapshot.forEach((doc) => {
           if (courses[j].year === this.previousYear && courses[j].period === this.previousPeriod){ 
           console.log("Is Firing")  
            this.db
              .collection("users")
              .doc(this.email)
              .collection("courses")
              .doc(doc.id)
              .update({
                year: this.savedNewYear,
                period: this.savedNewSem,
              });
            }
          });
        });
        return query;
      });
    }
  }


}
