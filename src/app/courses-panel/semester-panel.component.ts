import { Component, Input, EventEmitter, Output, ViewEncapsulation, ElementRef, ViewChild } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { DragulaService } from "ng2-dragula";
import { DragulaModule } from "ng2-dragula";
import { ICourse } from "../interfaces";
import { CourseStatus } from "../models";
import { CourseEventService, CourseService, StoreHelper } from "../services";
import { CoursesPanel } from "./courses-panel.component";
import { Router } from "@angular/router";
import { UserContainer } from "../common";
import{ GoogleAnalyticsService } from '../services/google-analytics.service';
import { FirebaseDbService } from "../core/firebase.db.service";

@Component({
  selector: "semester-panel",
  styleUrls: [require("./semester-panel.component.scss")],
  encapsulation: ViewEncapsulation.None,
  templateUrl: "semester-panel.template.html",
})

export class SemesterPanel {
  @ViewChild('autoscroll') autoscroll: ElementRef;
  @Input() public semester;
  @Input() public courses: ICourse[];

  public addingSemester = false;
  public MAX_POINTS = 80;
  public toggled = true;
  public bagName;
  public atMaxPoints;
  public gpa;
  public courseCounter: number;
  public email: string;
  public collapsed = false;
  public yearListArray = [];
  public periodListArray = [];
  public isDisabled = false;
  public savedNewSem;
  public savedNewYear;
  public previousYear;
  public previousPeriod;
  public semcheck = {};
  public boolCheck = true;
  public onPageChange = new EventEmitter<null>();

  public course;

  constructor(
    public courseService: CourseService,
    public courseEventService: CourseEventService,
    public dragulaService: DragulaService,
    public dragulaModule: DragulaModule,
    public storeHelper: StoreHelper,
    public db: AngularFirestore,
    public coursePanelService: CoursesPanel,
    public router: Router,
    public userContainer: UserContainer,
    public googleAnalyticsService: GoogleAnalyticsService,
    public dbCourses: FirebaseDbService,
  ) {
    this.email = this.courseService.email;
    
  }

  public ngOnInit() {

        // // AutoScroll
        // setTimeout(() => {
        //   let scroll = autoScroll([
        //     this.autoscroll.nativeElement,
        //   ], {
        //       margin: 20,
        //       maxSpeed: 5,
        //       scrollWhenOutside: true,
        //       autoScroll: function () {
        //         //Only scroll when the pointer is down.
        //         return this.down;
        //         //return true;
        //       }
        //     });
        // }, 3000);

    this.bagName = "courses";
    const bag = this.dragulaService.find(this.bagName);

    // if (bag === undefined) {
    //   this.dragulaService.createGroup(this.bagName, {
    //     isContainer: (el) => el!.classList.contains("dragula-container"),
    //     moves: (el, source, handle, sibling) => {
    //     if (this.userContainer.isMobile) {  
    //       if (this.course) {
    //         return this.course.dragIt;
    //       } else {
    //         return false;
    //       }
    //     } else {
    //       return !el!.hasAttribute("fake");
    //     }
    //     },
    //   });
    // }

    if (bag === undefined) {
      this.dragulaService.createGroup(this.bagName, {
        isContainer: (el) => el!.classList.contains("dragula-container"),
        moves: (el, source, handle, sibling) => {
        if (this.userContainer.isMobile) {  
          return handle.className === 'handle';
        } else {
          return !el!.hasAttribute("fake");
        }
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
  }

  public onDropModel(args) {
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

  public ngOnChanges() {
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

      const totalPoints = this.courses.reduce(
        (points, course) => points + course.points,
        0
      );
      this.atMaxPoints = totalPoints >= this.MAX_POINTS;
  
      this.courseCounter = this.courseService.courseCounter;
  }

  public sameTime(course: any) {
    return (
      this.semester.year === Number(course.year) &&
      this.semester.period === Number(course.period)
    );
  }

  public onRemoveModel(args) {
    const [el, source] = args;
    el.dataset.id = Number(el.dataset.id);
    el.dataset.period = Number(el.dataset.period);
    el.dataset.year = Number(el.dataset.year);

    if (this.sameTime(el.dataset)) {
      this.courseEventService.raiseCourseRemoved({
        course: el.dataset.name,
        courseId: el.dataset.id,
        period: el.dataset.semester,
        year: el.dataset.year,
      });
    }
  }

  public collapse() {
    const collapsed = this.storeHelper.update("collapsed", !this.collapsed);
    this.collapsed = !this.collapsed;
  }

  public toggle() {
    this.toggled = !this.toggled;
  }

  public courseClicked(course: ICourse) {
    this.courseEventService.raiseCourseClicked({ course });
  }

  public longCourseClicked(course: ICourse) {
    this.courseEventService.raiseLongCourseClicked({ course })
    this.course = course


    // let bag = this.dragulaService.find(this.bagName)

    // if (bag !== undefined) {
    //   this.dragulaService.destroy(this.bagName);

    //   this.dragulaService.createGroup(this.bagName, {
    //     isContainer: (el) => el!.classList.contains("dragula-container"),
    //     moves: (el, source, handle, sibling) => {
    //     if (this.userContainer.isMobile) {  
    //       if (this.course) {
    //         return this.course.dragIt;
    //       } else {
    //         return false;
    //       }
    //     } else {
    //       return !el!.hasAttribute("fake");
    //     }
    //     },
    //   });
    // }
  }

  public droppedCourseSaveDB(course) {
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
              .update({
                year: course.newYear,
                period: course.newPeriod,
              });
          });
        });

        return query;
      });
  }

  public deleteCourse(course: ICourse) {
    this.courseService.courseCounterOnDelete();
    if (this.sameTime(course)) {
      this.courseEventService.raiseCourseRemoved({
        course: course,
        courseId: course.id,
        period: course.period,
        year: course.year,
      });
    }
    this.db
      .collection("users")
      .doc(this.email)
      .collection("courses", (ref) => {
        const query = ref.where("generatedId", "==", course.generatedId);
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

  public deleteSemester() {
    this.coursePanelService.updateSemesterCheck();
    this.courses.forEach((course: ICourse) =>
      this.courseService.deselectCourseByName(course)
    );
    let semesters = this.storeHelper.current("semesters");
    semesters = semesters.filter(
      (semester) =>
        semester.year !== this.semester.year ||
        semester.period !== this.semester.period
    );
    this.storeHelper.update("semesters", semesters);
    this.delSemDB();
    setTimeout(() => {
      this.semesterSort();
    }, 1000);

    this.dbCourses.setAuditLogDeleteSemester(semesters);
  }

  public smallCourseStatusBar(course) {
    switch (course.status) {
      case 0:
        return "#66bbff";
      case 1:
        return "#f3d602";
      case 2:
        return "#65cc01";
      case 3:
        return "#ff8087";
    }
  }

  public smallCourseStatusBarHover(course) {
    return course.name;
  }

  public newSemesterDD() {
    this.addingSemester = true;
    //this.coursePanelService.newSemester();
  }

  public expansionOnClick() {
    this.isDisabled = false;
    return this.isDisabled;
  }

  public noExpansionOnClick() {
    this.isDisabled = true;
    return this.isDisabled;
  }

  public yearList() {
    this.yearListArray = [];
   // let i = new Date().getFullYear();
    let i = 2010
    while (i < 2030) {
      this.yearListArray.push(i);
      i++;
    }
    return this.yearListArray[0 - 9];
  }

  public periodList() {
    this.periodListArray = [];
    let i = 0;
    while (i < 3) {
      if (i === 0) {
        this.periodListArray.push("Summer School");
        i++;
      } else {
        this.periodListArray.push("Semester " + i);
        i++;
      }
    }
    this.periodListArray.forEach( (item, index) => {
      if(item === "Semester " + this.semester.period || item === "Summer School" && this.semester.period === 0)  this.periodListArray.splice(index,1);
    });
    return this.periodListArray[0 - 2];
  }

  public getSelectedYear(i) {
    
    this.previousYear = this.semester.year;
    this.semester.year = i;
    this.saveChangedSemCourse(i);
  }

  public getSelectedSem(j) {
    this.previousPeriod = this.semester.period;
    let k;
    switch (j) {
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
    this.saveChangedSemCourse(k);
  }

  public updatePeriodsInCourse(period) {
    return period;
  }

  public updateYearsInCourse(year) {
    return year;
  }

  public saveChangedSemCourse(i) {

    this.boolCheck = true;
    let courses = this.storeHelper.current("courses");
    if (i < 10) {
      this.savedNewSem = this.updatePeriodsInCourse(i);
    } else {
      this.savedNewSem = this.semester.period;
      this.previousPeriod = this.semester.period;
    }
    if (i > 10) {
      this.savedNewYear = this.updateYearsInCourse(i);
    } else {
      this.savedNewYear = this.semester.year;
      // this.previousYear = this.semester.year;
    }

    this.semcheck = {
      year: Number(this.savedNewYear),
      period: Number(this.savedNewSem),
    };

    this.checkIfArrayIsUnique(this.storeHelper.current("semesters"))

    if (this.boolCheck) {
      for (let j = 0; j < courses.length; j++) {
        this.db
          .collection("users")
          .doc(this.email)
          .collection("courses", (ref) => {
            const query = ref.where("id", "==", String(courses[j].id));
            query.get().then((snapshot) => {
              snapshot.forEach((doc) => {
                if (
                  courses[j].year === this.previousYear &&
                  courses[j].period === this.previousPeriod
                ) { // move this to the changesemdb function
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
  
      this.changeSemDB()
      this.semesterSort();
    }
  }

  public semesterSort() {
    this.storeHelper
      .current("semesters")
      .sort((s1, s2) =>
        s1.year === s2.year ? s1.period - s2.period : s1.year - s2.year
      );
    this.coursePanelService.loadPlanFromDbAfterDel();
    return this.storeHelper.update("courses", this.coursePanelService.courses);
  }

  public delSemDB() {
    this.db.collection("users").doc(this.email).collection("semesters", ref => {
      const query = ref.where('both', '==', this.semester.year + " " + this.semester.period);
      query.get().then( snapshot => {
        snapshot.forEach(sem => {
          this.db
          .collection("users")
          .doc(this.email)
          .collection("semesters")
          .doc(sem.id)
          .delete()
         })
        }
      )
    return query
    })
  }

  public changeSemDB() {

    this.db.collection("users").doc(this.email).collection("semesters", ref => {
      const query = ref.where('both', '==', this.previousYear + " " + this.previousPeriod);
      query.get().then( snapshot => {
        snapshot.forEach(sem => {
          this.db
          .collection("users")
          .doc(this.email)
          .collection("semesters")
          .doc(sem.id)
          .update({
            year: this.savedNewYear,
            period: this.savedNewSem,
            both: this.savedNewYear + " " + this.savedNewSem
          });
         })
        }
      )
    return query
    })

  }

  // This is fucked - can be optimized

  public checkIfArrayIsUnique(myArray) 
  {
      for (var i = 0; i < myArray.length; i++) 
      {
          for (var j = 0; j < myArray.length; j++) 
          {
              if (i != j) 
              {
                  if (myArray[i].period === myArray[j].period && myArray[i].year === myArray[j].year) 
                  {
                      return this.boolCheck = false; // means there are duplicate values
                  }
              }
          }
      }
      return this.boolCheck = true; // means there are no duplicate values.
  }

  newCourseEvent(){ 
    this
    .googleAnalyticsService
    .eventEmitter("new_course", "semester-panel", "course", "click", 10);
  } 

}
