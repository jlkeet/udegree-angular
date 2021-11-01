import { Component, Input } from "@angular/core";
import { snapshotChanges } from "@angular/fire/database";
import { AngularFirestore } from "@angular/fire/firestore";
import { DragulaService } from "ng2-dragula";
import { DragulaModule } from "ng2-dragula";
import { ICourse } from "../interfaces";
import { CourseStatus } from "../models";
import { CourseEventService, CourseService, StoreHelper } from "../services";

@Component({
  selector: "semester-panel",
  styles: [
    `
      .title {
        background: white;
        font-size: 20px;
        font-family: "Open Sans", sans-serif;
        border-radius: 5px;
        height: 80px;
        padding-right: 0px;
        padding-left: 30px;
      }
      .semester-panel {
        background: white;
        margin-bottom: 10px;
        border: 1px solid #eee;
        border-radius: 5px;
        padding-left: 0px;
      }
      .delete {
        margin-right: 20px;
        cursor: pointer;
        font-size: 50px;
        font-weight: bold;
        color: #e1e7e9;
        width: 31px;
        height: 31px;
      }

      .cross {
        display: none;
      }

      .semester-panel:hover .cross {
        display: block;
      }

      .semester-courses {
        display: flex;
        align-items: center;
        padding-left: 30px;
        width: 100%;
      }
      .courses {
        height: 120px;
      }
      .fakecourse {
        order: 99;
        width: 190px;
        height: 100px;
        border: 1px dashed;
        border-radius: 5px;
        display: flex;
        cursor: pointer;
        font-size: 15px;
        font-weight: bold;
      }
      .position-text {
        margin: auto;
      }
    `,
  ],
  template: `
    <div class="semester-panel">
      <mat-toolbar class="title">
        {{ semester.year }}
        {{
          semester.period === 0
            ? "Summer School"
            : "Semester " + semester.period
        }}
        <span *ngIf="gpa"> &nbsp; &mdash; GPA {{ gpa.toFixed(2) }} </span>
        <span class="spacer"> </span>

        <span class="delete no-select" (click)="deleteSemester()">
          <span class="cross"> &times; </span>
        </span>
        <!--
      <span class="toggle" (click)="toggle()">
        {{ toggled ? '&ndash;' : '+' }}
      </span>
      -->
      </mat-toolbar>

      <div *ngIf="toggled" class="courses">
        <div class="flex dragula-container">
          <div
            class="semester-courses"
            [dragula]="bagName"
            [dragulaModel]="courses"
            [attr.period]="semester.period"
            [attr.year]="semester.year"
          >
            <course-draggable
              *ngFor="let course of courses; let i = index"
              (deleteCourseClicked)="deleteCourse(course)"
              (courseClicked)="courseClicked(course)"
              [course]="course"
              [attr.data-id]="course.id"
              [attr.data-period]="semester.period"
              [attr.data-year]="semester.year"
            ></course-draggable>
            <div
              fake
              *ngIf="!atMaxPoints"
              class="fakecourse"
              [routerLink]="['/add']"
              [queryParams]="{ period: semester.period, year: semester.year }"
            >
              <div class="position-text">+ ADD COURSE</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SemesterPanel {
  @Input() private semester;
  @Input() private courses: ICourse[];

  private MAX_POINTS = 80;
  private toggled = true;
  private bagName;
  private atMaxPoints;
  private gpa;
  private courseCounter: number;

  constructor(
    private courseService: CourseService,
    private courseEventService: CourseEventService,
    private dragulaService: DragulaService,
    private dragulaModule: DragulaModule,
    private storeHelper: StoreHelper,
    private db: AngularFirestore
  ) {}

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
      if (value[0] === this.bagName) {
        this.onDropModel(value.slice(1));
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
    const droppedCourse = {
      id: Number(el.dataset.id),
      period: Number(el.dataset.period),
      year: Number(el.dataset.year),
    };
    // this logic is essentially saying only handle this for the semester that is not the same
    // as the semester the course started in.
    if (!this.sameTime(droppedCourse)) {
      // this index will by greater than one when a semester contains this course - this is waiting on model sync?
      const moveHere =
        this.courses.filter((course: ICourse) => course.id === droppedCourse.id)
          .length !== 0;
      if (!moveHere) {
        // console.error(`could not move course id: ${droppedCourse.id} to semester ${this.semester.id} `);
      } else {
        // console.log(`onDropModel: moving to semester ${this.semester.id}`);
        this.courseEventService.raiseCourseMoved({
          courseId: droppedCourse.id,
          period: this.semester.period,
          year: this.semester.year,
        });
      }
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

  private toggle() {
    this.toggled = !this.toggled;
  }

  private courseClicked(course: ICourse) {
    this.courseEventService.raiseCourseClicked({ course });
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
      .doc("jackson.keet@mac.com")
      .collection("courses", (ref) => {
        const query = ref.where("id", "==", course.id);
        query.get().then((snapshot) => {
          snapshot.forEach((doc) => {
            this.db
              .collection("users")
              .doc("jackson.keet@mac.com")
              .collection("courses")
              .doc(doc.id)
              .delete();
          });
        });
        return query;
      });
  }

  private deleteSemester() {
    this.courses.forEach((course: ICourse) =>
      this.courseService.deselectCourseByName(course.name),
    );
    let semesters = this.storeHelper.current("semesters");
    semesters = semesters.filter(
      (semester) =>
        semester.year !== this.semester.year ||
        semester.period !== this.semester.period
    );
    this.storeHelper.update("semesters", semesters);
  }
}
